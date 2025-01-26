type Message = {
  user: string;
  text: string;
  date: string;
}

type MessageIn = {
  txt: string;
  room: string;
}

type Room = string;

type RoomStore = Record<Room, Message[]>

type ServerToClientEvents = {
  message: (message: Message) => void;
  connect: () => void
}

type ClientToServerEvents = {
  join: (room: string) => void;
  message: (message: Message) => void;
}
