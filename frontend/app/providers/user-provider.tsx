import React, {createContext, useContext, useState, useEffect, type ReactNode, type FormEvent} from "react";

interface UserContextType {
  username: string | null;
  setUsername: (username: string) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

export const UserProvider = ({children}: {children: ReactNode}) => {
  const [username, setUsernameState] = useState<string | null>(null);

  useEffect(() => {
    const savedUsername = localStorage.getItem("username");
    if (savedUsername) {
      setUsernameState(savedUsername);
    }
  }, []);

  const setUsername = (newUsername: string) => {
    localStorage.setItem("username", newUsername);
    setUsernameState(newUsername);
  };

  const logout = () => {
    localStorage.removeItem("username");
    setUsernameState(null)

  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    const username = formData.get("username")?.toString() || ""
    if (username.length < 2 || username.length > 256) {
      alert("Username cannot have less than 2 characters or more than 256")
      return
    }
    setUsername(username)
    form.reset()
  }

  return (
    <UserContext.Provider value={{username, setUsername, logout}}>
      {children}
      {username === null && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <form onSubmit={onSubmit}>
              <label className="w-full form-control">
                <div className="label">
                  <span className="label-text">Please pick a username!</span>
                </div>
                <input type="text" placeholder="Type here" className="w-full input input-bordered" name="username" min={2} max={256} />
                <div className="label">
                  <span className="label-text-alt">You need a username to use this app!</span>
                </div>
              </label>
              <div className="modal-action">
                <button className="btn">Save</button>
              </div>
            </form>
          </div>
        </dialog>
      )}
    </UserContext.Provider>
  );
};
