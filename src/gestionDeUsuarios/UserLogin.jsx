import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { loginUser, fetchCurrentUser, selectAuth } from "../store/authSlice";

const UserLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector(selectAuth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(loginUser({ email, password })).unwrap();
      await dispatch(fetchCurrentUser()).unwrap();
      navigate("/catalogo");
    } catch (err) {
      // el error ya queda en Redux state
    }
  };

  return (
    <div style={{
      maxWidth: "400px", margin: "4rem auto", padding: "2rem",
      background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "8px"
    }}>
      <h1>Iniciar sesión</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              display: "block", width: "100%", padding: "8px", marginTop: "4px",
              border: "1px solid var(--color-border)", borderRadius: "4px",
              background: "var(--color-bg)", color: "var(--color-text)"
            }}
          />
        </div>
        <div>
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              display: "block", width: "100%", padding: "8px", marginTop: "4px",
              border: "1px solid var(--color-border)", borderRadius: "4px",
              background: "var(--color-bg)", color: "var(--color-text)"
            }}
          />
        </div>

        {error && (
          <p style={{ color: "var(--color-danger)", margin: 0 }}>{error}</p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          style={{
            padding: "10px", background: "var(--color-primary)", color: "white",
            border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold"
          }}
        >
          {isLoading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>

      <p style={{ marginTop: "1rem", textAlign: "center" }}>
        ¿No tenés cuenta? <Link to="/register">Registrate</Link>
      </p>
    </div>
  );
};

export default UserLogin;
