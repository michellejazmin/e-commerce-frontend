// Importamos componentes de routing.
import { Link, useNavigate, useParams } from "react-router-dom";
// Importamos nuestro custom hook para acceder al store de favoritos.
import { useFavorite } from "../store/hooks/useFavorite";

// --- COMPONENTE CONSUMIDOR: LISTADO DE FAVORITOS ---
// Este componente es responsable de mostrar las recetas que el usuario marcó como favoritas.
function Favorite() {
  // Usamos el hook `useFavorite` para obtener la lista y la función para quitar/agregar.
  const { favoriteItems, addToFavorite } = useFavorite();

  // Misma lógica que en el catálogo: probamos varios nombres de campo posibles para la imagen.
   const getRecipeImage = (receta) =>
    receta.imagen ?? receta.foto ?? receta.imagenUrl ?? receta.imageUrl ?? receta.urlImagen ?? "";

  // useParams: si la URL es /favoritos/:id, leemos el id para mostrar solo esa receta.
  const { id } = useParams();
  // useNavigate: para redirigir al detalle o al catálogo desde botones.
  const navigate = useNavigate();

  // Operador ternario: si hay :id en la URL, filtramos la lista; si no, mostramos todo.
  const items = id
    ? favoriteItems.filter((item) => String(item.id) === String(id))
    : favoriteItems;

  // Renderizado condicional: estado vacío cuando no hay ningún favorito.
  if (favoriteItems.length === 0) {
    return (
      <section className="catalog-section">
        <div className="catalog-heading">
          <h1>Mis favoritos</h1>
        </div>
          <div className="catalog-empty">
            Todavía no agregaste recetas a tus favoritos.
            <button
              className="btn-empty-state"
              onClick={() => navigate("/catalogo")}
            >
              Ver catálogo
            </button>
          </div>
      </section>
    );
  }

  // Renderizamos la lista de favoritos.
  return (
    <section className="catalog-section">
      <div className="catalog-heading">
        <div>
          <p className="section-kicker">Tu selección</p>
          <h1>Mis favoritos</h1>
        </div>
        <p>
          {items.length}{" "}
          {items.length === 1 ? "receta guardada" : "recetas guardadas"}
        </p>
      </div>

      {/* Si filtraron por :id y no hay match, mostramos un aviso. */}
      {items.length === 0 ? (
        <div className="catalog-empty">
          Esa receta ya no está en tus favoritos. <Link to="/favoritos">Ver todos</Link>
        </div>
      ) : (
        <div className="receta-grid">
          {/* Recorremos los favoritos con .map */}
          {items.map((receta) => {
            const name = receta.nombre ?? "Sin nombre";
            const desc = receta.descripcion ?? "Sin descripción";
            const price = receta.precio ?? 0;
            const recipeImage = getRecipeImage(receta);

            return (
              <article className="receta-card" key={receta.id}>
                <div className="receta-image" aria-hidden="true">
                  {recipeImage ? (
                    <img src={recipeImage} alt={name} />
                  ) : (
                    <span>{name.charAt(0).toUpperCase()}</span>
                  )}
                </div>

                <div className="receta-card-body">
                  <h3>{name}</h3>
                  <p className="receta-precio">
                    ${Number(price).toLocaleString("es-AR")}
                  </p>
                  <p className="receta-desc">
                    {desc.length > 92 ? `${desc.substring(0, 92)}...` : desc}
                  </p>

                  <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                    <button 
                      className="btn-fav-detail" 
                      onClick={() => navigate(`/recetas/${receta.id}`)}
                    >
                      Ver detalle
                    </button>
                    <button
                      className="btn-fav-remove"
                      onClick={() => addToFavorite(receta)}
                    >
                      ♥ Quitar
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <div style={{ marginTop: "24px" }}>
        {/* Reutilizamos la clase cart-link-back para mantener el mismo estilo de enlace */}
        <Link className="cart-link-back" to="/catalogo">← Volver al catálogo</Link>
      </div>
    </section>
  );
}

// Exportamos el componente para usarlo en otras partes de la aplicación.
export default Favorite;
