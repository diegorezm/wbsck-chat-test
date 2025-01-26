use std::collections::{HashMap, HashSet, VecDeque};
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
pub type UsersTypingStore = HashMap<String, HashSet<String>>;

#[derive(Default, Clone)]
pub struct GlobalAppState {
    pub messages: Arc<RwLock<RoomStore>>,
    pub users_typing: Arc<RwLock<UsersTypingStore>>,
}

impl GlobalAppState {
    pub async fn insert_message(&self, room: &String, message: Message) {
        let mut binding = self.messages.write().await;
        let messages = binding.entry(room.clone()).or_default();
        messages.push_front(message);
        messages.truncate(20);
    }

    pub async fn get_messages(&self, room: &String) -> VecDeque<Message> {
        let binding = self.messages.read().await;
        binding.get(room).map_or_else(VecDeque::new, |messages| {
            messages.iter().rev().cloned().collect()
        })
    }

    pub async fn insert_typing_user(&self, room: &String, user: String) {
        let mut binding = self.users_typing.write().await;
        let users_typing = binding.entry(room.clone()).or_default();
        users_typing.insert(user);
    }

    pub async fn remove_typing_user(&self, room: &String, user: String) {
        let mut binding = self.users_typing.write().await;
        if let Some(users_typing) = binding.get_mut(room) {
            users_typing.remove(&user);
        }
    }

    pub async fn get_typing_users(&self, room: &String) -> Vec<String> {
        let binding = self.users_typing.read().await;
        binding
            .get(room)
            .map_or_else(Vec::new, |u| u.iter().cloned().collect())
    }
}
