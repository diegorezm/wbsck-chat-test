import {cn} from "../lib/util";
import {useUser} from "../providers/user-provider";

interface SidebarProps {
  currentRoom: string;
  rooms: Record<string, any>;
  isSidebarOpen: boolean;
  onRoomChange: (room: string) => void;
  onCloseSidebar: () => void;
}

export function Sidebar({
  currentRoom,
  rooms,
  isSidebarOpen,
  onRoomChange,
  onCloseSidebar,
}: SidebarProps) {
  const {username, logout} = useUser();

  return (
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
                onRoomChange(room);
                onCloseSidebar();
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
  );
}
