import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getCart,
  removeFromCart,
  clearCart,
  increaseCartItem,
  decreaseCartItem,
} from "../../utils/cart";
import { carritoWebContent } from "../../data/carritoWebContent";

function CarritoWeb() {
  const [productosCarrito, setProductosCarrito] = useState([]);
  const { hero, list, summary } = carritoWebContent;

  const cargarCarrito = () => {
    const carritoGuardado = getCart();
    setProductosCarrito(carritoGuardado);
  };

  useEffect(() => {
    cargarCarrito();

    window.addEventListener("cartUpdated", cargarCarrito);
    window.addEventListener("storage", cargarCarrito);

    return () => {
      window.removeEventListener("cartUpdated", cargarCarrito);
      window.removeEventListener("storage", cargarCarrito);
    };
  }, []);

  const handleRemove = (cursoId) => {
    removeFromCart(cursoId);
    cargarCarrito();
  };

  const handleIncrease = (cursoId) => {
    increaseCartItem(cursoId);
    cargarCarrito();
  };

  const handleDecrease = (cursoId) => {
    decreaseCartItem(cursoId);
    cargarCarrito();
  };

  const handleClearCart = () => {
    clearCart();
    cargarCarrito();
  };

  const parsePrecio = (precio) =>
    Number(String(precio).replace(/[^\d.]/g, "")) || 0;

  const subtotal = productosCarrito.reduce((acc, item) => {
    const precio = parsePrecio(item.precio);
    const cantidad = Number(item.cantidad) || 0;
    return acc + precio * cantidad;
  }, 0);

  const descuento = 0;
  const total = subtotal - descuento;

  return (
    <main className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
      <section
        className="py-16 text-white"
        style={{
          background:
            "linear-gradient(135deg, var(--color-sidenav), var(--color-primary))",
        }}
      >
        <div className="mx-auto max-w-6xl px-5">
          <p className="mb-4 inline-block rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white/85 backdrop-blur">
            {hero.tag}
          </p>

          <h1 className="mb-4 text-4xl font-black md:text-5xl">
            {hero.title}
          </h1>

          <p className="max-w-3xl text-base leading-relaxed text-white/80 md:text-lg">
            {hero.description}
          </p>
        </div>
      </section>

      <section className="py-14">
        <div className="mx-auto grid max-w-6xl gap-6 px-5 lg:grid-cols-[2fr_1fr]">
          <div>
            <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-sm md:p-7">
              <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-2xl font-bold text-[var(--color-text)]">
                  {list.title}
                </h2>

                <span className="text-[var(--color-muted-text)]">
                  {productosCarrito.length} curso(s)
                </span>
              </div>

              {productosCarrito.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-background)] px-6 py-8">
                  <h3 className="mb-3 text-xl font-semibold text-[var(--color-text)]">
                    {list.emptyTitle}
                  </h3>

                  <p className="max-w-2xl leading-7 text-[var(--color-muted-text)]">
                    {list.emptyDescription}
                  </p>

                  <Link
                    to="/web/cursos"
                    className="mt-6 inline-flex rounded-xl bg-[var(--color-button-primary)] px-5 py-3 font-semibold text-[var(--color-button-primary-text)] transition hover:brightness-95"
                  >
                    Ver cursos
                  </Link>
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-4">
                    {productosCarrito.map((item) => {
                      const precioUnitario = parsePrecio(item.precio);
                      const cantidad = Number(item.cantidad) || 0;
                      const totalItem = precioUnitario * cantidad;

                      return (
                        <article
                          key={item.id}
                          className="grid gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-5 lg:grid-cols-[1.8fr_auto_auto_auto]"
                        >
                          <div>
                            <p className="mb-3 inline-block rounded-full bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] px-3 py-1 text-xs font-semibold text-[var(--color-primary)]">
                              {item.modalidad || "Curso"}
                            </p>

                            <h3 className="mb-2 text-xl font-bold text-[var(--color-text)]">
                              {item.titulo}
                            </h3>

                            <p className="text-sm text-[var(--color-muted-text)]">
                              {list.unitPriceLabel}: {item.precio}
                            </p>
                          </div>

                          <div className="flex flex-col items-start gap-3 lg:items-center">
                            <p className="text-sm font-semibold text-[var(--color-muted-text)]">
                              {list.quantityLabel}
                            </p>

                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => handleDecrease(item.id)}
                                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] text-xl font-bold text-[var(--color-text)] transition hover:bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] hover:text-[var(--color-primary)]"
                              >
                                -
                              </button>

                              <span className="min-w-[28px] text-center text-base font-bold text-[var(--color-text)]">
                                {cantidad}
                              </span>

                              <button
                                type="button"
                                onClick={() => handleIncrease(item.id)}
                                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] text-xl font-bold text-[var(--color-text)] transition hover:bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] hover:text-[var(--color-primary)]"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center">
                            <p className="text-xl font-bold text-[var(--color-primary)]">
                              S/ {totalItem.toFixed(2)}
                            </p>
                          </div>

                          <div className="flex items-center">
                            <button
                              type="button"
                              onClick={() => handleRemove(item.id)}
                              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-2 text-sm font-semibold text-[var(--color-text)] transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                            >
                              {list.removeButton}
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>

                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={handleClearCart}
                      className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] px-5 py-3 font-semibold text-[var(--color-text)] transition hover:bg-red-50 hover:text-red-700"
                    >
                      {list.clearButton}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <aside>
            <div className="sticky top-28 rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-sm md:p-7">
              <h2 className="mb-6 text-2xl font-bold text-[var(--color-text)]">
                {summary.title}
              </h2>

              <ResumenRow
                label={summary.subtotalLabel}
                value={`S/ ${subtotal.toFixed(2)}`}
              />

              <ResumenRow
                label={summary.discountLabel}
                value={`S/ ${descuento.toFixed(2)}`}
              />

              <div className="mb-6 flex items-center justify-between gap-4 border-t border-[var(--color-border)] pt-4 text-lg font-bold text-[var(--color-text)]">
                <span>{summary.totalLabel}</span>
                <span className="text-[var(--color-primary)]">
                  S/ {total.toFixed(2)}
                </span>
              </div>

              <button
                type="button"
                className="mb-3 w-full rounded-2xl bg-[var(--color-button-primary)] px-5 py-3 font-semibold text-[var(--color-button-primary-text)] transition hover:brightness-95"
              >
                {summary.checkoutButton}
              </button>

              <Link
                to="/web/cursos"
                className="block w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] px-5 py-3 text-center font-semibold text-[var(--color-text)] transition hover:bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] hover:text-[var(--color-primary)]"
              >
                {summary.exploreButton}
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function ResumenRow({ label, value }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4 text-[var(--color-muted-text)]">
      <span>{label}</span>
      <span className="font-semibold text-[var(--color-text)]">{value}</span>
    </div>
  );
}

export default CarritoWeb;