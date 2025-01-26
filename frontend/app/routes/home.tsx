import {useEffect, useState, type FormEvent} from "react";
import type {Route} from "./+types/home";
import {cn} from "~/lib/util";
import {Message} from "~/components/message";
import {io} from "socket.io-client";
import {useUser} from "~/providers/user-provider";

export function meta({}: Route.MetaArgs) {
  return [
    {title: "Chatapp"},
    {name: "description", content: "Welcome to React Router!"},
  ];
}

const rooms: RoomStore = {
  "#general": [],
  "#coding": [],
  "#art": [],
  "#movies": [],
};

export default function Home({}: Route.ComponentProps) {
  const [currentRoom, setCurrentRoom] = useState("#general");
  const [socket, setSocket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const {username, logout} = useUser();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State for sidebar visibility

  const scrollToLastMessage = () => {
    const chatContainer = document.getElementById("chat-messages") as HTMLDivElement
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight
    }
  }

  useEffect(() => {
    scrollToLastMessage();
  }, [messages]);

  useEffect(() => {
    const newSocket = io("ws://localhost:3000");

    newSocket.on("connect", () => {
      console.log("Client connected!");
      newSocket.emit("join", currentRoom);
    });

    newSocket.on("message", (message: any) => {
      console.log(message);
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket) {
      socket.emit("join", currentRoom);
      setMessages(rooms[currentRoom] ?? []);
    }
  }, [currentRoom, socket]);

  const newMessage = (e: FormEvent) => {
    try {
      e.preventDefault();
      if (!socket) {
        console.error("No socket connection open!");
        return;
      }
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      const content = formData.get("content")?.toString() || "";
      if (content.length === 0) {
        console.log("message: " + content);
        console.error("Invalid message!");
        return;
      }

      socket.emit("message", {
        text: content,
        room: currentRoom,
        user: username,
      });

      form.reset();
    } catch (e) {
      console.error(e)
    }
  };

  return (
    <main className="flex h-screen bg-base-200">
      {/* Hamburger Menu Button (Mobile Only) */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed z-50 p-2 rounded-lg shadow-md top-4 left-4 lg:hidden bg-base-100"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Sidebar */}
      <nav
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 p-4 border-r lg:z-0 lg:static bg-base-100 border-base-300 transform transition-transform duration-200 ease-in-out",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <h1 className="mb-4 text-xl font-bold">Chat Rooms</h1>
        <ul className="flex-1 space-y-2">
          {Object.keys(rooms).map((room, index) => (
            <li key={index}>
              <button
                onClick={() => {
                  setCurrentRoom(room);
                  setIsSidebarOpen(false);
                }}
                className={cn(
                  "w-full btn btn-sm",
                  currentRoom === room ? "btn-primary" : "btn-ghost"
                )}
              >
                <span className="text-sm font-medium">{room}</span>
              </button>
            </li>
          ))}
        </ul>

        {/* Username Section */}
        <div className="pt-4 mt-4 border-t border-base-300">
          <p className="text-sm text-base-content/70">Logged in as:</p>
          <p className="text-lg font-semibold">{username}</p>
          <button
            onClick={logout}
            className="w-full mt-2 btn btn-sm btn-error"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Overlay for Mobile (Closes Sidebar When Clicked) */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
        ></div>
      )}

      <div className="flex flex-col flex-1">
        <header className="p-4 border-b bg-base-100 border-base-300">
          <h2 className="ml-16 text-lg font-semibold lg:ml-0">{currentRoom}</h2>
        </header>

        {/* Chat Messages */}
        <div className="flex-1 p-4 overflow-y-auto" id="chat-messages">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-2xl font-bold text-red-300">
                No messages yet!
              </div>
            )}
            {messages.map((e, i) => (
              <Message message={e} key={i + 1} />
            ))}
          </div>
        </div>

        {/* Chat Input */}
        <footer className="p-4 border-t bg-base-100 border-base-300">
          <form className="flex items-center space-x-2" onSubmit={newMessage}>
            <input
              type="text"
              placeholder="Type a message..."
              name="content"
              id="content"
              className="flex-1 w-full input input-bordered"
              min={1}
              max={500}
            />
            <button className="btn btn-primary">Send</button>
          </form>
        </footer>
      </div>
    </main>
  );
}
