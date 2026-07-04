import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import fetchConAuth from "../utils/fetchConAuth";

const API_BASE = "http://localhost:8080/api";

export const fetchFavorites = createAsyncThunk(
  "favorites/fetchFavorites",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetchConAuth(`${API_BASE}/favoritos`);
      if (!res.ok) throw new Error("No se pudieron cargar los favoritos");
      return res.json();
    } catch (err) { return rejectWithValue(err.message); }
  }
);

export const toggleFavoriteApi = createAsyncThunk(
  "favorites/toggleFavoriteApi",
  async (receta, { getState, rejectWithValue }) => {
    const items = getState().favorites.favoriteItems;
    const esFav = items.some(i => i.id === receta.id);
    try {
      const res = await fetchConAuth(
        `${API_BASE}/favoritos/${receta.id}`,
        { method: esFav ? "DELETE" : "POST" }
      );
      if (!res.ok && res.status !== 204) throw new Error("Error al actualizar favorito");
      return { receta, eraFavorito: esFav };
    } catch (err) { return rejectWithValue(err.message); }
  }
);

const favoritesSlice = createSlice({
  name: "favorites",
  initialState: { favoriteItems: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.favoriteItems = action.payload;
      })
      .addCase(toggleFavoriteApi.fulfilled, (state, action) => {
        const { receta, eraFavorito } = action.payload;
        if (eraFavorito) {
          state.favoriteItems = state.favoriteItems.filter(i => i.id !== receta.id);
        } else {
          state.favoriteItems.push(receta);
        }
      })
      .addCase(toggleFavoriteApi.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const selectFavoriteItems = (state) => state.favorites.favoriteItems;
export default favoritesSlice.reducer;