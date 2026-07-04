import { useEffect, useState } from "react";

const emptyForm = {
  id: "",
  nombre: "",
  descripcion: "",
  precio: "",
  stock: "",
};

function AdminProductos({ products, onSaveProduct, onDeleteProduct }) {
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    setFormData(emptyForm);
  }, [products.length]);

  const handleSubmit = (event) => {
    event.preventDefault();
    onSaveProduct(formData);
    setFormData(emptyForm);
  };

  const handleEdit = (product) => {
    setFormData({
      id: product.id,
      nombre: product.nombre ?? "",
      descripcion: product.descripcion ?? "",
      precio: product.precio ?? "",
      stock: product.stock ?? "",
    });
  };

  return (
    <section className="admin-section-grid">
      <article className="admin-card">
        <div className="admin-card-heading">
          <div>
            <p className="section-kicker">Alta manual</p>
            <h2>{formData.id ? "Editar producto" : "Agregar producto"}</h2>
          </div>
          <p>Creá ingredientes reales del backend para vincularlos luego a recetas.</p>
        </div>

        <form className="admin-form" onSubmit={handleSubmit}>
          <label>
            Nombre
            <input
              type="text"
              value={formData.nombre}
              onChange={(event) => setFormData((prev) => ({ ...prev, nombre: event.target.value }))}
              required
            />
          </label>

          <label>
            Descripcion
            <textarea
              value={formData.descripcion}
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, descripcion: event.target.value }))
              }
              placeholder="Ej: queso mozzarella, tomate, albahaca"
            />
          </label>

          <div className="admin-form-grid">
            <label>
              Precio
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.precio}
                onChange={(event) => setFormData((prev) => ({ ...prev, precio: event.target.value }))}
                required
              />
            </label>

            <label>
              Stock
              <input
                type="number"
                min="0"
                step="1"
                value={formData.stock}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, stock: event.target.value }))
                }
                required
              />
            </label>
          </div>

          <div className="admin-form-actions">
            <button className="admin-primary-button" type="submit">
              {formData.id ? "Guardar cambios" : "Agregar producto"}
            </button>
            {formData.id && (
              <button
                className="admin-secondary-button"
                type="button"
                onClick={() => setFormData(emptyForm)}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </article>

      <article className="admin-card">
        <div className="admin-card-heading">
          <div>
            <p className="section-kicker">Inventario local</p>
            <h2>Productos cargados</h2>
          </div>
          <p>{products.length} productos disponibles para asociar a recetas.</p>
        </div>

        {products.length === 0 ? (
          <div className="catalog-empty">Todavia no agregaste productos.</div>
        ) : (
          <div className="admin-stack">
            {[...products].sort((a, b) => a.nombre.localeCompare(b.nombre)).map((product) => {
              return (
                <article className="admin-item-card" key={product.id}>
                  <div>
                    <h3>{product.nombre}</h3>
                    <p>{product.descripcion || "Sin descripcion cargada."}</p>
                    <div className="admin-item-meta">
                      <span>${Number(product.precio ?? 0).toLocaleString("es-AR")}</span>
                      <span>Stock: {Number(product.stock ?? 0)}</span>
                    </div>
                  </div>

                  <div className="admin-inline-actions">
                    <button type="button" onClick={() => handleEdit(product)}>
                      Editar
                    </button>
                    <button type="button" onClick={() => onDeleteProduct(product.id)}>
                      Eliminar
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </article>
    </section>
  );
}

export default AdminProductos;
