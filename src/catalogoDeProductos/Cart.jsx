// Importamos componentes de routing.
import { memo } from "react";
import { Link, useNavigate } from "react-router-dom";
// useDispatch para despachar el thunk de crear pedido.
import { useDispatch } from "react-redux";
// Importamos nuestro custom hook para acceder al store del carrito.
import { useCart } from "../store/hooks/useCart";
// Thunk para registrar el pedido al finalizar la compra.
import { createPedido } from "../store/pedidosSlice";
import toast from "react-hot-toast";

const CartItem = memo(function CartItem({ item, onDecrease, onIncrease, onRemove }) {
  return (
    <article
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
        <h3 style={{ margin: 0 }}>{item.nombre ?? "Sin nombre"}</h3>
        <p style={{ margin: "4px 0", color: "var(--color-text-muted)" }}>
          Precio unitario: ${Number(item.precio ?? 0).toLocaleString("es-AR")}
        </p>
        <p style={{ margin: 0, fontWeight: "bold" }}>
          Subtotal: ${Number(item.subtotal ?? 0).toLocaleString("es-AR")}
        </p>
      </div>

      <div className="cart-quantity-controls">
        <div className="quantity-selector-pill">
          <button className="cart-btn-qty" onClick={() => onDecrease(item)}>-1</button>
          <span className="quantity-text"> {item.cantidad}</span>
          <button className="cart-btn-qty" onClick={() => onIncrease(item)}>+1</button>
        </div>

        <button className="cart-btn-remove" onClick={() => onRemove(item.id)}>
          Quitar
        </button>
      </div>
    </article>
  );
});

// --- COMPONENTE CONSUMIDOR: PÁGINA DEL CARRITO ---
// Este componente muestra los productos agregados al carrito, permite modificar
// cantidades, quitarlos, vaciarlo y "finalizar la compra".
function Cart() {
  // Usamos el hook `useCart` para obtener el estado y las funciones del carrito.
  const {
    cartItems,
    total,
    loading,
    error,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
  } = useCart();
  // useNavigate para redirigir al catálogo / mis compras desde los botones.
  const navigate = useNavigate();
  // useDispatch para despachar el thunk de crear pedido.
  const dispatch = useDispatch();

  // Finaliza la compra: crea el pedido en el backend, vacía el carrito y redirige.
  const handleFinalizarCompra = async () => {
    try {
      await dispatch(createPedido({ total, cartItems })).unwrap();
      clearCart();
      toast.success("¡Compra realizada con éxito! 🎉");
      navigate("/mis-compras");
    } catch (err) {
      toast.error(`No se pudo finalizar la compra: ${err}`);
    }
  };

  // Estado de carga (patrón del profe).
  if (loading) {
    return (
      <section className="catalog-section">
        <div className="catalog-state">Cargando carrito...</div>
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

  // Renderizado condicional: si el carrito está vacío, mostramos un mensaje.
  if (cartItems.length === 0) {
    return (
      <section className="catalog-section">
        <div className="catalog-heading">
          <h1>🛒 Mi carrito</h1>
        </div>
        <div className="catalog-empty">
          Tu carrito está vacío.
          <button
            className="btn-empty-state"
            onClick={() => navigate("/catalogo")}
          >
            Ver catálogo
          </button>
        </div>
      </section>
    );
  }

  // Renderizamos la lista de productos del carrito.
  return (
    <section className="catalog-section">
      <div className="catalog-heading">
        <div>
          <p className="section-kicker">Tu compra</p>
          <h1>🛒 Mi carrito</h1>
        </div>
        <p>
          {cartItems.length}{" "}
          {cartItems.length === 1 ? "producto" : "productos"} en el carrito
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {/* Recorremos los items del carrito con .map */}
        {cartItems.map((item) => (
          <CartItem
            key={item.id}
            item={item}
            onDecrease={decreaseQuantity}
            onIncrease={increaseQuantity}
            onRemove={removeFromCart}
          />
        ))}
      </div>

      {/* Sección de total y acciones finales */}
      <div
        style={{
          marginTop: "24px",
          padding: "16px",
          borderTop: "2px solid #333",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>Total: ${Number(total ?? 0).toLocaleString("es-AR")}</h2>
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="cart-btn-clear" onClick={clearCart}>Vaciar carrito</button>
          <button
            onClick={handleFinalizarCompra}
            style={{
              background: "#2a9d8f",
              color: "white",
              padding: "10px 20px",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Finalizar compra
          </button>
        </div>
      </div>

      <div style={{ marginTop: "24px" }}>
        <Link className="cart-link-back" to="/catalogo">← Seguir comprando</Link>
      </div>
    </section>
  );
}

// Exportamos el componente para usarlo en otras partes de la aplicación.
export default Cart;
