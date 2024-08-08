use std::{
    collections::VecDeque,
    sync::{
        atomic::{AtomicU32, Ordering},
        Arc,
    },
};

use futures_util::{SinkExt, StreamExt};
use tokio::{
    net::{TcpListener, TcpStream},
    sync::{broadcast, RwLock},
};
use tokio_tungstenite::{accept_async, tungstenite::Message};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let addr = "0.0.0.0:80";
    let listener = TcpListener::bind(&addr).await?;
    eprintln!("Listening on 80");

    let (ping_sender, mut buffer_recv) = broadcast::channel(1024);

    let buffer: Arc<RwLock<VecDeque<(u32, String)>>> = Arc::new(RwLock::new(VecDeque::new()));

    let buf = buffer.clone();
    tokio::spawn(async move {
        loop {
            let message = buffer_recv.recv().await.unwrap();
            let mut buf_write = buf.write().await;
            buf_write.push_back(message);
            if buf_write.len() > BUF_LEN_THRESHHOLD {
                buf_write.pop_front();
            }
        }
    });

    eprintln!("Accepting connections");
    while let Ok((stream, _)) = listener.accept().await {
        eprintln!("Accepted TCP connection");
        let sender = ping_sender.clone();
        let buffer = buffer.clone();
        tokio::spawn(async move { client_task(stream, sender, buffer).await.unwrap() });
    }

    Ok(())
}

const BUF_LEN_THRESHHOLD: usize = 1024;
static CLIENT_ID: AtomicU32 = AtomicU32::new(0);

async fn client_task(
    stream: TcpStream,
    sender: broadcast::Sender<(u32, String)>,
    old_message_buffer: Arc<RwLock<VecDeque<(u32, String)>>>,
) -> anyhow::Result<()> {
    let client_id = CLIENT_ID.fetch_add(1, Ordering::Relaxed);

    let mut receiver = sender.subscribe();

    let ws_stream = accept_async(stream).await?;
    eprintln!("Accepted new weboscket {client_id}");
    let (mut ws_send, mut ws_recv) = ws_stream.split();

    for (sender_id, ping) in old_message_buffer.read().await.iter() {
        if *sender_id != client_id {
            ws_send.send(Message::Text(ping.clone())).await.unwrap();
        }
    }

    tokio::spawn(async move {
        loop {
            let (sender_id, ping) = receiver.recv().await.unwrap();
            eprintln!("Recv {sender_id}: {ping}");
            if sender_id != client_id {
                ws_send.send(Message::Text(ping)).await.unwrap();
            }
        }
    });

    loop {
        while let Some(message) = ws_recv.next().await {
            let Message::Text(message) = message? else {
                unreachable!()
            };
            sender.send((client_id, message))?;
        }
    }
}
