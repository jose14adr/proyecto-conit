import { createContext, useState, useEffect } from "react"

export const NotificacionesContext = createContext()

export function NotificacionesProvider({ children }) {

  const [notificaciones, setNotificaciones] = useState([])

  useEffect(() => {
    const data =
      JSON.parse(localStorage.getItem("notificaciones")) || []
    setNotificaciones(data)
  }, [])

  const agregarNotificacion = (mensaje) => {

    const nuevas = [
      ...notificaciones,
      { mensaje, fecha: new Date() }
    ]

    setNotificaciones(nuevas)

    localStorage.setItem(
      "notificaciones",
      JSON.stringify(nuevas)
    )
  }

  return (
    <NotificacionesContext.Provider
      value={{
        notificaciones,
        agregarNotificacion
      }}
    >
      {children}
    </NotificacionesContext.Provider>
  )
}