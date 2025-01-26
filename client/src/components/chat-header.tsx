interface ChatHeaderProps {
  currentRoom: string;
}

export function ChatHeader({currentRoom}: ChatHeaderProps) {
  return (
    <header className="p-4 border-b bg-base-100 border-base-300">
      <h2 className="ml-16 text-lg font-semibold lg:ml-0">{currentRoom}</h2>
    </header>
  );
}
