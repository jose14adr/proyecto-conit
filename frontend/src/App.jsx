import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import ProtectedRoute from "./components/ProtectedRoute";

// WEB PUBLICA CONIT
import HeaderWeb from "./components/HeaderWeb";
import FooterWeb from "./components/FooterWeb";
import HomeWeb from "./pages/web/HomeWeb";
import CursosWeb from "./pages/web/CursosWeb";
import NosotrosWeb from "./pages/web/NosotrosWeb";
import ContactoWeb from "./pages/web/ContactoWeb";
import CarritoWeb from "./pages/web/CarritoWeb";
import DetalleCursoWeb from "./pages/web/DetalleCursoWeb";
import PaginaDinamicaWeb from "./pages/web/PaginaDinamicaWeb";

// ESTUDIANTE

import LayoutEstudiante from "./alumno/LayoutEstudiante";
import HomePage from "./alumno/HomePage";
import MisCursos from "./alumno/MisCursos";
import CursoDetalle from "./alumno/CursoDetalle";
import MisSesiones from "./alumno/MisSesiones";
import MisCertificados from "./alumno/MisCertificados";
import Biblioteca from "./alumno/Biblioteca";
import MiPerfil from "./alumno/MiPerfil";
import MisPagos from "./alumno/MisPagos";
import Matricula from "./alumno/Matricula";
import Soporte from "./alumno//Soporte";
import HistorialAcademico from "./alumno/HistorialAcademico";
import AsistenciaAlumno from "./alumno/AsistenciaAlumno";

import CursoDetalleAdmin from "./admin/CursoDetalleAdmin";

// ADMIN
const AdminLayout = lazy(() => import("./admin/AdminLayout"));
const Dashboard = lazy(() => import("./admin/Dashboard"));
const Administradores = lazy(() => import("./admin/Administradores"));
const Docentes = lazy(() => import("./admin/Docentes"));
const Cursos = lazy(() => import("./admin/Cursos"));
const Alumnos = lazy(() => import("./admin/Alumnos"));
const Usuarios = lazy(() => import("./admin/Usuarios"));
const Pagos = lazy(() => import("./admin/Pagos"));
const ControlSesiones = lazy(() => import("./admin/ControlSesiones"));
const Certificados = lazy(() => import("./admin/Certificados"));
const PerfilAdministrador = lazy(() => import("./admin/PerfilAdministrador"));
const GestionWeb = lazy(() => import("./admin/GestionWeb"));



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

const PantallaCarga = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
    <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
    <p className="mt-4 text-gray-500 font-medium">Cargando módulo...</p>
  </div>
);

export default function App() {
  return (
    <>
      <Toaster position="top-right" />

      <Suspense fallback={<PantallaCarga />}>
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
            path="/web/cursos/:id"
            element={
              <PublicWebLayout>
                <DetalleCursoWeb />
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
          <Route
            path="/web/:slug"
            element={
              <PublicWebLayout>
                <PaginaDinamicaWeb />
              </PublicWebLayout>
            }
          />

          {/* ESTUDIANTES */}
          <Route element={<ProtectedRoute allowedRoles={["ALUMNO"]} />}>
            <Route path="/alumno" element={<LayoutEstudiante />}>
              <Route index element={<HomePage />} />
              <Route path="mis-cursos" element={<MisCursos />} />
              <Route path="mis-cursos/:id" element={<CursoDetalle />} />
              <Route path="mis-sesiones" element={<MisSesiones />} />
              <Route path="mis-certificados" element={<MisCertificados />} />
              <Route path="soporte" element={<Soporte />} />
              <Route path="mi-perfil" element={<MiPerfil />} />
              <Route path="mis-pagos" element={<MisPagos />} />
              <Route path="matricula" element={<Matricula />} />
              <Route path="recursos" element={<Biblioteca />} />
              <Route path="historial" element={<HistorialAcademico />} />
              <Route path="asistencia" element={<AsistenciaAlumno />} />
            </Route>
          </Route>

          {/* ADMINISTRADORES */}
          <Route
            element={
              <ProtectedRoute allowedRoles={["ADMINISTRADOR", "ADMIN"]} />
            }
          >
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="administradores" element={<Administradores />} />
              <Route path="docentes" element={<Docentes />} />
              <Route path="cursos" element={<Cursos />} />
              <Route path="cursos/:id" element={<CursoDetalleAdmin />} />
              <Route path="alumnos" element={<Alumnos />} />
              <Route path="usuarios" element={<Usuarios />} />
              <Route path="pagos" element={<Pagos />} />
              <Route path="sesiones" element={<ControlSesiones />} />
              <Route path="certificados" element={<Certificados />} />
              <Route path="perfil" element={<PerfilAdministrador />} />
              <Route path="gestion-web" element={<GestionWeb />} />
            </Route>
          </Route>

          {/* DOCENTES */}
          <Route element={<ProtectedRoute allowedRoles={["DOCENTE"]} />}>
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
      </Suspense>
    </>
  );
}
