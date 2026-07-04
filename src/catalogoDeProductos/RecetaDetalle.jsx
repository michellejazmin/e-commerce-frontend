import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  loadRecetaById,
  loadRecipeDetailsByRecipe,
  loadRecetas,
} from "../utils/catalogStore";

const getInitial = (nombre = "") => nombre.trim().charAt(0).toUpperCase() || "R";
const getCategoryName = (categorias = []) => categorias[0]?.nombre ?? "Especial";
const getRecipeImage = (receta = {}) =>
  receta.imagen ?? receta.foto ?? receta.imagenUrl ?? receta.imageUrl ?? receta.urlImagen ?? "";

function RecetaDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [receta, setReceta] = useState(null);
  const [relacionadas, setRelacionadas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setCargando(true);
      setError(null);

      try {
        const [recipe, allRecipes] = await Promise.all([
          loadRecetaById(id),
          loadRecetas(),
        ]);

        if (!recipe) {
          throw new Error("Receta no encontrada");
        }

        // Los productos vinculados salen de un endpoint que puede estar protegido:
        // si falla (sin sesión / 401), mostramos la receta igual sin esa sección.
        let recipeDetails = [];
        try {
          recipeDetails = await loadRecipeDetailsByRecipe(id);
        } catch {
          recipeDetails = [];
        }

        const categoriaPrincipal = getCategoryName(recipe.categorias ?? []);
        const sugeridas = allRecipes
          .filter((item) => String(item.id) !== String(recipe.id))
          .sort((a, b) => {
            const matchA = getCategoryName(a.categorias ?? []) === categoriaPrincipal ? 1 : 0;
            const matchB = getCategoryName(b.categorias ?? []) === categoriaPrincipal ? 1 : 0;
            return matchB - matchA;
          })
          .slice(0, 3);

        setReceta(recipe);
        setRelacionadas(sugeridas);
        setProductos(
          recipeDetails.map((detail) => {
            // El backend puede devolver el ingrediente plano (ingredienteNombre),
            // con campos sueltos (nombre) o anidado en un objeto (ingrediente).
            const ing = detail.ingrediente ?? {};
            return {
              id: detail.ingredienteId ?? detail.idIngrediente ?? ing.id ?? ing.idIngrediente,
              nombre: detail.ingredienteNombre ?? detail.nombre ?? ing.nombre ?? ing.nombreIngrediente,
              descripcion:
                detail.ingredienteDescripcion ?? detail.descripcion ?? ing.descripcion,
              stock: detail.ingredienteStock ?? detail.stock ?? ing.stock,
              cantidad: detail.cantidad,
              unidad: detail.unidad,
            };
          }),
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };

    fetchData();
  }, [id]);

  if (cargando) {
    return <div className="catalog-state">Cargando receta...</div>;
  }

  if (error || !receta) {
    return (
      <div className="catalog-state catalog-state-error">
        Error: {error ?? "No se encontro la receta."}
      </div>
    );
  }

  return (
    <section className="recipe-detail-page">
      <div className="recipe-detail-hero">
        <div className="recipe-detail-copy">
          <button className="recipe-back-button" onClick={() => navigate(-1)}>
            Volver
          </button>

          <p className="section-kicker">Detalle de receta</p>
          <div className="recipe-detail-tags">
            <span>{getCategoryName(receta.categorias ?? [])}</span>
            <span>${Number(receta.precio ?? 0).toLocaleString("es-AR")}</span>
            <span>{productos.length} productos</span>
          </div>
          <h1>{receta.nombre}</h1>
          <p className="recipe-detail-description">{receta.descripcion}</p>

          <div className="recipe-detail-stats">
            <div>
              <strong>${Number(receta.precio ?? 0).toLocaleString("es-AR")}</strong>
              <span>Precio final</span>
            </div>
            <div>
              <strong>{(receta.categorias ?? []).length || 1}</strong>
              <span>Categorias</span>
            </div>
            <div>
              <strong>{productos.length}</strong>
              <span>Productos vinculados</span>
            </div>
          </div>
        </div>

        <div className="recipe-detail-visual" aria-hidden="true">
          <div className="recipe-detail-art">
            {getRecipeImage(receta) ? (
              <img src={getRecipeImage(receta)} alt="" />
            ) : (
              <div className="recipe-detail-art-letter">{getInitial(receta.nombre)}</div>
            )}
          </div>
          <div className="recipe-detail-note">
            <strong>Armado de la receta</strong>
            <span>Los productos mostrados abajo salen de la relación guardada en backend.</span>
          </div>
        </div>
      </div>

      <div className="recipe-detail-grid">
        <div className="recipe-detail-main">
          <article className="recipe-detail-card">
            <p className="section-kicker">Descripción</p>
            <h2>Conocé más sobre la receta</h2>
            <p>{receta.descripcion}</p>
          </article>

          <article className="recipe-detail-card">
            <div className="recipe-products-header">
              <div>
                <p className="section-kicker">Productos de la receta</p>
                <h2>Ingredientes o productos asociados</h2>
              </div>
            </div>

            {productos.length === 0 ? (
              <div className="catalog-empty">Todavía no hay productos vinculados a esta receta.</div>
            ) : (
              <div className="recipe-product-grid">
                {productos.map((producto) => (
                  <article className="recipe-product-card" key={`${producto.id}-${producto.nombre}`}>
                    <div className="recipe-product-card-top">
                      <strong>{producto.nombre}</strong>
                      <span>
                        {producto.cantidad} {producto.unidad}
                      </span>
                    </div>
                    <p>{producto.descripcion || "Sin descripcion."}</p>
                    {producto.stock !== undefined && (
                      <small>Stock disponible: {producto.stock}</small>
                    )}
                  </article>
                ))}
              </div>
            )}
          </article>
        </div>

        <aside className="recipe-detail-sidebar">
          <article className="recipe-detail-card recipe-detail-summary">
            <p className="section-kicker">Resumen</p>
            <h2>Vista rápida</h2>
            <div className="recipe-detail-price">
              ${Number(receta.precio ?? 0).toLocaleString("es-AR")}
            </div>
            <div className="recipe-detail-category-list">
              {(receta.categorias ?? []).map((categoria) => (
                <span key={categoria.idCategoria}>{categoria.nombre}</span>
              ))}
            </div>
            <Link to="/catalogo" className="recipe-detail-cta">
              Seguir explorando
            </Link>
          </article>
        </aside>
      </div>

      {relacionadas.length > 0 && (
        <section className="recipe-related-section">
          <div className="catalog-heading recipe-related-heading">
            <div>
              <p className="section-kicker">También te puede gustar</p>
              <h2>Más recetas para mirar</h2>
            </div>
            <p>Opciones cercanas en estilo y categoría para seguir navegando.</p>
          </div>

          <div className="receta-grid">
            {relacionadas.map((item) => (
              <Link to={`/recetas/${item.id}`} key={item.id} className="receta-link">
                <article className="receta-card">
                  <div className="receta-image">
                    {getRecipeImage(item) ? (
                      <img src={getRecipeImage(item)} alt={item.nombre ?? "Receta"} />
                    ) : (
                      <span>{getInitial(item.nombre ?? "")}</span>
                    )}
                  </div>
                  <div className="receta-card-body">
                    <h3>{item.nombre}</h3>
                    <div className="receta-tags">
                      <span>{getCategoryName(item.categorias ?? [])}</span>
                    </div>
                    <p className="receta-precio">
                      ${Number(item.precio ?? 0).toLocaleString("es-AR")}
                    </p>
                    <p className="receta-desc">
                      {(item.descripcion ?? "Sin descripcion").length > 88
                        ? `${item.descripcion.substring(0, 88)}...`
                        : item.descripcion ?? "Sin descripcion"}
                    </p>
                    <span className="receta-detail">Ver detalle</span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>
      )}
    </section>
  );
}

export default RecetaDetalle;
