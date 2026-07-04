import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchFavorites, toggleFavoriteApi, selectFavoriteItems } from "../favoritesSlice";
import { selectIsAuthenticated } from "../authSlice";

export function useFavorite() {
  const dispatch = useDispatch();
  const favoriteItems = useSelector(selectFavoriteItems);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  useEffect(() => {
    if (isAuthenticated) dispatch(fetchFavorites());
  }, [dispatch, isAuthenticated]);

  const addToFavorite = useCallback((product) => {
    dispatch(toggleFavoriteApi(product));
  }, [dispatch]);

  const esFavorito = useCallback(
    (id) => favoriteItems.some((item) => item.id === id),
    [favoriteItems]
  );

  return { favoriteItems, addToFavorite, esFavorito };
}