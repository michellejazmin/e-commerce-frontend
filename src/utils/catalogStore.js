const API_BASE = "http://localhost:8080/api";

const requestJson = async (url, options = {}) => {
  // Enviamos la cookie HttpOnly de sesión por si el endpoint quedó protegido
  // tras la migración a autenticación por cookie.
  const response = await fetch(url, { credentials: "include", ...options });

  if (!response.ok) {
    throw new Error(`No se pudo completar la solicitud a ${url}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};

export const loadCategories = async () => {
  const data = await requestJson(`${API_BASE}/categorias`);
  return Array.isArray(data) ? data : [];
};

export const saveCategoryApi = async (categoryData, fetchConAuth) => {
  const response = await fetchConAuth(
    categoryData.idCategoria
      ? `${API_BASE}/categorias/${categoryData.idCategoria}`
      : `${API_BASE}/categorias`,
    {
      method: categoryData.idCategoria ? "PUT" : "POST",
      body: JSON.stringify({ nombre: categoryData.nombre.trim() }),
    },
  );

  if (!response.ok) {
    throw new Error(categoryData.idCategoria ? "No se pudo actualizar la categoria" : "No se pudo crear la categoria");
  }

  return response.json();
};

export const deleteCategoryApi = async (categoryId, fetchConAuth) => {
  const response = await fetchConAuth(`${API_BASE}/categorias/${categoryId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("No se pudo eliminar la categoria");
  }
};

export const loadIngredients = async () => {
  const data = await requestJson(`${API_BASE}/ingredientes`);
  return Array.isArray(data) ? data : [];
};

export const saveIngredient = async (productData, fetchConAuth) => {
  const payload = {
    nombre: productData.nombre.trim(),
    descripcion: productData.descripcion.trim(),
    precio: Number(productData.precio ?? 0),
    stock: Number(productData.stock ?? 0),
  };

  const response = await fetchConAuth(
    productData.id ? `${API_BASE}/ingredientes/${productData.id}` : `${API_BASE}/ingredientes`,
    {
      method: productData.id ? "PUT" : "POST",
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    throw new Error(productData.id ? "No se pudo actualizar el producto" : "No se pudo crear el producto");
  }

  return response.json();
};

export const deleteIngredient = async (ingredientId, fetchConAuth) => {
  const response = await fetchConAuth(`${API_BASE}/ingredientes/${ingredientId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("No se pudo eliminar el producto");
  }
};

export const loadRecetas = async () => {
  const data = await requestJson(`${API_BASE}/recetas`);
  return Array.isArray(data) ? data : [];
};

export const loadRecetaById = async (recipeId) => {
  return requestJson(`${API_BASE}/recetas/${recipeId}`);
};

export const loadRecipeDetailsByRecipe = async (recipeId) => {
  const [data, ingredients] = await Promise.all([
    requestJson(`${API_BASE}/receta-detalles/receta/${recipeId}`),
    loadIngredients(),
  ]);

  const items = Array.isArray(data) ? data : [];
  const ingredientById = new Map(
    (Array.isArray(ingredients) ? ingredients : []).map((ingredient) => [String(ingredient.id), ingredient]),
  );

  return items.map((detail) => {
    const ingredientId = detail.ingredienteId ?? detail.idIngrediente ?? detail.ingrediente?.id;
    const ingredient = ingredientById.get(String(ingredientId)) ?? detail.ingrediente ?? {};

    return {
      ...detail,
      ingrediente: ingredient,
      ingredienteId: ingredientId ?? detail.ingredienteId ?? detail.idIngrediente,
      ingredienteNombre: detail.ingredienteNombre ?? detail.nombre ?? ingredient.nombre,
      ingredienteDescripcion: detail.ingredienteDescripcion ?? detail.descripcion ?? ingredient.descripcion,
      ingredienteStock: detail.ingredienteStock ?? detail.stock ?? ingredient.stock,
    };
  });
};

export const loadRecipeProductMap = async () => {
  const data = await requestJson(`${API_BASE}/receta-detalles`);
  const items = Array.isArray(data) ? data : [];

  return items.reduce((acc, detail) => {
    const recipeId = String(detail.recetaId);
    const product = {
      id: detail.ingredienteId,
      nombre: detail.ingredienteNombre,
      descripcion: detail.ingredienteDescripcion,
      stock: detail.ingredienteStock,
      cantidad: detail.cantidad,
      unidad: detail.unidad,
      detalleId: detail.idRecetaDetalle,
    };

    if (!acc[recipeId]) {
      acc[recipeId] = [];
    }

    acc[recipeId].push(product);
    return acc;
  }, {});
};

export const replaceRecipeProducts = async (recipeId, productIds, fetchConAuth) => {
  const payload = productIds.map((productId) => ({
    cantidad: 1,
    unidad: "unidad",
    recetaId: Number(recipeId),
    ingredienteId: Number(productId),
  }));

  const response = await fetchConAuth(`${API_BASE}/receta-detalles/receta/${recipeId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("No se pudieron guardar los productos de la receta");
  }

  return response.json();
};
