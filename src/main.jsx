import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import './styles/index.css'
import App from './App.jsx'
import { store } from './store/store'
import { fetchCurrentUser } from './store/authSlice'
import { ThemeProvider } from './context/ThemeContext.jsx' 

// Rehidratamos la sesión apenas arranca la app: si la cookie HttpOnly sigue
// viva, /auth/me devolverá el usuario. Lo despachamos antes del render para que
// las rutas protegidas vean isLoading=true y no redirijan a login durante un F5.
store.dispatch(fetchCurrentUser())

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <ThemeProvider>
        <App />
        </ThemeProvider>
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)
