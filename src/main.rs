mod state;

use axum::routing::get;
use socketioxide::{
    extract::{Data, SocketRef, State},
    SocketIo,
};
use tokio::net::TcpListener;
use tower::ServiceBuilder;
use tower_http::cors::CorsLayer;
use tracing::info;
use tracing_subscriber::FmtSubscriber;

#[derive(Debug, serde::Deserialize)]
struct MessageIn {
    user: String,
    room: String,
    text: String,
}

#[derive(Debug, serde::Serialize, serde::Deserialize)]
struct TypingIn {
    user: String,
    room: String,
}
#[derive(serde::Serialize)]
struct Messages {
    messages: Vec<state::Message>,
}

async fn on_connect(socket: SocketRef) {
    info!("socket connected: {}", socket.id);

    socket.on(
        "is-typing",
        |socket: SocketRef, Data::<TypingIn>(data), state: State<state::GlobalAppState>| async move {
            info!("User {} is typing", data.user);
            state.insert_typing_user(&data.room, data.user).await;
            let response = state.get_typing_users(&data.room).await;
            info!("Users typing: {:?}", response);

            // Broadcast the updated typing list to all users in the room
            let _ = socket.emit("typing", &response);
        },
    );

    socket.on(
        "stop-typing",
        |socket: SocketRef, Data::<TypingIn>(data), state: State<state::GlobalAppState>| async move {
            info!("User {} stopped typing", data.user);
            state.remove_typing_user(&data.room, data.user).await;
            let response = state.get_typing_users(&data.room).await;
            info!("Users typing: {:?}", response);

            // Broadcast the updated typing list to all users in the room
            let _ = socket.emit("stopped-typing", &response);
        },
    );

    socket.on(
        "join",
        |socket: SocketRef, Data::<String>(room), store: State<state::GlobalAppState>| async move {
            info!("Received join: {:?}", room);
            socket.leave_all();
            socket.join(room.clone());
            let messages = store.get_messages(&room).await.into();
            let _ = socket.emit("messages", &Messages { messages });
        },
    );

    socket.on(
        "message",
        |socket: SocketRef, Data::<MessageIn>(data), store: State<state::GlobalAppState>| async move {
            info!("Received message: {:?}", data);

            let response = state::Message {
                text: data.text,
                user: data.user,
                date: chrono::Utc::now(),
            };

            store.insert_message(&data.room, response.clone()).await;

            // Broadcast the message to all users in the room
            let _ = socket.emit("message", &response);
        },
    );
}

async fn handler(axum::extract::State(io): axum::extract::State<SocketIo>) {
    info!("handler called");
    let _ = io.emit("hello", "world").await;
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing::subscriber::set_global_default(FmtSubscriber::default())?;

    let messages = state::GlobalAppState::default();

    let (layer, io) = SocketIo::builder().with_state(messages).build_layer();

    io.ns("/", on_connect);

    let app = axum::Router::new()
        .route("/", get(|| async { "Hello, World!" }))
        .route("/hello", get(handler))
        .with_state(io)
        .layer(
            ServiceBuilder::new()
                .layer(CorsLayer::permissive())
                .layer(layer),
        );

    info!("Starting server");

    let listener = TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();

    Ok(())
}
