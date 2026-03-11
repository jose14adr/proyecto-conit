import { Users, BookOpen, GraduationCap, CreditCard, TrendingUp } from "lucide-react";

export default function Dashboard() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">
        Dashboard
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

        <Card title="Usuarios" value="124" />
        <Card title="Docentes" value="18" />
        <Card title="Cursos" value="18" />
        <Card title="Alumnos" value="18" />
        <Card title="Pagos Hoy" value="S/ 3,450" />
        <Card title="Pendientes" value="12" />

      </div>
    </div>
  )
}

function Card({ title, value }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  )
}
