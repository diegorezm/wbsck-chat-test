import {useState, type FormEvent} from "react";

interface ChatInputProps {
  onSubmit: (message: string) => void;
  onTyping: () => void;
}

export function ChatInput({onSubmit, onTyping}: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSubmit(message);
      setMessage("");
    }
  };

  return (
    <footer className="p-4 border-t bg-base-100 border-base-300">
      <form className="flex items-center space-x-2" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            onTyping();
          }}
          className="flex-1 w-full input input-bordered"
          min={1}
          max={500}
        />
        <button className="btn btn-primary">Send</button>
      </form>
    </footer>
  );
}
