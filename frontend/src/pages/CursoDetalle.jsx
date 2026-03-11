import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function CursoDetalle() {
  const { id } = useParams();
  const [curso, setCurso] = useState(null);
  const navigate = useNavigate();
  const [unidadActiva, setUnidadActiva] = useState(null);
  const [archivo, setArchivo] = useState(null);
const [dragActivo, setDragActivo] = useState(false);

const enviarEntrega = async () => {

  if (!archivo) return

  const formData = new FormData()
  formData.append("file", archivo)

  const resUpload = await axios.post(
    "http://localhost:3000/upload",
    formData
  )

  const urlArchivo = resUpload.data.url

  await axios.post("http://localhost:3000/entrega", {
    idtarea: tarea.id,
    idusuario: 1,
    archivo: urlArchivo,
    fecha_entrega: new Date()
  })

  alert("Entrega enviada")
}

  useEffect(() => {
    axios.get(`http://localhost:3000/curso/${id}`)
      .then(res => setCurso(res.data))
      .catch(err => console.error(err));
  }, [id]);

  useEffect(() => {
  if (curso?.temario?.unidades?.length > 0) {
    setUnidadActiva(curso.temario.unidades[0]);
  }
}, [curso]);

  if (!curso) return <p>Cargando...</p>;
  

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
      {/* Card principal */}
      <div style={cardStyle}>
        
        {/* Título */}
        <div style={titleStyle}>
           {curso.descripcion?.toUpperCase()}
        </div>

        {/* Docente */}
        <div style={teacherBox}>
          <strong>
            {curso.grupos?.[0]?.docente?.nombre}{" "}
            {curso.grupos?.[0]?.docente?.apellido}
          </strong>
          <br />
          <strong>
            {curso.grupos?.[0]?.docente?.correo}
          </strong>
        </div>

        {/* Tabs */}
        <div style={tabsContainer}>
          <button style={!unidadActiva ? tabActive : tab}
            onClick={() => setUnidadActiva(null)}>
            Contenidos
          </button>

          {curso.temario?.unidades?.map((unidad) => (
            <button
              key={unidad.id}
              style={unidadActiva?.id === unidad.id ? tabActive : tab}
              onClick={() => setUnidadActiva(unidad)}
            >
              Unidad {unidad.id}
            </button>
          ))}
        </div>

        {/* Unidad */}
        <div style={unidadBox}>
          {/* === VISTA CONTENIDOS (TODO EL CURSO) === */}
          {!unidadActiva && (
            <>
              <h2>
                {curso.temario?.titulomodulo} : {curso.temario?.detallelecciones}
              </h2>
              {curso.temario?.unidades?.map((unidad) => (
                <div key={unidad.id} style={{ marginBottom: "20px" }}>
                  <h3>
                    {unidad.descripcion} : {unidad.nombreunidad}
                  </h3>
                  <ul style={{ lineHeight: "1.8" }}>
                    {unidad.sesion && (
                      <li>{unidad.sesion.nombresesion}</li>
                    )}
                  </ul>
                </div>
              ))}
            </>
          )}

          {/* === VISTA UNIDAD ESPECÍFICA === */}
          {unidadActiva && (
            <>
              <h3>
                {unidadActiva.descripcion} : {unidadActiva.nombreunidad}
              </h3>
              <ul style={{ lineHeight: "1.8" }}>
                {unidadActiva.sesion && (
                 <div style={{
                    background: "#f9f9f9",
                    padding: "15px",
                    borderRadius: "8px",
                    marginTop: "10px"
                  }}>
                    <h4>{unidadActiva.sesion.nombresesion}</h4>

                    {/*Video*/}
                    <div style={{ marginTop: "15px", display: "flex", justifyContent: "center" }}>
                      <video
                        controls
                        style={{
                          width: "100%",
                          maxWidth: "500px",
                          borderRadius: "8px",
                          boxShadow: "0 3px 8px rgba(0,0,0,0.15)"
                        }}
                      >
                        <source src="/videos/demo.mp4" type="video/mp4" />
                        Tu navegador no soporta video.
                      </video>
                    </div>

                    {/*Entrega del alumno*/}
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragActivo(true);
                      }}
                      onDragLeave={() => setDragActivo(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragActivo(false);
                        const file = e.dataTransfer.files[0];
                        setArchivo(file);
                      }}
                      style={{
                        marginTop: "20px",
                        border: dragActivo ? "2px dashed #e10600" : "2px dashed #ccc",
                        padding: "25px",
                        borderRadius: "10px",
                        textAlign: "center",
                        background: dragActivo ? "#fff5f5" : "#fafafa",
                        cursor: "pointer",
                        transition: "0.2s"
                      }}
                    >
                      <p style={{ fontSize: "16px", fontWeight: "500" }}>
                        📎 Arrastra tu archivo aquí
                      </p>

                      <p style={{ fontSize: "14px", color: "#777" }}>
                        o haz clic para subir
                      </p>

                      <input
                        type="file"
                        onChange={(e) => setArchivo(e.target.files[0])}
                        style={{ display: "none" }}
                        id="fileUpload"
                      />

                      <label
                        htmlFor="fileUpload"
                        style={{
                          display: "inline-block",
                          marginTop: "10px",
                          background: "#e10600",
                          color: "white",
                          padding: "8px 16px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "14px"
                        }}
                      >
                        Seleccionar archivo
                      </label>

                      {archivo && (
                        <p style={{ marginTop: "10px", color: "#333" }}>
                          Archivo seleccionado: <strong>{archivo.name}</strong>
                        </p>
                      )}

                      {archivo && (
                        <button
                          style={{
                            marginTop: "15px",
                            background: "#1e73be",
                            color: "white",
                            border: "none",
                            padding: "10px 20px",
                            borderRadius: "6px",
                            cursor: "pointer"
                          }}
                          onClick={() => console.log("Enviar archivo", archivo)}
                        >
                          Enviar entrega
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </ul>
            </>
          )}

        </div>
      </div>

    </div>
  );
}

const containerStyle = {
  padding: "30px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

const backButton = {
  alignSelf: "flex-start",
  marginBottom: "20px",
  backgroundColor: "#1e73be",
  color: "white",
  border: "none",
  padding: "8px 16px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "500",
};

const cardStyle = {
  width: "100%",
  maxWidth: "950px",
  backgroundColor: "#ffffff",
  padding: "30px",
  borderRadius: "12px",
  boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
};

const titleStyle = {
  backgroundColor: "#e10600",
  color: "white",
  padding: "15px 20px",
  fontSize: "20px",
  fontWeight: "bold",
  display: "inline-block",
  borderRadius: "4px",
  marginBottom: "20px",
};

const teacherBox = {
  backgroundColor: "#f1f1f1",
  padding: "12px 15px",
  borderRadius: "6px",
  marginBottom: "25px",
  width: "300px",
};

const tabsContainer = {
  display: "flex",
  gap: "10px",
  marginBottom: "25px",
};

const tab = {
  padding: "8px 16px",
  border: "1px solid #ccc",
  backgroundColor: "#f5f5f5",
  borderRadius: "6px",
  cursor: "pointer",
};

const tabActive = {
  ...tab,
  backgroundColor: "#e10600",
  color: "white",
  border: "none",
};

const unidadBox = {
  backgroundColor: "#fafafa",
  padding: "20px",
  borderLeft: "5px solid #e10600",
  borderRadius: "6px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
};

