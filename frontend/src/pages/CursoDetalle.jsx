import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import axios from "axios"

export default function CursoDetalle(){

const { id } = useParams()

const [curso,setCurso] = useState(null)
const [tareas,setTareas] = useState([])
const [unidadAbierta,setUnidadAbierta] = useState(null)
const [progreso,setProgreso] = useState(0)


/* ========================= */
/* CARGAR CURSO */
/* ========================= */

useEffect(()=>{

async function cargarCurso(){

try{

const res = await axios.get(`http://localhost:3000/curso/${id}`)

console.log("CURSO:",res.data)

setCurso(res.data)

}catch(err){

console.log("Error cargando curso",err)

}

}

cargarCurso()

},[id])



/* ========================= */
/* CARGAR TAREAS */
/* ========================= */

useEffect(()=>{

async function cargarTareas(){

try{

const res = await axios.get(`http://localhost:3000/tarea/${id}`)

console.log("TAREAS:",res.data)

setTareas(res.data)

}catch(err){

console.log("Error cargando tareas",err)

}

}

cargarTareas()

},[id])



if(!curso){

return <div className="p-10">Cargando curso...</div>

}



/* UNIDADES SEGÚN TU JSON */
const unidades = curso?.temario?.unidades || []



return(

<div className="w-full px-10 py-8">


{/* HEADER */}

<div className="bg-indigo-600 text-white p-6 rounded-lg mb-8">

<h1 className="text-2xl font-bold">
{curso.nombrecurso}
</h1>

<p className="opacity-90">
{curso.descripcion}
</p>

</div>



<div className="grid grid-cols-4 gap-8">


{/* CONTENIDO */}

<div className="col-span-3 space-y-4">


{unidades.length===0 && (

<p className="text-gray-500">
Este curso aún no tiene unidades
</p>

)}



{unidades.map(unidad=>(

<div
key={unidad.id}
className="border rounded-lg bg-white shadow"
>

<button
onClick={()=>setUnidadAbierta(
unidadAbierta===unidad.id ? null : unidad.id
)}
className="w-full flex justify-between p-4 bg-gray-100 hover:bg-gray-200"
>

<span className="font-semibold">
📚 {unidad.nombreunidad}
</span>

<span>
{unidadAbierta===unidad.id ? "▲":"▼"}
</span>

</button>



{unidadAbierta===unidad.id && (

<div className="p-4 space-y-4">

<p className="text-gray-600">
{unidad.descripcion}
</p>


{/* SESION */}

<div className="border p-4 rounded bg-gray-50">

<p className="font-medium mb-2">
🎬 {unidad.sesion?.nombresesion}
</p>

{/* VIDEO */}

<video controls className="w-full rounded">

<source src="/videos/demo.mp4" type="video/mp4" />

Tu navegador no soporta video

</video>

</div>


</div>

)}

</div>

))}

</div>



{/* SIDEBAR */}

<div className="col-span-1 space-y-6">


{/* PROGRESO */}

<div className="bg-white border rounded-lg p-5 shadow">

<h3 className="font-semibold mb-3">
Progreso
</h3>

<div className="w-full bg-gray-200 rounded-full h-4">

<div
className="bg-green-500 h-4 rounded-full"
style={{width:`${progreso}%`}}
/>

</div>

<p className="text-sm mt-2">
{progreso}% completado
</p>

</div>



{/* DOCENTE */}

<div className="bg-white border rounded-lg p-5 shadow">

<h3 className="font-semibold mb-2">
Docente
</h3>

<p>

👨‍🏫 {curso.grupos?.[0]?.docente?.nombre}{" "}
{curso.grupos?.[0]?.docente?.apellido}

</p>

<p className="text-sm text-gray-500">

{curso.grupos?.[0]?.docente?.correo}

</p>

</div>



{/* TAREAS */}

<div className="bg-white border rounded-lg p-5 shadow">

<h3 className="font-semibold mb-2">
Tareas
</h3>

{tareas.length===0 && (

<p className="text-sm text-gray-500">
No hay tareas
</p>

)}



{tareas.map(t=>(

<div
key={t.id}
className="border p-2 rounded mb-2"
>

<p className="font-medium">
📝 {t.titulo}
</p>

<p className="text-sm text-gray-500">
Fecha límite: {t.fecha_limite}
</p>

</div>

))}

</div>


</div>


</div>


</div>

)

}