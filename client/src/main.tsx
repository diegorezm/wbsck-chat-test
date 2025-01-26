import App from './App.tsx'

import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import {SocketProvider} from "./providers/socket-provider.tsx"
import {UserProvider} from "./providers/user-provider.tsx"
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SocketProvider>
      <UserProvider>
        <App />
      </UserProvider>
    </SocketProvider>
  </StrictMode>,
)
