import { BookOpen, Video, Award } from "lucide-react"
import { useEffect, useState } from "react"
import GraficoProgreso from "../components/GraficoProgreso"

export default function HomePage(){

const [ahora,setAhora] = useState(new Date())

/* reloj */

useEffect(()=>{

const interval=setInterval(()=>{
setAhora(new Date())
},1000)

return ()=>clearInterval(interval)

},[])

/* ejemplo de fecha de sesión */

const proximaSesion = new Date()
proximaSesion.setHours(proximaSesion.getHours()+2)

/* contador */

function contador(fecha){

const diff = fecha - ahora

if(diff <=0) return "🔴 En vivo"

const horas = Math.floor(diff/(1000*60*60))
const minutos = Math.floor((diff%(1000*60*60))/(1000*60))
const segundos = Math.floor((diff%(1000*60))/1000)

return `${horas}h ${minutos}m ${segundos}s`

}

return(

<div className="space-y-8">

{/* BIENVENIDA */}

<div className="bg-gradient-to-r from-blue-600 to-indigo-700 
h-40 rounded-xl flex flex-col justify-center px-8 text-white shadow">

<h2 className="text-2xl font-bold">
👋 Bienvenido a tu Aula Virtual
</h2>

<p className="text-sm opacity-90 mt-2">
Sigue aprendiendo y completa tus cursos.
</p>

</div>


{/* TARJETAS */}

<div className="grid grid-cols-1 md:grid-cols-3 gap-6">

<Card
title="Cursos Activos"
value="3"
icon={<BookOpen size={28}/>}
color="bg-blue-100 text-blue-600"
/>

<Card
title="Sesiones"
value="12"
icon={<Video size={28}/>}
color="bg-red-100 text-red-600"
/>

<Card
title="Certificados"
value="1"
icon={<Award size={28}/>}
color="bg-green-100 text-green-600"
/>

</div>


{/* PROXIMA SESION */}

<div className="bg-white p-6 rounded-xl shadow">

<h3 className="text-lg font-semibold mb-4">
📅 Próxima sesión en vivo
</h3>

<div className="flex items-center justify-between">

<div>

<p className="font-medium">
React Avanzado
</p>

<p className="text-sm text-gray-500">
Hoy - 7:00 PM
</p>

<p className="text-sm mt-2 text-indigo-600 font-semibold">
⏳ Inicia en {contador(proximaSesion)}
</p>

</div>

<button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm">
Entrar a la sesión
</button>

</div>

</div>


{/* PROGRESO DE CURSOS */}

<div className="bg-white p-6 rounded-xl shadow">

<h3 className="text-lg font-semibold mb-6">
📈 Progreso de tus cursos
</h3>

<div className="grid grid-cols-1 md:grid-cols-3 gap-6">

<GraficoProgreso
nombre="React Avanzado"
progreso={70}
/>

<GraficoProgreso
nombre="Node.js Backend"
progreso={40}
/>

<GraficoProgreso
nombre="Bases de Datos"
progreso={85}
/>

</div>

</div>


{/* CERTIFICADO */}

<div className="bg-white p-6 rounded-xl shadow">

<h3 className="text-lg font-semibold mb-4">
🏆 Último certificado obtenido
</h3>

<p className="font-medium">
JavaScript Profesional
</p>

<p className="text-sm text-gray-500">
Emitido el 20 de Marzo
</p>

<button className="mt-3 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm">
Ver certificado
</button>

</div>

</div>

)

}



/* TARJETAS */

function Card({title,value,icon,color}){

return(

<div className="bg-white p-6 rounded-xl shadow flex items-center justify-between hover:shadow-md transition">

<div>

<p className="text-sm text-gray-500">
{title}
</p>

<p className="text-3xl font-bold mt-1">
{value}
</p>

</div>

<div className={`p-3 rounded-lg ${color}`}>
{icon}
</div>

</div>

)

}


/* PROGRESO CURSO */

function Curso({nombre,progreso}){

return(

<div className="mb-4">

<div className="flex justify-between text-sm mb-1">
<span>{nombre}</span>
<span>{progreso}%</span>
</div>

<div className="w-full bg-gray-200 h-2 rounded">

<div
className="bg-indigo-600 h-2 rounded"
style={{width:`${progreso}%`}}
></div>

</div>

</div>

)

}