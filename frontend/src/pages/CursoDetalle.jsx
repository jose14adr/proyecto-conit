import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import axios from "axios"

export default function CursoDetalle(){

const { id } = useParams()

const [curso,setCurso] = useState(null)
const [tareas,setTareas] = useState([])
const [unidadAbierta,setUnidadAbierta] = useState(null)
const [progreso,setProgreso] = useState(0)
const [videoAlumno,setVideoAlumno] = useState(null)
const [subiendo,setSubiendo] = useState(false)
const [videoSubido,setVideoSubido] = useState(null)


/* ========================= */
/* CARGAR CURSO */
/* ========================= */

useEffect(()=>{

async function cargarCurso(){

try{

const res = await axios.get(`http://localhost:3000/curso/${id}`)
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
setTareas(res.data)

}catch(err){

console.log("Error cargando tareas",err)

}

}

cargarTareas()

},[id])



/* ========================= */
/* CALCULAR PROGRESO */
/* ========================= */

useEffect(()=>{

if(!curso) return

let total=0
let vistos=0

const unidades = curso?.temario?.unidades || []

unidades.forEach(u=>{

if(u.sesion){
total++
}

})

if(total>0){

setProgreso(Math.round((vistos/total)*100))

}

},[curso])



if(!curso){

return <div className="p-10">Cargando curso...</div>

}

async function subirVideo(){

if(!videoAlumno) return

try{

setSubiendo(true)

const formData = new FormData()
formData.append("video",videoAlumno)

const res = await axios.post(
"http://localhost:3000/videos/upload",
formData,
{
headers:{
"Content-Type":"multipart/form-data"
}
}
)

setTimeout(() => {
  setVideoSubido(res.data.embed)
}, 8000)

}catch(err){

console.log("Error subiendo video",err)

}finally{

setSubiendo(false)

}

}



/* UNIDADES */
const unidades = curso?.temario?.unidades || []



return(

<div className="w-full px-10 py-8">


{/* HEADER */}

<div className="bg-indigo-600 text-white p-6 rounded-lg mb-8">

<h1 className="text-2xl font-bold">
{curso.nombrecurso}
</h1>

<p>
{curso.descripcion}
</p>

</div>



<div className="grid grid-cols-4 gap-8">


{/* CONTENIDO */}

<div className="col-span-3 space-y-4">


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

<div className="p-4 space-y-6">

<p className="text-gray-600">
{unidad.descripcion}
</p>


{/* SESION */}

<div className="border p-4 rounded bg-gray-50 space-y-4">

<p className="font-semibold">
🎬 {unidad.sesion?.nombresesion}
</p>


{/* VIDEO */}

<video controls className="w-full rounded">

<source src="/videos/demo.mp4" type="video/mp4"/>

</video>



{/* DOCUMENTOS DEL DOCENTE */}

<div>

<h4 className="font-semibold mb-3">
📂 Material del docente
</h4>

<div className="flex gap-4 flex-wrap">

{unidad.sesion?.documentos?.length > 0 ? (

unidad.sesion.documentos.map(doc=>(

<a
key={doc.id}
href={doc.archivo}
target="_blank"
className="border p-3 rounded bg-white hover:bg-gray-100 flex items-center gap-2"
>

<span>📄</span>
<span>{doc.titulo}</span>

</a>

))

) : (

<p className="text-sm text-gray-500">
No hay documentos disponibles
</p>

)}

</div>

</div>


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
Progreso del curso
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

{/* SUBIR VIDEO DEL ALUMNO */}

<div className="bg-white border rounded-lg p-5 shadow">

<h3 className="font-semibold mb-3">
🎥 Entregar video
</h3>

<input
type="file"
accept="video/*"
onChange={(e)=>setVideoAlumno(e.target.files[0])}
/>

<button
onClick={subirVideo}
className="mt-3 w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700"
>

{subiendo ? "Subiendo..." : "Subir video"}

</button>

{videoSubido && (

<div className="mt-4">

<p className="text-sm mb-2">
Video enviado
</p>

<iframe
  src={videoSubido}
  width="100%"
  height="200"
  allow="autoplay; fullscreen"
  style={{ border: "none" }}
/>

</div>

)}

</div>


</div>


</div>


</div>

)

}