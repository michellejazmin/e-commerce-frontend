import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import "./styles/App.css";
// import { AuthProvider } from './features/auth/context/AuthContext'
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import RutaProtegida from "./routes/RutaProtegida";
import RecetaList from "./catalogoDeProductos/RecetaList";
import RecetaDetalle from "./catalogoDeProductos/RecetaDetalle";
import Favorite from "./catalogoDeProductos/Favorite";
import Cart from "./catalogoDeProductos/Cart";
import MisCompras from "./catalogoDeProductos/MisCompras";
import UserLogin from "./gestionDeUsuarios/UserLogin";
import UserRegister from "./gestionDeUsuarios/UserRegister";
import UserProfile from "./gestionDeUsuarios/UserProfile";
import AdminRecetas from "./panelAdmin/AdminRecetas";
import { Toaster } from 'react-hot-toast'; // Corrección aquí: lleva llaves

function App() {
  // useLocation funciona porque el <BrowserRouter> ahora envuelve a <App /> en main.jsx.
  // Detectamos si estamos en la home para aplicarle la clase "home-content" (fondo crema + ancho completo).
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    // <AuthProvider>
    <div className="app-wrapper">
      {/* Navbar siempre visible en todas las páginas */}
      <Navbar />

      <main className={isHome ? "main-content home-content" : "main-content"}>
        {/* aquí se definen todas las rutas o links de la app, que luego serán usadas en diferentes componentes */}
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Hero />
                <RecetaList variant="home" />
              </>
            }
          />
          <Route path="/catalogo" element={<RecetaList />} />
          <Route path="/recetas/:id" element={<RecetaDetalle />} />
          <Route path="/login" element={<UserLogin />} />
          <Route path="/register" element={<UserRegister />} />

          {/* Rutas protegidas: requieren sesión iniciada */}
          <Route
            path="/favoritos"
            element={
              <RutaProtegida>
                <Favorite />
              </RutaProtegida>
            }
          />
          <Route
            path="/favoritos/:id"
            element={
              <RutaProtegida>
                <Favorite />
              </RutaProtegida>
            }
          />
          <Route
            path="/carrito"
            element={
              <RutaProtegida>
                <Cart />
              </RutaProtegida>
            }
          />
          <Route
            path="/mis-compras"
            element={
              <RutaProtegida>
                <MisCompras />
              </RutaProtegida>
            }
          />
          <Route
            path="/perfil"
            element={
              <RutaProtegida>
                <UserProfile />
              </RutaProtegida>
            }
          />
          <Route
            path="/admin"
            element={
              <RutaProtegida soloAdmin>
                <AdminRecetas />
              </RutaProtegida>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer siempre visible */}
      <footer className="footer">
        <div>
          <strong>RecetaMarket</strong>
          <p>© 2024 RecetaMarket. Sabores artesanales en tu hogar.</p>
        </div>
        <nav aria-label="Enlaces secundarios">
          <a href="#">Privacidad</a>
          <a href="#">Términos</a>
          <a href="#">Contacto</a>
          <a href="#">Preguntas Frecuentes</a>
        </nav>
      </footer>

      {/* Agregá el Toaster al final, antes de cerrar el div principal */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          // Estilo por defecto (éxito)
          style: {
            background: '#e6f9ef',
            color: '#27ae60', // Tu --color-success
            border: '1px solid #b7e4c7',
            fontWeight: 'bold',
            fontFamily: 'sans-serif',
            padding: '12px 20px',
            borderRadius: '10px'
          },
          success: {
            iconTheme: {
              primary: '#27ae60',
              secondary: '#e6f9ef',
            },
          },
          // Estilo personalizado para cuando se quita algo
          error: {
            style: {
              background: '#fde8e8',
              color: '#e74c3c', // Tu --color-danger
              border: '1px solid #f5c6c6',
            },
            iconTheme: {
              primary: '#e74c3c',
              secondary: '#fde8e8',
            },
          }
        }}
      />
    </div>
    // </AuthProvider>
  );
}

export default App;