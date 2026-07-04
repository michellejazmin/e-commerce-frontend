import { configureStore } from "@reduxjs/toolkit";
import favoritesReducer from "./favoritesSlice";
import cartReducer from "./cartSlice";
import pedidosReducer from "./pedidosSlice";
import authReducer from "./authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    favorites: favoritesReducer,
    cart: cartReducer,
    pedidos: pedidosReducer,
  },
});
