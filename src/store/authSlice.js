import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_BASE = "http://localhost:8080/api";

// Con cookies HttpOnly el token vive en el navegador: Redux SOLO guarda el
// estado de sesión (quién está logueado y sus roles), nunca el token.
const initialState = {
  user: null,
  roles: [],
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// --- Thunks ----------------------------------------------------------------

// Login: el backend setea la cookie "token" (HttpOnly). No leemos ningún token
// del body; solo nos importa si la respuesta fue ok.
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const mensaje = await response.text().catch(() => "");
        throw new Error(mensaje || "Credenciales inválidas o error en el servidor");
      }

      return true;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

// Rehidrata la sesión leyendo la cookie viva (al cargar la app o tras un F5).
export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/auth/me`, {
        credentials: "include",
      });

      if (!response.ok) {
        // 401 (u otro) → no hay sesión activa.
        return rejectWithValue("No hay sesión activa");
      }

      const data = await response.json();
      return { email: data.email, roles: data.roles ?? [] };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

// Logout: el backend borra la cookie.
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("No se pudo cerrar la sesión");
      }

      return true;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

// --- Slice -----------------------------------------------------------------

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // loginUser
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state) => {
        // La cookie ya quedó seteada; user/roles se completan con fetchCurrentUser.
        state.isLoading = false;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.payload;
      })

      // fetchCurrentUser
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.email;
        state.roles = action.payload.roles;
        state.isAuthenticated = true;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        // Estado deslogueado.
        state.isLoading = false;
        state.user = null;
        state.roles = [];
        state.isAuthenticated = false;
      })

      // logoutUser → reset a estado inicial.
      .addCase(logoutUser.fulfilled, () => initialState)
      .addCase(logoutUser.rejected, () => initialState);
  },
});

// --- Selectores ------------------------------------------------------------
export const selectAuth = (state) => state.auth;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;

// Selector/helper: true si el usuario tiene rol de administrador.
export const esAdmin = (state) =>
  state.auth.roles.includes("ADMIN") || state.auth.roles.includes("ROLE_ADMIN");

export default authSlice.reducer;
