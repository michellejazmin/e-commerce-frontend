import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { esAdmin, logoutUser } from "../store/authSlice";
import { resetCartState } from "../store/cartSlice";
import { useCart } from "../store/hooks/useCart";
import { useTheme } from "../context/ThemeContext";
import "../styles/Navbar.css";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // Estado de sesión desde Redux.
  const logueado = useSelector((state) => state.auth.isAuthenticated);
  const isAdmin = useSelector(esAdmin);
  const { cartItems } = useCart();

  const { theme, toggleTheme } = useTheme();

  const isActive = (path) => location.pathname === path;
  const closeMenu = () => setMenuOpen(false);

  const handleLogout = async () => {
    // Cerramos sesión en el backend (borra la cookie) y limpiamos el estado.
    await dispatch(logoutUser());
    dispatch(resetCartState());
    closeMenu();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          RecetaMarket
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <button
            className="theme-toggle"
            type="button"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            title={theme === "dark" ? "Modo claro" : "Modo oscuro"}
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>

          <button
            className="hamburger"
            type="button"
            aria-label="Abrir menú"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

        <ul className={menuOpen ? "nav-menu nav-open" : "nav-menu"}>
          <li>
            <Link
              to="/"
              className={isActive("/") ? "nav-link active" : "nav-link"}
              onClick={closeMenu}
            >
              Inicio
            </Link>
          </li>
          <li>
            <Link
              to="/catalogo"
              className={isActive("/catalogo") ? "nav-link active" : "nav-link"}
              onClick={closeMenu}
            >
              Catálogo
            </Link>
          </li>

          {!logueado && (
            <>
              <li>
                <Link
                  to="/login"
                  className={isActive("/login") ? "nav-link active" : "nav-link"}
                  onClick={closeMenu}
                >
                  Iniciar sesión
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className={isActive("/register") ? "nav-link active" : "nav-link"}
                  onClick={closeMenu}
                >
                  Registrarse
                </Link>
              </li>
            </>
          )}

          {logueado && (
            <>
              <li>
                <Link
                  to="/favoritos"
                  className={isActive("/favoritos") ? "nav-link active" : "nav-link"}
                  onClick={closeMenu}
                >
                  Favoritos
                </Link>
              </li>
              <li>
                <Link
                  to="/carrito"
                  className={isActive("/carrito") ? "nav-link active" : "nav-link"}
                  onClick={closeMenu}
                >
                  🛒 Carrito ({cartItems.length})
                </Link>
              </li>
              <li>
                <Link
                  to="/mis-compras"
                  className={isActive("/mis-compras") ? "nav-link active" : "nav-link"}
                  onClick={closeMenu}
                >
                  Mis compras
                </Link>
              </li>
              <li>
                <Link
                  to="/perfil"
                  className={isActive("/perfil") ? "nav-link active" : "nav-link"}
                  onClick={closeMenu}
                >
                  Mi perfil
                </Link>
              </li>

              {isAdmin && (
                <li>
                  <Link
                    to="/admin"
                    className={isActive("/admin") ? "nav-link active" : "nav-link"}
                    onClick={closeMenu}
                  >
                    Admin
                  </Link>
                </li>
              )}

              <li>
                <button className="nav-link nav-logout" onClick={handleLogout}>
                  Cerrar sesión
                </button>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
