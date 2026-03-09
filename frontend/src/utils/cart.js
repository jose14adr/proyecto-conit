// =============================
// CLAVE QUE USAREMOS EN LOCALSTORAGE
// =============================
const CART_KEY = "conit_cart";

// =============================
// NOTIFICAR CAMBIOS DEL CARRITO
// =============================
function notifyCartUpdated() {
  window.dispatchEvent(new Event("cartUpdated"));
}

// =============================
// OBTENER TODO EL CARRITO
// =============================
export function getCart() {
  const cart = localStorage.getItem(CART_KEY);
  return cart ? JSON.parse(cart) : [];
}

// =============================
// GUARDAR TODO EL CARRITO
// =============================
export function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  notifyCartUpdated();
}

// =============================
// AGREGAR UN CURSO AL CARRITO
// =============================
export function addToCart(curso) {
  const cart = getCart();

  const existingCurso = cart.find((item) => item.id === curso.id);

  if (existingCurso) {
    existingCurso.cantidad += 1;
  } else {
    cart.push({
      ...curso,
      cantidad: 1,
    });
  }

  saveCart(cart);
}

// =============================
// AUMENTAR CANTIDAD DE UN CURSO
// =============================
export function increaseCartItem(cursoId) {
  const cart = getCart();

  const curso = cart.find((item) => item.id === cursoId);
  if (!curso) return;

  curso.cantidad += 1;
  saveCart(cart);
}

// =============================
// DISMINUIR CANTIDAD DE UN CURSO
// =============================
export function decreaseCartItem(cursoId) {
  const cart = getCart();

  const curso = cart.find((item) => item.id === cursoId);
  if (!curso) return;

  curso.cantidad -= 1;

  // Si la cantidad llega a 0, eliminamos el curso
  const updatedCart = cart.filter((item) => item.cantidad > 0);

  saveCart(updatedCart);
}

// =============================
// ELIMINAR UN CURSO COMPLETO
// =============================
export function removeFromCart(cursoId) {
  const cart = getCart().filter((item) => item.id !== cursoId);
  saveCart(cart);
}

// =============================
// LIMPIAR TODO EL CARRITO
// =============================
export function clearCart() {
  localStorage.removeItem(CART_KEY);
  notifyCartUpdated();
}

// =============================
// CONTAR TOTAL DE CURSOS
// =============================
export function getCartCount() {
  const cart = getCart();

  return cart.reduce((total, item) => {
    return total + item.cantidad;
  }, 0);
}