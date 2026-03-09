import { useEffect, useState } from "react";
import {
  getCart,
  removeFromCart,
  clearCart,
  increaseCartItem,
  decreaseCartItem,
} from "../utils/cart";
import "./CarritoWeb.css";

function CarritoWeb() {
  // =============================
  // ESTADO DEL CARRITO
  // =============================
  const [productosCarrito, setProductosCarrito] = useState([]);

  // =============================
  // FUNCIÓN PARA CARGAR EL CARRITO
  // =============================
  const cargarCarrito = () => {
    const carritoGuardado = getCart();
    setProductosCarrito(carritoGuardado);
  };

  // =============================
  // CARGAR CARRITO AL INICIAR
  // =============================
  useEffect(() => {
    cargarCarrito();

    // Escucha cambios del carrito
    window.addEventListener("cartUpdated", cargarCarrito);
    window.addEventListener("storage", cargarCarrito);

    return () => {
      window.removeEventListener("cartUpdated", cargarCarrito);
      window.removeEventListener("storage", cargarCarrito);
    };
  }, []);

  // =============================
  // ELIMINAR UN CURSO COMPLETO
  // =============================
  const handleRemove = (cursoId) => {
    removeFromCart(cursoId);
    cargarCarrito();
  };

  // =============================
  // AUMENTAR CANTIDAD
  // =============================
  const handleIncrease = (cursoId) => {
    increaseCartItem(cursoId);
    cargarCarrito();
  };

  // =============================
  // DISMINUIR CANTIDAD
  // =============================
  const handleDecrease = (cursoId) => {
    decreaseCartItem(cursoId);
    cargarCarrito();
  };

  // =============================
  // VACIAR TODO EL CARRITO
  // =============================
  const handleClearCart = () => {
    clearCart();
    cargarCarrito();
  };

  // =============================
  // CÁLCULOS DEL RESUMEN
  // =============================
  const subtotal = productosCarrito.reduce((acc, item) => {
    return acc + item.precio * item.cantidad;
  }, 0);

  const descuento = 0;
  const total = subtotal - descuento;

  return (
    <main className="carrito-web">
      {/* ============================= */}
      {/* HERO / ENCABEZADO */}
      {/* ============================= */}
      <section className="carrito-web-hero">
        <div className="carrito-web-container">
          <p className="carrito-web-tag">Tu compra</p>
          <h1>Carrito de cursos</h1>
          <p className="carrito-web-description">
            Revisa los cursos seleccionados antes de continuar con el proceso de
            matrícula o pago.
          </p>
        </div>
      </section>

      {/* ============================= */}
      {/* CONTENIDO PRINCIPAL */}
      {/* ============================= */}
      <section className="carrito-web-content">
        <div className="carrito-web-container carrito-web-grid">
          {/* ============================= */}
          {/* LISTA DE PRODUCTOS */}
          {/* ============================= */}
          <div className="carrito-web-list">
            <div className="carrito-web-card">
              <div className="carrito-web-header-row">
                <h2>Cursos agregados</h2>
                <span>{productosCarrito.length} curso(s)</span>
              </div>

              {productosCarrito.length === 0 ? (
                <div className="carrito-web-empty">
                  <h3>Tu carrito está vacío</h3>
                  <p>
                    Aún no has agregado cursos. Explora nuestro catálogo y elige
                    el programa que más te interese.
                  </p>
                </div>
              ) : (
                <>
                  {/* ============================= */}
                  {/* LISTADO DE ÍTEMS */}
                  {/* ============================= */}
                  <div className="carrito-web-items">
                    {productosCarrito.map((item) => (
                      <article className="carrito-item-web" key={item.id}>
                        {/* Información del curso */}
                        <div className="carrito-item-web-info">
                          <p className="carrito-item-web-badge">
                            {item.modalidad}
                          </p>
                          <h3>{item.titulo}</h3>
                          <p className="carrito-item-web-meta">
                            Precio unitario: S/ {item.precio}
                          </p>
                        </div>

                        {/* Control de cantidad */}
                        <div className="carrito-item-web-quantity">
                          <p className="quantity-label-web">Cantidad</p>

                          <div className="quantity-controls-web">
                            <button
                              className="quantity-btn-web"
                              onClick={() => handleDecrease(item.id)}
                            >
                              -
                            </button>

                            <span className="quantity-value-web">
                              {item.cantidad}
                            </span>

                            <button
                              className="quantity-btn-web"
                              onClick={() => handleIncrease(item.id)}
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Precio total por ítem */}
                        <div className="carrito-item-web-price">
                          <p>S/ {item.precio * item.cantidad}</p>
                        </div>

                        {/* Acción de eliminar */}
                        <div className="carrito-item-web-actions">
                          <button
                            className="btn-carrito btn-carrito-light"
                            onClick={() => handleRemove(item.id)}
                          >
                            Quitar
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>

                  {/* ============================= */}
                  {/* BOTÓN VACIAR CARRITO */}
                  {/* ============================= */}
                  <div className="carrito-web-clear">
                    <button
                      className="btn-carrito btn-carrito-secondary"
                      onClick={handleClearCart}
                    >
                      Vaciar carrito
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ============================= */}
          {/* RESUMEN DE COMPRA */}
          {/* ============================= */}
          <aside className="carrito-web-summary">
            <div className="carrito-web-card">
              <h2>Resumen</h2>

              <div className="summary-web-row">
                <span>Subtotal</span>
                <span>S/ {subtotal}</span>
              </div>

              <div className="summary-web-row">
                <span>Descuento</span>
                <span>S/ {descuento}</span>
              </div>

              <div className="summary-web-row summary-web-total">
                <span>Total</span>
                <span>S/ {total}</span>
              </div>

              <button className="btn-carrito btn-carrito-primary">
                Continuar compra
              </button>

              <button className="btn-carrito btn-carrito-secondary">
                Seguir explorando cursos
              </button>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

export default CarritoWeb;