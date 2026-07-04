import { useEffect, useState } from "react";
import CrearReceta from "./CrearReceta";
import AdminProductos from "./AdminProductos";
import AdminCategorias from "./AdminCategorias";
import fetchConAuth from "../utils/fetchConAuth";
import {
  deleteCategoryApi,
  deleteIngredient,
  loadCategories,
  loadIngredients,
  loadRecipeProductMap,
  loadRecetas,
  replaceRecipeProducts,
  saveCategoryApi,
  saveIngredient,
} from "../utils/catalogStore";

const tabs = [
  { id: "recetas", label: "Recetas" },
  { id: "productos", label: "Productos" },
  { id: "categorias", label: "Categorías" },
];

const getRecipeImage = (receta = {}) =>
  receta.imagen ?? receta.foto ?? receta.imagenUrl ?? receta.imageUrl ?? receta.urlImagen ?? "";

function AdminRecetas() {
  const [activeTab, setActiveTab] = useState("recetas");
  const [recetas, setRecetas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [productosPorReceta, setProductosPorReceta] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [recetaEditando, setRecetaEditando] = useState(null);

  const reloadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [recipesData, categoriesData, productsData, recipeProductMap] = await Promise.all([
        loadRecetas(),
        loadCategories(),
        loadIngredients(),
        loadRecipeProductMap(),
      ]);

      setRecetas(recipesData);
      setCategorias(categoriesData);
      setProductos(productsData);
      setProductosPorReceta(recipeProductMap);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadData();
  }, []);

  const handleDeleteReceta = async (id) => {
    if (!window.confirm("Estas seguro de eliminar esta receta?")) return;

    try {
      const response = await fetchConAuth(`http://localhost:8080/api/recetas/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("No se pudo eliminar la receta");
      }

      await reloadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSaveRecipeProducts = async (recipeId, productIds) => {
    await replaceRecipeProducts(recipeId, productIds, fetchConAuth);
  };

  const handleSaveProduct = async (productData) => {
    try {
      await saveIngredient(productData, fetchConAuth);
      await reloadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Estas seguro de eliminar este producto?")) return;

    try {
      await deleteIngredient(productId, fetchConAuth);
      await reloadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSaveCategory = async (categoryData) => {
    try {
      await saveCategoryApi(categoryData, fetchConAuth);
      await reloadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm("Estas seguro de eliminar esta categoria?")) return;

    try {
      await deleteCategoryApi(categoryId, fetchConAuth);
      await reloadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const openCreate = () => {
    setRecetaEditando(null);
    setMostrarFormulario(true);
  };

  const openEdit = (receta) => {
    setRecetaEditando(receta);
    setMostrarFormulario(true);
  };

  const closeForm = () => {
    setMostrarFormulario(false);
    setRecetaEditando(null);
  };

  if (loading) {
    return <div className="catalog-state">Cargando panel...</div>;
  }

  if (error) {
    return <div className="catalog-state catalog-state-error">Error: {error}</div>;
  }

  return (
    <section className="admin-page">
      <div className="admin-header">
        <div>
          <p className="section-kicker">Panel de gestión</p>
          <h1>Administración del catálogo</h1>
        </div>
        <p>Gestioná recetas, productos y categorías desde un solo lugar.</p>
      </div>

      <div className="admin-tabs" role="tablist" aria-label="Secciones del panel">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={activeTab === tab.id ? "admin-tab active" : "admin-tab"}
            type="button"
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "recetas" && (
        <div className="admin-section-grid">
          <article className="admin-card admin-card-wide">
            <div className="admin-card-heading">
              <div>
                <p className="section-kicker">Recetas activas</p>
                <h2>Administrar recetas</h2>
              </div>
              <button className="admin-primary-button" type="button" onClick={openCreate}>
                Nueva receta
              </button>
            </div>

            {recetas.length === 0 ? (
              <div className="catalog-empty">No hay recetas registradas.</div>
            ) : (
              <div className="admin-stack">
                {recetas.map((receta) => {
                  const productosAsociados = productosPorReceta[String(receta.id)] ?? [];

                  return (
                    <article className="admin-item-card" key={receta.id}>
                      <div className="admin-item-photo" aria-hidden="true">
                        {getRecipeImage(receta) ? (
                          <img src={getRecipeImage(receta)} alt="" />
                        ) : (
                          <span>{(receta.nombre ?? "R").charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="admin-item-main">
                        <div className="admin-item-meta">
                          {(receta.categorias ?? []).map((categoria) => (
                            <span key={categoria.idCategoria}>{categoria.nombre}</span>
                          ))}
                        </div>
                        <h3>{receta.nombre}</h3>
                        <p>{receta.descripcion}</p>
                        <strong>${Number(receta.precio ?? 0).toLocaleString("es-AR")}</strong>
                        <div className="admin-associated-list">
                          {productosAsociados.length > 0 ? (
                            productosAsociados.map((product) => (
                              <span key={`${receta.id}-${product.id}`}>{product.nombre}</span>
                            ))
                          ) : (
                            <span>Sin productos asociados</span>
                          )}
                        </div>
                      </div>

                      <div className="admin-inline-actions">
                        <button type="button" onClick={() => openEdit(receta)}>
                          Editar
                        </button>
                        <button type="button" onClick={() => handleDeleteReceta(receta.id)}>
                          Eliminar
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </article>
        </div>
      )}

      {activeTab === "productos" && (
        <AdminProductos
          products={productos}
          onDeleteProduct={handleDeleteProduct}
          onSaveProduct={handleSaveProduct}
        />
      )}

      {activeTab === "categorias" && (
        <AdminCategorias
          categories={categorias}
          onDeleteCategory={handleDeleteCategory}
          onSaveCategory={handleSaveCategory}
        />
      )}

      {mostrarFormulario && (
        <div className="admin-modal-overlay" onClick={closeForm}>
          <div onClick={(event) => event.stopPropagation()}>
            <CrearReceta
              recetaEditar={recetaEditando}
              categories={categorias}
              products={productos}
              initialProductIds={
                recetaEditando
                  ? (productosPorReceta[String(recetaEditando.id)] ?? []).map((item) =>
                      String(item.id),
                    )
                  : []
              }
              onSaveRecipeProducts={handleSaveRecipeProducts}
              onRecetaCreada={async () => {
                await reloadData();
                closeForm();
              }}
              onCancelar={closeForm}
            />
          </div>
        </div>
      )}
    </section>
  );
}

export default AdminRecetas;
