import {Message} from "./message";

interface ChatMessagesProps {
  messages: any[];
}

export function ChatMessages({messages}: ChatMessagesProps) {
  return (
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
  );
}
