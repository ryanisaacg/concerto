use std::sync::atomic::{AtomicU32, Ordering};

use futures_util::{SinkExt, StreamExt};
use tokio::{
    net::{TcpListener, TcpStream},
    sync::broadcast,
};
use tokio_tungstenite::{accept_async, tungstenite::Message};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let addr = "127.0.0.1:9003";
    let listener = TcpListener::bind(&addr).await?;
    eprintln!("Listening on 9003");

    let (ping_sender, _) = broadcast::channel(1024);

    while let Ok((stream, _)) = listener.accept().await {
        let sender = ping_sender.clone();
        tokio::spawn(async move { client_task(stream, sender).await.unwrap() });
    }

    Ok(())
}


static CLIENT_ID: AtomicU32 = AtomicU32::new(0);

async fn client_task(
    stream: TcpStream,
    sender: broadcast::Sender<(u32, String)>,
) -> anyhow::Result<()> {
    let client_id = CLIENT_ID.fetch_add(1, Ordering::Relaxed);

    let mut receiver = sender.subscribe();

    let ws_stream = accept_async(stream).await?;
    let (mut ws_send, mut ws_recv) = ws_stream.split();


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

