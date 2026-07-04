import { useState } from "react";
import { Link } from "react-router-dom";

const UserRegister = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    contrasenia: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Error al registrar el usuario");
      }

      setSuccess(true);
      setFormData({ nombre: "", apellido: "", email: "", contrasenia: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-shell auth-shell-register">
        <aside className="auth-aside auth-aside-register" aria-hidden="true">
          <p className="section-kicker">Sumate a RecetaMarket</p>
          <h2>Creá tu cuenta y empezá a descubrir recetas caseras.</h2>
          <div className="auth-steps">
            <span>1. Elegí una receta</span>
            <span>2. Revisá ingredientes</span>
            <span>3. Cociná sin vueltas</span>
          </div>
          <div className="auth-plate">
            <span>🍝</span>
          </div>
        </aside>

        <div className="auth-card">
          <div className="auth-header">
            <p className="section-kicker">Crear cuenta</p>
            <h1>Registrarse</h1>
            <p>Completá tus datos para guardar recetas y comprar más rápido.</p>
          </div>

          {error && <div className="auth-alert auth-alert-error">Error: {error}</div>}
          {success && (
            <div className="auth-alert auth-alert-success">
              ¡Registro exitoso! Ya podés iniciar sesión.
            </div>
          )}

          <form className="auth-form" onSubmit={handleRegister}>
            <div className="auth-grid">
              <label>
                Nombre
                <input
                  type="text"
                  name="nombre"
                  placeholder="Tu nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Apellido
                <input
                  type="text"
                  name="apellido"
                  placeholder="Tu apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                  required
                />
              </label>
            </div>

            <label>
              Correo electrónico
              <input
                type="email"
                name="email"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Contraseña
              <input
                type="password"
                name="contrasenia"
                placeholder="Creá una contraseña"
                value={formData.contrasenia}
                onChange={handleChange}
                required
              />
            </label>

            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? "Registrando..." : "Crear cuenta"}
            </button>
          </form>

          <p className="auth-switch">
            ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default UserRegister;
