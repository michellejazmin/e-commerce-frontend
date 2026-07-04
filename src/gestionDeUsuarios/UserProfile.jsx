import React, { useEffect, useState } from "react";
import fetchConAuth from "../utils/fetchConAuth";

const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // La sesión viaja en la cookie HttpOnly: fetchConAuth la adjunta solo.
        const response = await fetchConAuth(
          "http://localhost:8080/api/usuarios/perfil",
        );

        if (!response.ok) {
          throw new Error("Error al cargar el perfil del usuario");
        }

        const data = await response.json();
        setProfile(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <div>Cargando perfil...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!profile) return <div>No se encontró la información del perfil.</div>;

  return (
    <div style={{
      background: "var(--color-surface)", padding: "2rem", borderRadius: "8px",
      border: "1px solid var(--color-border)"
    }}>
      <h1>Mi Perfil</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <p>
          <strong>Nombre:</strong> {profile.nombre}
        </p>
        <p>
          <strong>Apellido:</strong> {profile.apellido}
        </p>
        <p>
          <strong>Email:</strong> {profile.email}
        </p>
      </div>

      <hr style={{ margin: "2rem 0" }} />

      <h2>Mis Recetas Compradas</h2>
      {/* Aquí podrías mapear las recetas asociadas al usuario de manera similar a ProductList */}
      <p style={{ color: "var(--color-text-muted)" }}>Aún no has adquirido ninguna receta.</p>
    </div>
  );
};

export default UserProfile;
