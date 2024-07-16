use std::time::SystemTime;

use futures_util::{SinkExt, StreamExt};
use serde::{Deserialize, Serialize};
use tokio::{
    net::{TcpListener, TcpStream},
    sync::broadcast,
};
use tokio_tungstenite::{accept_async, tungstenite::Message};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let addr = "127.0.0.1:9003";
    let listener = TcpListener::bind(&addr).await?;

    let (ping_sender, _) = broadcast::channel(1024);

    while let Ok((stream, _)) = listener.accept().await {
        let sender = ping_sender.clone();
        tokio::spawn(async move { client_task(stream, sender).await.unwrap() });
    }

    Ok(())
}

async fn client_task(
    stream: TcpStream,
    sender: broadcast::Sender<ServerPing>,
) -> anyhow::Result<()> {
    let mut receiver = sender.subscribe();

    let ws_stream = accept_async(stream).await?;
    let (mut ws_send, mut ws_recv) = ws_stream.split();

    // TODO: start by dumping back catalog of values

    tokio::spawn(async move {
        loop {
            let ping = receiver.recv().await.unwrap();
            let ping = serde_json::to_string(&ping).unwrap();
            ws_send.send(Message::Text(ping)).await.unwrap();
        }
    });

    loop {
        let Some(Ok(Message::Text(initial))) = ws_recv.next().await else {
            panic!("initial message must be join")
        };
        let JoinMessage { id, coords }: JoinMessage = serde_json::from_str(&initial)?;
        while let Some(message) = ws_recv.next().await {
            let note: Note = match message?.to_text()? {
                "C" => Note::C,
                "C#" => Note::CSharp,
                "D" => Note::D,
                "D#" => Note::DSharp,
                "E" => Note::E,
                "F" => Note::F,
                "F#" => Note::FSharp,
                "G" => Note::G,
                "G#" => Note::GSharp,
                "A" => Note::A,
                "A#" => Note::ASharp,
                "B" => Note::B,
                _ => unimplemented!(),
            };
            sender.send(ServerPing {
                id: id.clone(),
                coords,
                timestamp: SystemTime::now()
                    .duration_since(SystemTime::UNIX_EPOCH)
                    .unwrap()
                    .as_millis() as f64,
                note,
            })?;
        }
    }
}

#[derive(Copy, Clone, Debug, Deserialize, Serialize)]
struct LatLong {
    lat: f64,
    long: f64,
}

#[derive(Debug, Deserialize, Serialize)]
struct JoinMessage {
    id: String,
    coords: LatLong,
}

#[derive(Copy, Clone, Debug, Deserialize, Serialize)]
enum Note {
    C,
    #[serde(rename = "C#")]
    CSharp,
    D,
    #[serde(rename = "D#")]
    DSharp,
    E,
    F,
    #[serde(rename = "F#")]
    FSharp,
    G,
    #[serde(rename = "G#")]
    GSharp,
    A,
    #[serde(rename = "A#")]
    ASharp,
    B,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
struct ServerPing {
    id: String,
    coords: LatLong,
    timestamp: f64,
    note: Note,
}
