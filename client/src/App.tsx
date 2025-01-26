import {useEffect, useState, useRef} from "react";
import {useUser} from "./providers/user-provider";
import {Sidebar} from "./components/sidebar";
import {ChatHeader} from "./components/chat-header";
import {ChatMessages} from "./components/chat-messages";
import {ChatInput} from "./components/chat-input";
import {useSocket} from "./providers/socket-provider";

const rooms: RoomStore = {
  "#general": [],
  "#coding": [],
  "#art": [],
  "#movies": [],
};

export default function App() {
  const {socket} = useSocket();
  const [currentRoom, setCurrentRoom] = useState("#general");
  const [messages, setMessages] = useState<any[]>([]);
  const {username} = useUser();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [usersTyping, setUsersTyping] = useState<string[]>([]);
  const typingTimer = useRef<NodeJS.Timeout | null>(null);

  const scrollToLastMessage = () => {
    const chatContainer = document.getElementById("chat-messages");
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  };

  const handleInputChange = () => {
    if (!socket) return;

    // Clear the existing timer
    if (typingTimer.current) {
      clearTimeout(typingTimer.current);
    }

    // Emit "is-typing" event
    socket.emit("is-typing", {room: currentRoom, user: username});

    // Set a new timer to emit "stop-typing" after 2 seconds of inactivity
    typingTimer.current = setTimeout(() => {
      socket.emit("stop-typing", {room: currentRoom, user: username});
    }, 2000);
  };

  const handleSendMessage = (message: string) => {
    if (!socket || !message.trim()) return;

    // Emit the message
    socket.emit("message", {
      text: message,
      room: currentRoom,
      user: username,
    });

    // Emit "stop-typing" to indicate that the user stopped typing
    socket.emit("stop-typing", {room: currentRoom, user: username});

    // Clear the timer
    if (typingTimer.current) {
      clearTimeout(typingTimer.current);
    }
  };

  useEffect(() => {

    const handleTyping = (data: string[]) => {
      console.log("Users typing:", data);
      setUsersTyping(data); // Update the list of users typing
    };

    const handleStoppedTyping = (data: string[]) => {
      console.log("Users stopped typing:", data);
      setUsersTyping(data); // Update the list of users typing
    };


    socket.on("typing", handleTyping);
    socket.on("stopped-typing", handleStoppedTyping);

    // Cleanup event listeners
    return () => {
      socket.off("typing");
      socket.off("stopped-typing");
    };
  }, [socket, usersTyping]);

  useEffect(() => {
    socket.emit("join", currentRoom);
    socket.on("message", (message: any) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });
    return () => {
      socket.off("message");
    };
  }, [socket, currentRoom]);

  useEffect(() => {
    scrollToLastMessage();
  }, [messages]);

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
      <Sidebar
        currentRoom={currentRoom}
        rooms={rooms}
        isSidebarOpen={isSidebarOpen}
        onRoomChange={setCurrentRoom}
        onCloseSidebar={() => setIsSidebarOpen(false)}
      />

      {/* Typing Indicator */}
      {/* Overlay for Mobile (Closes Sidebar When Clicked) */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
        ></div>
      )}

      <div className="flex flex-col flex-1">
        <ChatHeader currentRoom={currentRoom} />

        <ChatMessages messages={messages} />


        <div>
          {usersTyping
            .filter((e) => e !== username) // Filter out the current user
            .map((user, index) => (
              <div key={index} className="px-4 text-sm text-neutral-200">
                {user} is typing...
              </div>
            ))}
        </div>

        <ChatInput
          onSubmit={handleSendMessage}
          onTyping={handleInputChange}
        />
      </div>
    </main>
  );
}
