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
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="bg-gradient-to-r from-slate-900 to-blue-900 py-16 text-white">
        <div className="mx-auto max-w-6xl px-5">
          <p className="mb-4 inline-block rounded-full bg-sky-400/20 px-4 py-2 text-sm font-semibold text-sky-300">
            {hero.tag}
          </p>

          <h1 className="mb-4 text-4xl font-bold md:text-5xl">
            {hero.title}
          </h1>

          <p className="max-w-3xl text-base leading-relaxed text-slate-200 md:text-lg">
            {hero.description}
          </p>
        </div>
      </section>

      <section className="py-14">
        <div className="mx-auto grid max-w-6xl gap-6 px-5 lg:grid-cols-[2fr_1fr]">
          <div>
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 md:p-7">
              <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-2xl font-bold text-slate-900">
                  {list.title}
                </h2>
                <span className="text-slate-500">
                  {productosCarrito.length} curso(s)
                </span>
              </div>

              {productosCarrito.length === 0 ? (
                <div className="py-8">
                  <h3 className="mb-3 text-xl font-semibold text-slate-900">
                    {list.emptyTitle}
                  </h3>
                  <p className="max-w-2xl leading-7 text-slate-600">
                    {list.emptyDescription}
                  </p>

                  <Link
                    to="/web/cursos"
                    className="mt-6 inline-flex rounded-xl bg-sky-500 px-5 py-3 font-semibold text-white transition hover:bg-sky-600"
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
                          className="grid gap-4 rounded-2xl border border-slate-200 p-5 lg:grid-cols-[1.8fr_auto_auto_auto]"
                        >
                          <div>
                            <p className="mb-3 inline-block rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
                              {item.modalidad || "Curso"}
                            </p>

                            <h3 className="mb-2 text-xl font-bold text-slate-900">
                              {item.titulo}
                            </h3>

                            <p className="text-sm text-slate-500">
                              {list.unitPriceLabel}: {item.precio}
                            </p>
                          </div>

                          <div className="flex flex-col items-start gap-3 lg:items-center">
                            <p className="text-sm font-semibold text-slate-500">
                              {list.quantityLabel}
                            </p>

                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => handleDecrease(item.id)}
                                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-200 text-xl font-bold text-slate-900 transition hover:bg-slate-300"
                              >
                                -
                              </button>

                              <span className="min-w-[28px] text-center text-base font-bold text-slate-900">
                                {cantidad}
                              </span>

                              <button
                                type="button"
                                onClick={() => handleIncrease(item.id)}
                                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-200 text-xl font-bold text-slate-900 transition hover:bg-slate-300"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center">
                            <p className="text-xl font-bold text-slate-900">
                              S/ {totalItem.toFixed(2)}
                            </p>
                          </div>

                          <div className="flex items-center">
                            <button
                              type="button"
                              onClick={() => handleRemove(item.id)}
                              className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-200"
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
                      className="w-full rounded-2xl bg-slate-200 px-5 py-3 font-semibold text-slate-900 transition hover:bg-slate-300"
                    >
                      {list.clearButton}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <aside>
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 md:p-7">
              <h2 className="mb-6 text-2xl font-bold text-slate-900">
                {summary.title}
              </h2>

              <div className="mb-4 flex items-center justify-between gap-4 text-slate-700">
                <span>{summary.subtotalLabel}</span>
                <span className="font-semibold">S/ {subtotal.toFixed(2)}</span>
              </div>

              <div className="mb-4 flex items-center justify-between gap-4 text-slate-700">
                <span>{summary.discountLabel}</span>
                <span className="font-semibold">S/ {descuento.toFixed(2)}</span>
              </div>

              <div className="mb-6 flex items-center justify-between gap-4 border-t border-slate-200 pt-4 text-lg font-bold text-slate-900">
                <span>{summary.totalLabel}</span>
                <span>S/ {total.toFixed(2)}</span>
              </div>

              <button
                type="button"
                className="mb-3 w-full rounded-2xl bg-sky-500 px-5 py-3 font-semibold text-white transition hover:bg-sky-600"
              >
                {summary.checkoutButton}
              </button>

              <Link
                to="/web/cursos"
                className="block w-full rounded-2xl bg-slate-200 px-5 py-3 text-center font-semibold text-slate-900 transition hover:bg-slate-300"
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

export default CarritoWeb;