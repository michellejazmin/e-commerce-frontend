import { useEffect, useState } from "react";
import fetchConAuth from "../utils/fetchConAuth";

const buildInitialForm = (recetaEditar) => ({
  nombre: recetaEditar?.nombre ?? "",
  descripcion: recetaEditar?.descripcion ?? "",
  precio: recetaEditar?.precio ?? "",
  categoriaId: recetaEditar?.categorias?.[0]?.idCategoria ?? "",
  imagen: recetaEditar?.imagen ?? recetaEditar?.foto ?? recetaEditar?.imagenUrl ?? "",
});

function CrearReceta({
  onRecetaCreada,
  onCancelar,
  recetaEditar,
  categories,
  products,
  initialProductIds = [],
  onSaveRecipeProducts,
}) {
  const esEdicion = Boolean(recetaEditar);
  const [formData, setFormData] = useState(buildInitialForm(recetaEditar));
  const [selectedProductIds, setSelectedProductIds] = useState(initialProductIds);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    setFormData(buildInitialForm(recetaEditar));
    setSelectedProductIds(initialProductIds);
  }, [initialProductIds, recetaEditar]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      setFormData((prev) => ({ ...prev, imagen: "" }));
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Selecciona un archivo de imagen valido.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, imagen: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const toggleProduct = (productId) => {
    setSelectedProductIds((prev) =>
      prev.includes(String(productId))
        ? prev.filter((id) => id !== String(productId))
        : [...prev, String(productId)],
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setCargando(true);

    try {
      const payload = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        precio: parseFloat(formData.precio),
        categorias: formData.categoriaId ? [parseInt(formData.categoriaId, 10)] : [],
        imagen: formData.imagen || null,
      };

      const response = await fetchConAuth(
        esEdicion
          ? `http://localhost:8080/api/recetas/${recetaEditar.id}`
          : "http://localhost:8080/api/recetas",
        {
          method: esEdicion ? "PUT" : "POST",
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        throw new Error(esEdicion ? "Error al actualizar receta" : "Error al crear receta");
      }

      const savedRecipe = await response.json();

      if (onSaveRecipeProducts) {
        await onSaveRecipeProducts(savedRecipe.id, selectedProductIds);
      }

      onRecetaCreada?.(savedRecipe);
      setFormData(buildInitialForm(null));
      setSelectedProductIds([]);
    } catch (error) {
      alert(error.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="admin-modal-card">
      <div className="admin-card-heading">
        <div>
          <p className="section-kicker">{esEdicion ? "Editar receta" : "Nueva receta"}</p>
          <h2>{esEdicion ? "Actualizar receta" : "Agregar receta"}</h2>
        </div>
        <p>Completá los datos básicos y elegí los productos que la componen.</p>
      </div>

      <form className="admin-form" onSubmit={handleSubmit}>
        <label>
          Nombre
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Descripción
          <textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            required
          />
        </label>

        <label className="admin-image-field">
          Foto de la receta
          <div className="admin-image-upload">
            <div className="admin-image-preview">
              {formData.imagen ? (
                <img src={formData.imagen} alt="Vista previa de la receta" />
              ) : (
                <span>Sin foto</span>
              )}
            </div>
            <div>
              <input type="file" accept="image/*" onChange={handleImageChange} />
              <small>Subí una imagen JPG, PNG o WebP para mostrarla en el catálogo.</small>
              {formData.imagen && (
                <button
                  className="admin-clear-image"
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, imagen: "" }))}
                >
                  Quitar foto
                </button>
              )}
            </div>
          </div>
        </label>

        <div className="admin-form-grid">
          <label>
            Precio
            <input
              type="number"
              name="precio"
              value={formData.precio}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
            />
          </label>

          <label>
            Categoría
            <select
              name="categoriaId"
              value={formData.categoriaId}
              onChange={handleChange}
              required
            >
              <option value="">Seleccionar categoría</option>
              {categories.map((category) => (
                <option key={category.idCategoria} value={category.idCategoria}>
                  {category.nombre}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="admin-products-picker">
          <div className="admin-products-picker-heading">
            <strong>Productos vinculados</strong>
            <span>{selectedProductIds.length} seleccionados</span>
          </div>

          {products.length === 0 ? (
            <div className="catalog-empty">
              Primero cargá productos en el panel para poder asociarlos a la receta.
            </div>
          ) : (
            <div className="admin-chip-grid">
              {products.map((product) => {
                const active = selectedProductIds.includes(String(product.id));

                return (
                  <button
                    className={active ? "admin-chip active" : "admin-chip"}
                    key={product.id}
                    type="button"
                    onClick={() => toggleProduct(product.id)}
                  >
                    <span>{product.nombre}</span>
                    {product.stock !== undefined && <small>Stock: {product.stock}</small>}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="admin-form-actions">
          <button className="admin-primary-button" type="submit" disabled={cargando}>
            {cargando ? "Guardando..." : esEdicion ? "Guardar cambios" : "Crear receta"}
          </button>
          <button className="admin-secondary-button" type="button" onClick={onCancelar}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export default CrearReceta;
