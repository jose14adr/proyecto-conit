import { useEffect, useState } from "react"
import axios from "axios"

import { Calendar, momentLocalizer } from "react-big-calendar"
import moment from "moment"
import "react-big-calendar/lib/css/react-big-calendar.css"

const localizer = momentLocalizer(moment)

export default function MisSesiones(){

const [sesiones,setSesiones] = useState([])
const [sesionSeleccionada,setSesionSeleccionada] = useState(null)
const [notificacion,setNotificacion] = useState(null)
const [ahora,setAhora] = useState(new Date())

/* cargar sesiones */

useEffect(()=>{

axios.get("http://localhost:3000/sesion-vivo")
.then(res=>{
setSesiones(res.data)
})

},[])

/* reloj en vivo */

useEffect(()=>{

const interval = setInterval(()=>{

setAhora(new Date())

sesiones.forEach(s=>{

const inicio = new Date(s.fecha)
const diff = inicio - new Date()

/* 5 minutos antes */

if(diff < 300000 && diff > 295000){

setNotificacion(s)

}

})

},1000)

return ()=>clearInterval(interval)

},[sesiones])


/* contador */

function tiempoRestante(fecha){

const inicio = new Date(fecha)
const diff = inicio - ahora

if(diff <= 0) return "EN_VIVO"

const dias = Math.floor(diff / (1000*60*60*24))

const horas = Math.floor(
(diff % (1000*60*60*24)) / (1000*60*60)
)

const minutos = Math.floor(
(diff % (1000*60*60)) / (1000*60)
)

const segundos = Math.floor(
(diff % (1000*60)) / 1000
)

return {dias,horas,minutos,segundos}

}

/* eventos calendario */

const eventos = sesiones.map(s=>({

title:s.titulo,

start:new Date(s.fecha),

end:new Date(new Date(s.fecha).getTime()+s.duracion*60000),

data:s

}))


return(

<div style={container}>

<h2 style={titulo}>📡 Mis sesiones en vivo</h2>

{notificacion && (

<div style={alerta}>

🔔 Tu clase comienza en 5 minutos

<b style={{marginLeft:"8px"}}>
{notificacion.titulo}
</b>

<button
style={botonEntrar}
onClick={()=>window.open(notificacion.link_reunion,"_blank")}
>
Entrar ahora
</button>

<button
style={cerrarAlerta}
onClick={()=>setNotificacion(null)}
>
✖
</button>

</div>

)}

{/* TABLA */}

<table style={tabla}>

<thead style={thead}>
<tr>
<th style={th}>📅 Fecha</th>
<th style={th}>⏰ Hora</th>
<th style={th}>📚 Curso</th>
<th style={th}>👨‍🏫 Docente</th>
<th style={th}>⏳ Inicio</th>
<th style={th}>Acción</th>
</tr>
</thead>

<tbody>

{sesiones.map(s=>{

const fecha = new Date(s.fecha)

const inicio = new Date(s.fecha)

const habilitado = ahora >= inicio

return(

<tr key={s.id} style={fila}>

<td style={td}>
{fecha.toLocaleDateString()}
</td>

<td style={td}>
{fecha.toLocaleTimeString([],{
hour:"2-digit",
minute:"2-digit"
})}
</td>

<td style={td}>
{s.curso?.nombrecurso}
</td>

<td style={td}>
{s.curso?.grupos?.[0]?.docente?.nombre}
{" "}
{s.curso?.grupos?.[0]?.docente?.apellido}
</td>

<td style={td}>

{(() => {

const t = tiempoRestante(s.fecha)

if(t === "EN_VIVO"){
return <span style={enVivo}>🔴 EN VIVO</span>
}

return(

<div style={contadorBox}>

<div style={bloque}>
<span style={numero}>{String(t.dias).padStart(2,"0")}</span>
<span style={label}>días</span>
</div>

<div style={separador}>:</div>

<div style={bloque}>
<span style={numero}>{String(t.horas).padStart(2,"0")}</span>
<span style={label}>hrs</span>
</div>

<div style={separador}>:</div>

<div style={bloque}>
<span style={numero}>{String(t.minutos).padStart(2,"0")}</span>
<span style={label}>min</span>
</div>

<div style={separador}>:</div>

<div style={bloque}>
<span style={numero}>{String(t.segundos).padStart(2,"0")}</span>
<span style={label}>seg</span>
</div>

</div>

)

})()}

</td>

<td style={td}>

<a
href={habilitado ? s.link_reunion : "#"}
target="_blank"
rel="noreferrer"
style={{
...boton,
opacity: habilitado ? 1 : 0.5,
pointerEvents: habilitado ? "auto" : "none"
}}
>
Entrar
</a>

</td>

</tr>

)

})}

</tbody>

</table>


{/* CALENDARIO */}

<h3 style={{marginTop:"40px"}}>📅 Calendario de sesiones</h3>

<Calendar
localizer={localizer}
events={eventos}
startAccessor="start"
endAccessor="end"
style={{height:450,marginTop:20}}
onSelectEvent={(evento)=>{
setSesionSeleccionada(evento.data)
}}
/>


{/* MODAL */}

{sesionSeleccionada &&(

<div style={modalFondo}>

<div style={modal}>

<h3 style={{marginBottom:"10px"}}>
{sesionSeleccionada.titulo}
</h3>

<div style={modalInfo}>

<p>
<b>Curso:</b> {sesionSeleccionada.curso?.nombrecurso}
</p>

<p>
<b>Fecha:</b>
{" "}
{new Date(sesionSeleccionada.fecha).toLocaleString()}
</p>

<div style={docenteBox}>

<div style={avatar}>👨‍🏫</div>

<div>

<b>
{sesionSeleccionada.curso?.grupos?.[0]?.docente?.nombre}
{" "}
{sesionSeleccionada.curso?.grupos?.[0]?.docente?.apellido}
</b>

<p style={{fontSize:"13px",color:"#666"}}>
Docente del curso
</p>

</div>

</div>

</div>

<div style={modalBotones}>

<a
href={sesionSeleccionada.link_reunion}
target="_blank"
rel="noreferrer"
style={boton}
>
Entrar a la sesión
</a>

<button
onClick={()=>setSesionSeleccionada(null)}
style={cerrar}
>
Cerrar
</button>

</div>

</div>

</div>

)}

</div>

)

}



/* ESTILOS */

const container={
padding:"30px"
}

const titulo={
marginBottom:"20px"
}

const tabla={
width:"100%",
borderCollapse:"collapse",
background:"white",
borderRadius:"10px",
overflow:"hidden"
}

const thead={
background:"#f5f5f5"
}

const th={
padding:"14px",
textAlign:"left"
}

const fila={
borderBottom:"1px solid #eee"
}

const td={
padding:"14px"
}

const boton={
background:"#e10600",
color:"white",
padding:"8px 15px",
borderRadius:"6px",
textDecoration:"none",
fontSize:"14px"
}

const contador={
background:"#eef2ff",
padding:"6px 12px",
borderRadius:"8px",
fontSize:"13px",
fontWeight:"600",
fontFamily:"monospace"
}

const modalFondo={
position:"fixed",
top:0,
left:0,
width:"100%",
height:"100%",
background:"rgba(0,0,0,0.45)",
display:"flex",
alignItems:"center",
justifyContent:"center",
zIndex:999
}

const modal={
background:"white",
padding:"30px",
borderRadius:"12px",
width:"420px",
boxShadow:"0 10px 30px rgba(0,0,0,0.2)",
animation:"fadeIn 0.2s"
}

const modalInfo={
display:"flex",
flexDirection:"column",
gap:"8px",
marginBottom:"20px"
}

const modalBotones={
display:"flex",
justifyContent:"space-between",
alignItems:"center"
}

const cerrar={
marginTop:"15px",
background:"#eee",
border:"none",
padding:"8px 14px",
borderRadius:"6px",
cursor:"pointer"
}

const docenteBox={
display:"flex",
alignItems:"center",
gap:"10px",
marginTop:"10px"
}

const avatar={
width:"40px",
height:"40px",
borderRadius:"50%",
background:"#eef2ff",
display:"flex",
alignItems:"center",
justifyContent:"center",
fontSize:"20px"
}

const alerta={
background:"#fff3cd",
padding:"12px 15px",
borderRadius:"8px",
display:"flex",
alignItems:"center",
gap:"10px",
marginBottom:"20px",
boxShadow:"0 3px 8px rgba(0,0,0,0.1)"
}

const botonEntrar={
background:"#e10600",
color:"white",
border:"none",
padding:"6px 12px",
borderRadius:"6px",
cursor:"pointer"
}

const cerrarAlerta={
background:"transparent",
border:"none",
cursor:"pointer",
fontSize:"16px"
}

const contadorBox={
display:"flex",
alignItems:"center",
gap:"6px"
}

const bloque={
display:"flex",
flexDirection:"column",
alignItems:"center",
background:"#f3f4f6",
padding:"6px 8px",
borderRadius:"6px",
minWidth:"40px"
}

const numero={
fontWeight:"bold",
fontSize:"15px"
}

const label={
fontSize:"10px",
color:"#666"
}

const separador={
fontWeight:"bold"
}

const enVivo={
background:"#e10600",
color:"white",
padding:"5px 10px",
borderRadius:"6px",
fontSize:"12px"
}