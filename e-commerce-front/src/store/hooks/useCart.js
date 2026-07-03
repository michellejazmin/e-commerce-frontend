import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCart,
  addItemToCart,
  updateItemQuantity,
  removeItemFromCart,
  clearCartApi,
  selectCartItems,
  selectCartTotal,
  selectCartLoading,
  selectCartError,
} from "../cartSlice";

export function useCart() {
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);
  const loading = useSelector(selectCartLoading);
  const error = useSelector(selectCartError);
  // Estado de sesión desde Redux (rehidratado vía cookie).
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  // Cuando hay sesión iniciada, cargamos el carrito desde el backend.
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [dispatch, isAuthenticated]);

  // Agrega un producto al carrito. Resolvemos el recetaId desde las distintas
  // formas en que llega (receta del catálogo o item del carrito).
  const addToCart = useCallback(
    (product) => {
      const recetaId = product.recetaId ?? product.idReceta ?? product.id;
      return dispatch(addItemToCart({ recetaId, cantidad: 1 })).unwrap();
    },
    [dispatch],
  );

  // Suma 1 unidad a un item del carrito (PATCH con la cantidad nueva).
  const increaseQuantity = useCallback(
    (item) => {
      dispatch(updateItemQuantity({ detalleId: item.id, cantidad: item.cantidad + 1 }));
    },
    [dispatch],
  );

  // Resta 1 unidad; si llega a 0 o menos, elimina el item del carrito.
  const decreaseQuantity = useCallback(
    (item) => {
      if (item.cantidad <= 1) {
        dispatch(removeItemFromCart(item.id));
        return;
      }
      dispatch(updateItemQuantity({ detalleId: item.id, cantidad: item.cantidad - 1 }));
    },
    [dispatch],
  );

  const removeFromCart = useCallback(
    (detalleId) => {
      dispatch(removeItemFromCart(detalleId));
    },
    [dispatch],
  );

  const clearCart = useCallback(() => {
    dispatch(clearCartApi());
  }, [dispatch]);

  return {
    cartItems,
    total,
    loading,
    error,
    addToCart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
  };
}
