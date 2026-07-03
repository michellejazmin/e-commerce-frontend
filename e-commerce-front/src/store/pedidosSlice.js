import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import fetchConAuth from "../utils/fetchConAuth";
import { loadIngredients, loadRecipeProductMap, saveIngredient } from "../utils/catalogStore";

const API_BASE = "http://localhost:8080/api";

/*
// Obtiene el usuarioId desde GET /api/usuarios/perfil.
const fetchUsuarioId = async () => {
  const response = await fetchConAuth(`${API_BASE}/usuarios/perfil`);
  if (!response.ok) {
    throw new Error("No se pudo obtener el perfil del usuario");
  }
  const perfil = await response.json();
  return perfil.idUsuario;
};
*/
// Devuelve la fecha de hoy en formato YYYY-MM-DD.

const fechaHoy = () => new Date().toISOString().slice(0, 10);

const prepararActualizacionStock = async (cartItems) => {
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return [];
  }

  const [ingredients, recipeProductMap] = await Promise.all([loadIngredients(), loadRecipeProductMap()]);

  const ingredientById = new Map(
    (Array.isArray(ingredients) ? ingredients : []).map((ingredient) => [String(ingredient.id), ingredient]),
  );
  const requiredByIngredient = new Map();

  for (const item of cartItems) {
    const recipeProducts = recipeProductMap[String(item.recetaId)] ?? [];
    const recipeQuantity = Number(item.cantidad ?? 1);

    for (const product of recipeProducts) {
      const ingredientId = product.id ?? product.ingredienteId;
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

    const currentStock = Number(ingredient.stock ?? 0);
    const nextStock = currentStock - requiredQuantity;

    if (nextStock < 0) {
      throw new Error(`Stock insuficiente para ${ingredient.nombre ?? "un ingrediente"}`);
    }

    return {
      ingredient,
      nextStock,
    };
  });
};

// --- Thunks ----------------------------------------------------------------

// GET todos los pedidos y filtra por el usuario logueado (el backend no filtra).
export const fetchPedidos = createAsyncThunk(
  "pedidos/fetchPedidos",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchConAuth(`${API_BASE}/pedidos/mis-pedidos`);
      if (!response.ok) throw new Error("No se pudieron obtener los pedidos");
      const pedidos = await response.json();
      return Array.isArray(pedidos) ? pedidos : [];
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// POST de un nuevo pedido con la fecha de hoy.
// El backend obtiene el usuarioId desde el token JWT en la cookie.
export const createPedido = createAsyncThunk(
  "pedidos/createPedido",
  async ({ total, cartItems = [] }, { rejectWithValue }) => {
    try {
      const stockUpdates = await prepararActualizacionStock(cartItems);

      const response = await fetchConAuth(`${API_BASE}/pedidos`, {
        method: "POST",
        body: JSON.stringify({ fecha: fechaHoy(), total }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText ? `No se pudo crear el pedido: ${errorText}` : "No se pudo crear el pedido");
      }

      const pedido = await response.json();

      await Promise.all(
        stockUpdates.map(({ ingredient, nextStock }) =>
          saveIngredient(
            {
              ...ingredient,
              stock: nextStock,
            },
            fetchConAuth,
          ),
        ),
      );

      return pedido;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

// DELETE de un pedido por id (→ 204).
export const deletePedido = createAsyncThunk(
  "pedidos/deletePedido",
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetchConAuth(`${API_BASE}/pedidos/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("No se pudo eliminar el pedido");
      }

      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

// --- Slice -----------------------------------------------------------------

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const pedidosSlice = createSlice({
  name: "pedidos",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    const setPending = (state) => {
      state.loading = true;
      state.error = null;
    };
    const setRejected = (state, action) => {
      state.loading = false;
      state.error = action.payload ?? action.error?.message ?? "Error desconocido";
    };

    builder
      // fetchPedidos
      .addCase(fetchPedidos.pending, setPending)
      .addCase(fetchPedidos.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchPedidos.rejected, setRejected)

      // createPedido
      .addCase(createPedido.pending, setPending)
      .addCase(createPedido.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(createPedido.rejected, setRejected)

      // deletePedido
      .addCase(deletePedido.pending, setPending)
      .addCase(deletePedido.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((pedido) => pedido.id !== action.payload);
      })
      .addCase(deletePedido.rejected, setRejected);
  },
});

// --- Selectores ------------------------------------------------------------
export const selectPedidos = (state) => state.pedidos.items;
export const selectPedidosLoading = (state) => state.pedidos.loading;
export const selectPedidosError = (state) => state.pedidos.error;

export default pedidosSlice.reducer;
