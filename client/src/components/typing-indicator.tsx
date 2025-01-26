type Props = {
  usersTyping: string[],
  username: string
}

export function TypingIndicator({usersTyping, username}: Props) {
  return (
    <div>
      {usersTyping.map((e, i) => {
        if (e === username) return null;
        return (
          <div key={i} className="text-sm text-base-100">
            {e} is typing...
          </div>
        )
      })}
    </div>
  );
}
