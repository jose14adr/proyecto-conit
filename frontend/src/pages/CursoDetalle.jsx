import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import axios from "axios"
import { guardarArchivo, obtenerArchivo, eliminarArchivo } from "../utils/db"

export default function CursoDetalle(){

const { id } = useParams()

const [curso,setCurso] = useState(null)
const [tareas,setTareas] = useState([])
const [unidadAbierta,setUnidadAbierta] = useState(null)
const [progreso,setProgreso] = useState(0)

const [tareaAbierta,setTareaAbierta] = useState(null)
const [tareasAbiertas, setTareasAbiertas] = useState({})

const [videoAlumno,setVideoAlumno] = useState(null)
const [videoSubido,setVideoSubido] = useState(null)
const [entregaId,setEntregaId] = useState(null)

const [respuestas,setRespuestasId] = useState(null)

const [modo,setModo] = useState("nuevo")
const [subiendo,setSubiendo] = useState(false)
const [progresoUpload, setProgresoUpload] = useState(0)


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
/* CARGAR EXAMEN */
/* ========================= */


/* ========================= */
/* OBTENER ENTREGA */
/* ========================= */

/*
useEffect(()=>{

async function obtenerEntrega(){

try{

const res = await axios.get(`http://localhost:3000/entregas_video/${id}`)

if(res.data){
setVideoSubido(res.data.video_url)
setEntregaId(res.data.id)
setModo("listo")
}

}catch(err){
console.log("Sin entrega aún")
}

}

obtenerEntrega()

},[id])*/


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


/* ========================= */
/* SUBIR VIDEO */
/* ========================= */
{/*
async function subirVideo(fileParam=null){

const file = fileParam || videoAlumno
if(!file) return

try{

setVideoSubido(null)
setSubiendo(true)
setModo("subiendo")

const key = `video-${file.name}-${file.size}`

await guardarArchivo(key, file)
localStorage.setItem("videoEstado", JSON.stringify({ key }))

const formData = new FormData()
formData.append("video", file)

const res = await axios.post(
"http://localhost:3000/videos/upload",
formData,
{
headers:{
"Content-Type":"multipart/form-data"
},
onUploadProgress: (progressEvent) => {

const percent = Math.round(
(progressEvent.loaded * 100) / progressEvent.total
)

setProgresoUpload(percent)

}
}
)

const embed = res.data.embed

setVideoSubido(embed)
setModo("listo")

if(entregaId){

await axios.put(
`http://localhost:3000/entregas_video/${entregaId}`,
{ video_url: embed }
)

}else{

const response = await axios.post(
"http://localhost:3000/entregas_video",
{
alumno_id: 1,
tarea_id: 1,
curso_id: id,
video_url: embed
}
)

setEntregaId(response.data.id)
}

await eliminarArchivo(key)
localStorage.removeItem("videoEstado")
}catch(err){
console.log("Error subiendo video",err)
}finally{
setSubiendo(false)
}

}
*/}

/* ========================= */
/* REANUDAR VIDEO */
/* ========================= */
{/*
async function reanudarVideo(){

try{

const data = JSON.parse(localStorage.getItem("videoEstado"))

if(!data?.key){
  setModo("nuevo")
  return
}

const archivo = await obtenerArchivo(data.key)

if(!archivo){
  // 🔥 limpiar si ya no existe
  localStorage.removeItem("videoEstado")
  setModo("nuevo")
  return
}

// 🔥 usar variable correcta
subirVideo(archivo)

}catch(error){
console.log("Error reanudando:", error)
setModo("nuevo")
}

}
*/}
/* ========================= */
/* DETECTAR REANUDAR */
/* ========================= */
{/*
useEffect(()=>{

async function verificarEstado(){

const data = JSON.parse(localStorage.getItem("videoEstado"))

try{

// 🔍 1. VERIFICAR BD
const res = await axios.get(`http://localhost:3000/entregas_video/${id}`)

if(res.data){
  // ✅ YA SUBIDO
  setVideoSubido(res.data.video_url)
  setEntregaId(res.data.id)
  setModo("listo")

  // 🔥 limpiar residuos
  if(data?.key){
    await eliminarArchivo(data.key)
    localStorage.removeItem("videoEstado")
  }

  return
}

// 🔍 2. SI NO HAY EN BD → VERIFICAR ARCHIVO REAL
if(data?.key){

  const archivo = await obtenerArchivo(data.key)

  if(archivo){
    // 🟡 HAY ARCHIVO → REANUDAR
    setModo("reanudar")
    return
  }else{
    // ❌ NO HAY ARCHIVO → LIMPIAR
    localStorage.removeItem("videoEstado")
    setModo("nuevo")
    return
  }

}

// 🔍 3. NADA
setModo("nuevo")

}catch(err){

// fallback inteligente
if(data?.key){

  const archivo = await obtenerArchivo(data.key)

  if(archivo){
    setModo("reanudar")
  }else{
    localStorage.removeItem("videoEstado")
    setModo("nuevo")
  }

}else{
  setModo("nuevo")
}

}

}

verificarEstado()

},[id])
*/}

/* ========================= */
/* ELIMINAR ENTREGA */
/* ========================= */
{/*
async function eliminarEntrega(){

await axios.delete(`http://localhost:3000/entregas_video/${entregaId}`)

setVideoSubido(null)
setEntregaId(null)
setModo("nuevo")

// LIMPIAR TODO
const data = JSON.parse(localStorage.getItem("videoEstado"))

if(data?.key){
  await eliminarArchivo(data.key)
}

localStorage.removeItem("videoEstado")

}*/}


/* ========================= */
/* UI */
/* ========================= */

if(!curso){
return <div className="p-10">Cargando curso...</div>
}

const unidades = curso?.temario?.unidades || []

return(

<div className="w-full px-10 py-8">

{/* HEADER */}
<div className="bg-indigo-600 text-white p-6 rounded-lg mb-8">
<h1 className="text-2xl font-bold">
{curso.nombrecurso}
</h1>
<p>{curso.descripcion}</p>
</div>

<div className="grid grid-cols-4 gap-8">

{/* CONTENIDO */}
<div className="col-span-3 space-y-4">

{unidades.map(unidad=>(

<div key={unidad.id} className="border rounded-lg bg-white shadow">

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

unidad.sesion.documentos.map(doc => (

<a
key={doc.id}
href={doc.archivo}
target="_blank"
rel="noreferrer"
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

{/* TAREAS DE LA UNIDAD */}
<div>

<div className="border rounded-xl overflow-hidden">

  {/* HEADER DESPLEGABLE */}
  <button
    onClick={() =>
      setTareasAbiertas(prev => ({
        ...prev,
        [unidad.id]: !prev[unidad.id]
      }))
    }
    className="w-full flex justify-between items-center p-4 bg-gray-100 hover:bg-gray-200 transition"
  >
    <span className="font-semibold">
      📝 Tareas de esta unidad
    </span>

    <span
      className={`transform transition-transform duration-300 ${
        tareasAbiertas[unidad.id] ? "rotate-180" : ""
      }`}
    >
      ▼
    </span>
  </button>

  {/* CONTENIDO ACORDEÓN */}
  <div
    className={`transition-all duration-500 ease-in-out overflow-hidden ${
      tareasAbiertas[unidad.id]
        ? "max-h-[1000px] opacity-100"
        : "max-h-0 opacity-0"
    }`}
  >

    <div className="p-4 space-y-3 bg-white">

      {tareas.length === 0 && (
        <p className="text-sm text-gray-500">No hay tareas</p>
      )}

      {tareas.map(t => (

<div key={t.id} className="border rounded-lg mb-3 bg-white shadow">

  {/* HEADER TAREA */}
  <button
    onClick={() =>
      setTareaAbierta(tareaAbierta === t.id ? null : t.id)
    }
    className="w-full flex justify-between items-center p-3 bg-gray-100 hover:bg-gray-200 rounded-t-lg"
  >
    <div className="text-left">
      <p className="font-medium">📝 {t.titulo}</p>
      <p className="text-xs text-gray-500">
        Fecha límite: {t.fecha_limite}
      </p>
    </div>

    <span>
      {tareaAbierta === t.id ? "▲" : "▼"}
    </span>
  </button>

  {/* CONTENIDO DESPLEGABLE */}
  {tareaAbierta === t.id && (

    <div className="p-4 space-y-3 border-t">

      <p className="text-sm text-gray-600">
        {t.descripcion}
      </p>

      {/* ================= TEXTO ================= */}
      {t.tipo_entrega === "texto" && (
        <div className="mt-2 bg-gray-50 border rounded-xl p-4">

          <div className="flex justify-between mb-2">
            <label className="text-sm font-semibold">
              ✏️ Respuesta
            </label>

            <span className="text-xs text-gray-400">
              {(respuestas?.[t.id]?.length || 0)}/500
            </span>
          </div>

          <textarea
            className="w-full border rounded-lg p-3 text-sm"
            rows={4}
            maxLength={500}
            value={respuestas?.[t.id] ?? ""}
            onChange={(e)=>{
              const valor = e.target.value
              setRespuestas(prev => ({
                ...(prev || {}),
                [t.id]: valor
              }))
            }}
          />

          <button
            disabled={!respuestas?.[t.id]}
            onClick={()=>enviarTarea(t)}
            className={`mt-2 px-4 py-1.5 text-sm rounded text-white
              ${respuestas?.[t.id]
                ? "bg-indigo-600 hover:bg-indigo-700"
                : "bg-gray-300 cursor-not-allowed"
              }`}
          >
            Enviar
          </button>

        </div>
      )}

      {/* ================= ARCHIVO ================= */}
      {t.tipo_entrega === "archivo" && (
        <div className="mt-2 border border-dashed rounded-xl p-4 bg-gray-50">

          <input
            type="file"
            id={`file-${t.id}`}
            className="hidden"
            onChange={(e)=>
              handleArchivoChange(t.id, e.target.files[0])
            }
          />

          <label
            htmlFor={`file-${t.id}`}
            className="flex flex-col items-center cursor-pointer bg-white border rounded-lg p-4"
          >
            📂 Subir archivo
          </label>

          {respuestas?.[t.id] && (
            <div className="mt-3 flex justify-between bg-white border p-2 rounded">
              <span className="text-sm">
                {respuestas[t.id].name}
              </span>

              <button
                onClick={()=>{
                  setRespuestas(prev=>{
                    const copy = {...prev}
                    delete copy[t.id]
                    return copy
                  })
                }}
                className="text-red-500 text-xs"
              >
                Eliminar
              </button>
            </div>
          )}

        </div>
      )}

    </div>

  )}

</div>

))}

    </div>

  </div>

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
<h3 className="font-semibold mb-3">Progreso del curso</h3>

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

{/* TAREAS */}
{/*<div className="bg-white border rounded-lg p-5 shadow">
<h3 className="font-semibold mb-2">Tareas</h3>

{tareas.length===0 && (
<p className="text-sm text-gray-500">No hay tareas</p>
)}

{tareas.map(t=>(

<div key={t.id} className="border p-2 rounded mb-2">
<p className="font-medium">📝 {t.titulo}</p>
<p className="text-sm text-gray-500">
Fecha límite: {t.fecha_limite}
</p>
</div>

))}

</div>*/}



</div>

</div>

</div>

)
}