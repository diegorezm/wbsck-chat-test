use std::collections::{HashMap, VecDeque};
use std::sync::Arc;
use tokio::sync::RwLock;

use chrono::DateTime;

#[derive(serde::Serialize, Clone, Debug)]
pub struct Message {
    pub user: String,
    pub text: String,
    pub date: DateTime<chrono::Utc>,
}

pub type RoomStore = HashMap<String, VecDeque<Message>>;

#[derive(Default)]
pub struct MessageStore {
    pub messages: Arc<RwLock<RoomStore>>,
}

impl MessageStore {
    pub async fn insert(&self, room: &String, message: Message) {
        let mut binding = self.messages.write().await;
        let messages = binding.entry(room.clone()).or_default();
        messages.push_front(message);
        messages.truncate(20);
    }

    pub async fn get(&self, room: &String) -> VecDeque<Message> {
        let binding = self.messages.read().await;
        binding.get(room).map_or_else(VecDeque::new, |messages| {
            messages.iter().rev().cloned().collect()
        })
    }
}

// Implement Clone for MessageStore
impl Clone for MessageStore {
    fn clone(&self) -> Self {
        MessageStore {
            messages: Arc::clone(&self.messages), // Clone the Arc
        }
    }
}
