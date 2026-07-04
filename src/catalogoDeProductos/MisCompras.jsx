// Hooks de React y Redux.
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
// Thunks y selectores del slice de pedidos.
import {
  fetchPedidos,
  deletePedido,
  selectPedidos,
  selectPedidosLoading,
  selectPedidosError,
} from "../store/pedidosSlice";

// --- PÁGINA: MIS COMPRAS ---
// Lista los pedidos del usuario logueado y permite eliminarlos.
function MisCompras() {
  const [confirmandoId, setConfirmandoId] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const pedidos = useSelector(selectPedidos);
  const loading = useSelector(selectPedidosLoading);
  const error = useSelector(selectPedidosError);

  // Al montar, cargamos los pedidos del usuario.
  useEffect(() => {
    dispatch(fetchPedidos());
  }, [dispatch]);

  const handleEliminar = (id) => {
    if (confirmandoId === id) {
      dispatch(deletePedido(id));
      setConfirmandoId(null);
    } else {
      setConfirmandoId(id);
    }
  };

  // Estado de carga (patrón del profe).
  if (loading) {
    return (
      <section className="catalog-section">
        <div className="catalog-state">Cargando tus compras...</div>
      </section>
    );
  }

  // Estado de error.
  if (error) {
    return (
      <section className="catalog-section">
        <div className="catalog-state catalog-state-error">Error: {error}</div>
      </section>
    );
  }

  return (
    <section className="catalog-section">
      <div className="catalog-heading">
        <div>
          <p className="section-kicker">Historial</p>
          <h1>🧾 Mis compras</h1>
        </div>
        <p>
          {pedidos.length} {pedidos.length === 1 ? "pedido" : "pedidos"} realizados
        </p>
      </div>

      {pedidos.length === 0 ? (
        <div className="catalog-empty">
          Todavía no realizaste ninguna compra.
          <button
            className="btn-empty-state"
            onClick={() => navigate("/catalogo")}
          >
            Ver catálogo
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {pedidos.map((pedido) => (
            <article
              key={pedido.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px",
                border: "1px solid #eee",
                borderRadius: "8px",
                background: "#fff",
              }}
            >
              <div>
                <h3 style={{ margin: 0 }}>Pedido #{pedido.id}</h3>
                <p style={{ margin: "4px 0", color: "var(--color-text-muted)" }}>
                  Fecha: {pedido.fecha}
                </p>
                <p style={{ margin: 0, fontWeight: "bold" }}>
                  Total: ${Number(pedido.total ?? 0).toLocaleString("es-AR")}
                </p>
              </div>

              {confirmandoId === pedido.id ? (
                <>
                  <span style={{ color: "var(--color-danger)", fontSize: "14px" }}>¿Seguro?</span>
                  <button className="btn-fav-remove" onClick={() => handleEliminar(pedido.id)}>
                    Sí, eliminar
                  </button>
                  <button onClick={() => setConfirmandoId(null)}>Cancelar</button>
                </>
              ) : (
                <button className="btn-fav-remove" onClick={() => handleEliminar(pedido.id)}>
                  Eliminar
                </button>
              )}
            </article>
          ))}
        </div>
      )}

      <div style={{ marginTop: "24px" }}>
        <Link className="cart-link-back" to="/catalogo">← Seguir comprando</Link>
      </div>
    </section>
  );
}

export default MisCompras;