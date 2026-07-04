import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import fetchConAuth from "../utils/fetchConAuth";
import { loadIngredients, loadRecipeProductMap } from "../utils/catalogStore";

const API_BASE = "http://localhost:8080/api";

// --- Helpers ---------------------------------------------------------------

// Mapea un CarritoDetalleDTO del backend al shape que usa el front.
const mapDetalle = (detalle) => ({
  id: detalle.id,
  recetaId: detalle.recetaId,
  nombre: detalle.recetaNombre,
  precio: detalle.recetaPrecio,
  cantidad: detalle.cantidad,
  subtotal: detalle.precioTotal,
});

// Mapea un CarritoDTO completo al shape del state.
const mapCarrito = (carrito) => ({
  cartId: carrito.id,
  cartItems: (carrito.detalles ?? []).map(mapDetalle),
  precioTotal: carrito.precioTotal ?? 0,
});

// Obtiene el usuarioId desde GET /api/usuarios/perfil.
const fetchUsuarioId = async () => {
  const response = await fetchConAuth(`${API_BASE}/usuarios/perfil`);
  if (!response.ok) {
    throw new Error("No se pudo obtener el perfil del usuario");
  }
  const perfil = await response.json();
  return perfil.idUsuario;
};

const calcularIngredientesRequeridos = async (cartItems) => {
  const [ingredients, recipeProductMap] = await Promise.all([loadIngredients(), loadRecipeProductMap()]);

  const ingredientById = new Map(
    (Array.isArray(ingredients) ? ingredients : []).map((ingredient) => [String(ingredient.id), ingredient]),
  );
  const requiredByIngredient = new Map();

  for (const item of Array.isArray(cartItems) ? cartItems : []) {
    const recipeProducts = recipeProductMap[String(item.recetaId)] ?? [];
    const recipeQuantity = Number(item.cantidad ?? 1);

    for (const product of recipeProducts) {
      const ingredientId = product.ingredienteId ?? product.id;
      const ingredientQuantity = Number(product.cantidad ?? 0) * recipeQuantity;

      if (ingredientId == null || ingredientQuantity <= 0) {
        continue;
      }

      const currentRequired = requiredByIngredient.get(String(ingredientId)) ?? 0;
      requiredByIngredient.set(String(ingredientId), currentRequired + ingredientQuantity);
    }
  }

  return [...requiredByIngredient.entries()].map(([ingredientId, requiredQuantity]) => {
    const ingredient = ingredientById.get(ingredientId);

    if (!ingredient) {
      throw new Error(`No se encontró el ingrediente ${ingredientId}`);
    }

    const stockDisponible = Number(ingredient.stock ?? 0);

    return {
      ingredient,
      requiredQuantity,
      stockDisponible,
      faltaStock: stockDisponible < requiredQuantity,
    };
  });
};

const validarStockParaReceta = async ({ recetaId, cantidad = 1, cartItems = [] }) => {
  const itemsActuales = Array.isArray(cartItems) ? cartItems : [];
  const itemsProyectados = [...itemsActuales.filter((item) => String(item.recetaId) !== String(recetaId))];

  itemsProyectados.push({
    recetaId,
    cantidad: Number(cantidad ?? 1),
  });

  const requerimientos = await calcularIngredientesRequeridos(itemsProyectados);
  const ingredienteSinStock = requerimientos.find((requerimiento) => requerimiento.faltaStock);

  if (ingredienteSinStock) {
    throw new Error(
      `No hay stock suficiente para ${ingredienteSinStock.ingredient.nombre ?? "uno de los ingredientes"}`,
    );
  }

  return requerimientos;
};

// --- Thunks ----------------------------------------------------------------

// a) Obtiene el carrito del usuario logueado; si no existe (404) lo crea.
export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue }) => {
    try {
      const usuarioId = await fetchUsuarioId();

      let response = await fetchConAuth(`${API_BASE}/carritos/usuario/${usuarioId}`);

      // Si el carrito no existe todavía, lo creamos con POST.
      if (response.status === 404) {
        response = await fetchConAuth(`${API_BASE}/carritos`, {
          method: "POST",
          body: JSON.stringify({ usuarioId }),
        });
      }

      if (!response.ok) {
        throw new Error("No se pudo obtener el carrito");
      }

      const carrito = await response.json();
      return mapCarrito(carrito);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

// b) Agrega un item al carrito. Si no hay carrito en el state, lo carga primero.
export const addItemToCart = createAsyncThunk(
  "cart/addItemToCart",
  async ({ recetaId, cantidad = 1 }, { getState, dispatch, rejectWithValue }) => {
    try {
      const currentItem = getState().cart.cartItems.find((item) => String(item.recetaId) === String(recetaId));

      await validarStockParaReceta({
        recetaId,
        cantidad: Number(currentItem?.cantidad ?? 0) + Number(cantidad ?? 1),
        cartItems: getState().cart.cartItems,
      });

      let cartId = getState().cart.cartId;

      // Si todavía no tenemos carrito, lo obtenemos/creamos.
      if (!cartId) {
        const result = await dispatch(fetchCart()).unwrap();
        cartId = result.cartId;
      }

      const response = await fetchConAuth(`${API_BASE}/carritos/${cartId}/recetas`, {
        method: "POST",
        body: JSON.stringify({ recetaId, cantidad }),
      });

      if (!response.ok) {
        throw new Error("No se pudo agregar la receta al carrito");
      }

      const carrito = await response.json();
      return mapCarrito(carrito);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

// c) Actualiza la cantidad de un detalle (cantidad va como query param).
export const updateItemQuantity = createAsyncThunk(
  "cart/updateItemQuantity",
  async ({ detalleId, cantidad }, { getState, rejectWithValue }) => {
    try {
      const cartId = getState().cart.cartId;
      const currentItem = getState().cart.cartItems.find((item) => item.id === detalleId);

      if (!currentItem) {
        throw new Error("No se encontró el producto en el carrito");
      }

      await validarStockParaReceta({
        recetaId: currentItem.recetaId,
        cantidad,
        cartItems: getState().cart.cartItems,
      });

      const response = await fetchConAuth(
        `${API_BASE}/carritos/${cartId}/recetas/${detalleId}?cantidad=${cantidad}`,
        { method: "PATCH" },
      );

      if (!response.ok) {
        throw new Error("No se pudo actualizar la cantidad");
      }

      // El backend devuelve solo el CarritoDetalleDTO actualizado.
      const detalle = await response.json();
      return mapDetalle(detalle);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

// d) Elimina un detalle del carrito.
export const removeItemFromCart = createAsyncThunk(
  "cart/removeItemFromCart",
  async (detalleId, { getState, rejectWithValue }) => {
    try {
      const cartId = getState().cart.cartId;

      const response = await fetchConAuth(
        `${API_BASE}/carritos/${cartId}/recetas/${detalleId}`,
        { method: "DELETE" },
      );

      if (!response.ok) {
        throw new Error("No se pudo quitar la receta del carrito");
      }

      const carrito = await response.json();
      return mapCarrito(carrito);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

// e) Vacía el carrito (DELETE /vaciar → 204).
export const clearCartApi = createAsyncThunk(
  "cart/clearCartApi",
  async (_, { getState, rejectWithValue }) => {
    try {
      const cartId = getState().cart.cartId;

      const response = await fetchConAuth(`${API_BASE}/carritos/vaciar/${cartId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("No se pudo vaciar el carrito");
      }

      return true;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

// --- Slice -----------------------------------------------------------------

const initialState = {
  cartId: null,
  cartItems: [],
  precioTotal: 0,
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // Reinicia el carrito al cerrar sesión.
    resetCartState: () => initialState,
  },
  extraReducers: (builder) => {
    // Helpers para los estados pending/rejected compartidos.
    const setPending = (state) => {
      state.loading = true;
      state.error = null;
    };
    const setPendingWithoutLoader = (state) => {
      state.error = null;
    };
    const setRejected = (state, action) => {
      state.loading = false;
      state.error = action.payload ?? action.error?.message ?? "Error desconocido";
    };

    builder
      // fetchCart
      .addCase(fetchCart.pending, setPending)
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cartId = action.payload.cartId;
        state.cartItems = action.payload.cartItems;
        state.precioTotal = action.payload.precioTotal;
      })
      .addCase(fetchCart.rejected, setRejected)

      // addItemToCart
      .addCase(addItemToCart.pending, setPending)
      .addCase(addItemToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cartId = action.payload.cartId;
        state.cartItems = action.payload.cartItems;
        state.precioTotal = action.payload.precioTotal;
      })
      .addCase(addItemToCart.rejected, setRejected)

      // updateItemQuantity (actualiza solo ese item y recalcula el total)
      .addCase(updateItemQuantity.pending, setPendingWithoutLoader)
      .addCase(updateItemQuantity.fulfilled, (state, action) => {
        const index = state.cartItems.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.cartItems[index] = action.payload;
        }
        state.precioTotal = state.cartItems.reduce(
          (acc, item) => acc + Number(item.subtotal ?? 0),
          0,
        );
      })
      .addCase(updateItemQuantity.rejected, setRejected)

      // removeItemFromCart
      .addCase(removeItemFromCart.pending, setPendingWithoutLoader)
      .addCase(removeItemFromCart.fulfilled, (state, action) => {
        state.cartId = action.payload.cartId;
        state.cartItems = action.payload.cartItems;
        state.precioTotal = action.payload.precioTotal;
      })
      .addCase(removeItemFromCart.rejected, setRejected)

      // clearCartApi
      .addCase(clearCartApi.pending, setPendingWithoutLoader)
      .addCase(clearCartApi.fulfilled, (state) => {
        state.cartItems = [];
        state.precioTotal = 0;
      })
      .addCase(clearCartApi.rejected, setRejected);
  },
});

export const { resetCartState } = cartSlice.actions;

// --- Selectores ------------------------------------------------------------
export const selectCartItems = (state) => state.cart.cartItems;
export const selectCartId = (state) => state.cart.cartId;
export const selectCartTotal = (state) => state.cart.precioTotal;
export const selectCartLoading = (state) => state.cart.loading;
export const selectCartError = (state) => state.cart.error;

export default cartSlice.reducer;
