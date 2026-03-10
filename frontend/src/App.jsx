import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import ProtectedRoute from "./components/ProtectedRoute";

import LayoutEstudiante from "./layouts/LayoutEstudiante";
import HomePage from "./pages/HomePage";
import MisCursos from "./pages/MisCursos";
import CursoDetalle from "./pages/CursoDetalle";
import MisSesiones from "./pages/MisSesiones";
import MisCertificados from "./pages/MisCertificados";
import Biblioteca from "./pages/Biblioteca";
import MiPerfil from "./pages/MiPerfil";
import MisPagos from "./pages/MisPagos";
import AdminLayout from "./admin/AdminLayout";
import Dashboard from "./admin/Dashboard";
import Docentes from "./admin/docentes";
import Cursos from "./admin/Cursos";
import Alumnos from "./admin/alumnos";
import Usuarios from "./admin/Usuarios";
import Pagos from "./admin/Pagos";

import Matricula from "./pages/Matricula";

import DocenteLayout from "./docente/DocenteLayout"
import PerfilDocente from "./docente/PerfilDocente"
import MisCursosDocente from "./docente/MisCursos"
import HorarioDocente from "./docente/HorarioDocente"
import CursoDetalleDocente from "./docente/CursoDetalleDocente"
import RegistroNotas from "./docente/RegistroNotas"
import ListaAprobados from "./docente/ListaAprobados"

export default function App() {
  return (
    <>
      {/*Muestra alertas de notificaciones*/}
      <Toaster position="top-right" />

      <Routes>
        {/*Login*/}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route element={<ProtectedRoute />}>
          {/* ESTUDIANTE */}
          <Route path="/" element={<LayoutEstudiante />}>
            <Route index element={<HomePage />} />
            <Route path="mis-cursos" element={<MisCursos />} />
            <Route path="/curso/:id" element={<CursoDetalle />} />
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
            <Route path="perfil" element={<PerfilDocente />} />
            <Route path="cursos" element={<MisCursosDocente />} />
            <Route path="cursos/:id" element={<CursoDetalleDocente />} />
            <Route path="notas" element={<RegistroNotas />} />
            <Route path="aprobados" element={<ListaAprobados />} />
            <Route path="horario" element={<HorarioDocente />} />
          </Route>
        </Route>
        {/*Ruta Comodín*/}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}
