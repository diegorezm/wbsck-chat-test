import {cn} from "~/lib/util"
import {useUser} from "~/providers/user-provider"

export function Message({message}: {message: Message}) {
  const {username} = useUser()
  const date = new Date(message.date)
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "numeric",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
  return (
    <div className="flex items-start space-x-3">
      <div className="avatar placeholder">
        <div className="w-8 rounded-full bg-neutral text-neutral-content">
          <span className="text-lg">{message.user.charAt(0).toUpperCase()}</span>
        </div>
      </div>
      <div className="flex-1">
        <div className="p-3 rounded-lg bg-base-100">
          <p className={cn("text-xs text-clip",
            username === message.user ? "text-primary" : "text-neutral-400"
          )}>{message.user}</p>
          <p className="text-sm">{message.text}</p>
          <span className="text-xs text-base-content/50">{formattedDate}</span>
        </div>
      </div>
    </div>
  )
}
