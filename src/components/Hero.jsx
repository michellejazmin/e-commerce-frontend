import "../styles/Hero.css";
import { useNavigate } from "react-router-dom";

function Hero() {
  const navigate = useNavigate();

  return (
    <section className="hero">
      <div className="hero-content">
        <p className="hero-kicker">Recetas artesanales listas para disfrutar</p>
        <h1 className="hero-title">
          Descubrí nuevos sabores sin complicarte en la cocina
        </h1>
        <p className="hero-sub">
          Elegí recetas caseras, comprá los ingredientes que necesitás y prepará
          platos ricos con instrucciones simples, precios claros y mucho sabor.
        </p>

        <div className="hero-actions">
          <button className="hero-cta" onClick={() => navigate("/catalogo")}>
            Ver catálogo
          </button>
          <button
            className="hero-cta hero-cta-secondary"
            onClick={() => navigate("/register")}
          >
            Crear cuenta
          </button>
        </div>

        <div className="hero-highlights" aria-label="Beneficios">
          <span>Recetas verificadas</span>
          <span>Ingredientes simples</span>
          <span>Compra rápida</span>
        </div>
      </div>

      <div className="hero-visual" aria-hidden="true">
        <div className="hero-recipe-card">
          <div className="hero-card-header">
            <span>
              <span className="hero-card-dot"></span>
              Receta destacada
            </span>
            <strong>+120 recetas</strong>
          </div>
          <div className="hero-plate">
            <img
              src="/risotto.webp"
              alt="Risotto cremoso de estación"
              style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "inherit" }}
            />
          </div>
          <h2>Risotto cremoso de estación</h2>
          <p className="hero-meta">
            ◷ Listo en 35 min <span></span>▥ Nivel fácil
          </p>
          <div className="hero-card-footer">
            <div className="hero-rating">☆ ☆ ☆ ☆ ☆</div>
            <button type="button" aria-label="Agregar receta">+</button>
          </div>
        </div>
        <div className="hero-floating-badge">
          <span>Por porción</span>
          Desde $4.500
        </div>
      </div>
    </section>
  );
}

export default Hero;
