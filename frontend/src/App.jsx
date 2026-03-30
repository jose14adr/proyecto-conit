import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import ProtectedRoute from "./components/ProtectedRoute";

// WEB PUBLICA CONIT
import HeaderWeb from "./components/HeaderWeb";
import FooterWeb from "./components/FooterWeb";
import HomeWeb from "./pages/HomeWeb";
import CursosWeb from "./pages/CursosWeb";
import NosotrosWeb from "./pages/NosotrosWeb";
import ContactoWeb from "./pages/ContactoWeb";
import CarritoWeb from "./pages/CarritoWeb";

// ESTUDIANTE

import LayoutEstudiante from "./layouts/LayoutEstudiante";
import HomePage from "./pages/HomePage";
import MisCursos from "./pages/MisCursos";
import CursoDetalle from "./pages/CursoDetalle";
import MisSesiones from "./pages/MisSesiones";
import MisCertificados from "./pages/MisCertificados";
import Biblioteca from "./pages/Biblioteca";
import MiPerfil from "./pages/MiPerfil";
import MisPagos from "./pages/MisPagos";
import Matricula from "./pages/Matricula";

// ADMIN
import AdminLayout from "./admin/AdminLayout";
import Dashboard from "./admin/Dashboard";
import Docentes from "./admin/Docentes";
import Cursos from "./admin/Cursos";
import Alumnos from "./admin/Alumnos";
import Usuarios from "./admin/Usuarios";
import Pagos from "./admin/Pagos";

// DOCENTE
import DocenteLayout from "./docente/DocenteLayout";
import DashboardDocente from "./docente/DashboardDocente";
import PerfilDocente from "./docente/PerfilDocente";
import MisCursosDocente from "./docente/MisCursos";
import HorarioDocente from "./docente/HorarioDocente";
import CursoDetalleDocente from "./docente/CursoDetalleDocente";
import RegistroNotas from "./docente/RegistroNotas";
import ListaAprobados from "./docente/ListaAprobados";
import TareasDocente from "./docente/TareasDocente";

function PublicWebLayout({ children }) {
  return (
    <>
      <HeaderWeb />
      {children}
      <FooterWeb />
    </>
  );
}

export default function App() {
  return (
    <>
      <Toaster position="top-right" />

      <Routes>
        {/* LOGIN */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* WEB PUBLICA CONIT */}
        <Route
          path="/web"
          element={
            <PublicWebLayout>
              <HomeWeb />
            </PublicWebLayout>
          }
        />
        <Route
          path="/web/cursos"
          element={
            <PublicWebLayout>
              <CursosWeb />
            </PublicWebLayout>
          }
        />
        <Route
          path="/web/nosotros"
          element={
            <PublicWebLayout>
              <NosotrosWeb />
            </PublicWebLayout>
          }
        />
        <Route
          path="/web/contacto"
          element={
            <PublicWebLayout>
              <ContactoWeb />
            </PublicWebLayout>
          }
        />
        <Route
          path="/web/carrito"
          element={
            <PublicWebLayout>
              <CarritoWeb />
            </PublicWebLayout>
          }
        />

        <Route element={<ProtectedRoute />}>
          {/* ESTUDIANTE */}
          <Route path="/" element={<LayoutEstudiante />}>
            <Route index element={<HomePage />} />
            <Route path="mis-cursos" element={<MisCursos />} />
            <Route path="/curso/:id" element={<CursoDetalleDocente />} />
            <Route path="/mis-cursos/:id" element={<CursoDetalle />} />
            <Route path="mis-sesiones" element={<MisSesiones />} />
            <Route path="mis-certificados" element={<MisCertificados />} />
            <Route path="mi-perfil" element={<MiPerfil />} />
            <Route path="mis-pagos" element={<MisPagos />} />
            <Route path="matricula" element={<Matricula />} />
            <Route path="/recursos" element={<Biblioteca />} />
          </Route>

          {/* ADMIN */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="docentes" element={<Docentes />} />
            <Route path="cursos" element={<Cursos />} />
            <Route path="alumnos" element={<Alumnos />} />
            <Route path="usuarios" element={<Usuarios />} />
            <Route path="pagos" element={<Pagos />} />
          </Route>

          {/* DOCENTE */}
          <Route path="/docente" element={<DocenteLayout />}>
            <Route index element={<DashboardDocente />} />
            <Route path="perfil" element={<PerfilDocente />} />
            <Route path="cursos" element={<MisCursosDocente />} />
            <Route path="cursos/:id" element={<CursoDetalleDocente />} />
            <Route path="notas" element={<RegistroNotas />} />
            <Route path="aprobados" element={<ListaAprobados />} />
            <Route path="horario" element={<HorarioDocente />} />
            <Route path="tareas" element={<TareasDocente />} />
          </Route>
        </Route>

        {/* Ruta comodín */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}