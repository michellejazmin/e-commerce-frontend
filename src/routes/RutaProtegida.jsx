import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { esAdmin } from '../store/authSlice';

const RutaProtegida = ({ children, soloAdmin = false }) => {
  // Estado de sesión desde Redux (rehidratado vía fetchCurrentUser con la cookie).
  const { isAuthenticated, isLoading } = useSelector((state) => state.auth);
  const isAdmin = useSelector(esAdmin);

  // Mientras se rehidrata la sesión inicial no decidimos todavía: evitamos
  // redirigir a login por error durante un F5.
  if (isLoading) {
    return <div className="catalog-state">Cargando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si la ruta requiere admin pero el usuario no lo es, mostramos un error.
  if (soloAdmin && !isAdmin) {
    return (
      <div style={{ padding: '2rem', color: 'red' }}>
        ⛔ No tenés permiso para acceder a esta sección.
      </div>
    );
  }

  return children;
};

export default RutaProtegida;
