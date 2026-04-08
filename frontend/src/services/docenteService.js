import { supabase } from "../lib/supabaseClient";

// ======================================================
// HELPERS
// ======================================================

const extraerDiaDesdeHorario = (horario) => {
  if (!horario) return "";

  const texto = horario.toLowerCase();

  if (texto.includes("lunes")) return "Lunes";
  if (texto.includes("martes")) return "Martes";
  if (texto.includes("miércoles") || texto.includes("miercoles")) return "Miércoles";
  if (texto.includes("jueves")) return "Jueves";
  if (texto.includes("viernes")) return "Viernes";
  if (texto.includes("sábado") || texto.includes("sabado")) return "Sábado";

  return "";
};
 
// Obtener usuario autenticado actual
const getCurrentUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw new Error(error.message);
  return user;
};

// Obtener docente actual a partir de usuarioId
const getDocenteActual = async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("No hay token en sesión. Inicia sesión nuevamente.");
  }

  let payload;
  try {
    payload = JSON.parse(atob(token.split(".")[1]));
  } catch (e) {
    throw new Error("No se pudo leer el token de sesión.");
  }

  const usuarioId = payload?.sub;

  if (!usuarioId) {
    throw new Error("El token no contiene el id del usuario.");
  }

  const { data, error } = await supabase
    .from("docente")
    .select("*")
    .eq("usuarioId", Number(usuarioId))
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) {
    throw new Error("No se encontró el docente asociado al usuario actual.");
  }

  return data;
};



// Helper para agrupar arrays en trozos
const chunkArray = (arr, size = 100) => {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

// ======================================================
// PERFIL DOCENTE
// ======================================================

// Obtener perfil del docente logueado
export const getPerfilDocente = async () => {
  const docente = await getDocenteActual();
  return docente;
};

// Actualizar perfil del docente logueado
export const updatePerfilDocente = async (patch) => {
  const docente = await getDocenteActual();

  const payload = {
    ...patch,
  };

  const { data, error } = await supabase
    .from("docente")
    .update(payload)
    .eq("id", docente.id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

// ======================================================
// CATÁLOGO - GRADO DE INSTRUCCIÓN
// ======================================================

export const getGradosInstruccion = async () => {
  const { data, error } = await supabase
    .from("grado_instruccion")
    .select("id, nombre")
    .eq("estado", true)
    .order("nombre", { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
};

// ======================================================
// FOTO / DOCUMENTOS / CURSOS ADICIONALES
// ======================================================

// Obtener documentos del docente actual
export const getDocumentosDocente = async () => {
  const docente = await getDocenteActual();

  const { data, error } = await supabase
    .from("docente_documento")
    .select("*")
    .eq("iddocente", docente.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
};

// Registrar documento del docente
export const addDocumentoDocente = async (payload) => {
  const docente = await getDocenteActual();

  const body = {
    iddocente: docente.id,
    nombre: payload.nombre,
    tipo: payload.tipo || "cv",
    archivo_url: payload.archivo_url || null,
    mime_type: payload.mime_type || "application/pdf",
    storage_provider: payload.storage_provider || "s3",
    bucket: payload.bucket || null,
    object_key: payload.object_key || null,
  };

  const { data, error } = await supabase
    .from("docente_documento")
    .insert(body)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

// Eliminar documento del docente
export const deleteDocumentoDocente = async (id) => {
  const docente = await getDocenteActual();
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const { data: doc, error: findError } = await supabase
    .from("docente_documento")
    .select("id, iddocente, object_key")
    .eq("id", id)
    .eq("iddocente", docente.id)
    .maybeSingle();

  if (findError) throw new Error(findError.message);
  if (!doc) throw new Error("No se encontró el documento.");

  if (doc.object_key) {
    await fetch(`${apiUrl}/s3/object`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ key: doc.object_key }),
    });
  }

  const { error } = await supabase
    .from("docente_documento")
    .delete()
    .eq("id", id)
    .eq("iddocente", docente.id);

  if (error) throw new Error(error.message);
  return true;
};

// Obtener cursos adicionales del docente
export const getCursosAdicionalesDocente = async () => {
  const docente = await getDocenteActual();

  const { data, error } = await supabase
    .from("docente_curso_adicional")
    .select("*")
    .eq("iddocente", docente.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return data || [];
};


// Agregar curso adicional
export const addCursoAdicionalDocente = async (payload) => {
  const docente = await getDocenteActual();

  const body = {
    iddocente: docente.id,
    nombre: payload.nombre,
    institucion: payload.institucion || null,
    fecha_inicio: payload.fecha_inicio || null,
    fecha_fin: payload.fecha_fin || null,
    archivo_url: payload.archivo_url || null,
  };

  const { data, error } = await supabase
    .from("docente_curso_adicional")
    .insert(body)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

// Eliminar curso adicional
export const deleteCursoAdicionalDocente = async (id) => {
  const { error } = await supabase
    .from("docente_curso_adicional")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
};

// ======================================================
// HISTORIAL DOCENTE
// ======================================================

// Obtener historial docente
// Primero intenta usar la tabla nueva docente_historial_detalle.
// Si no existe o falla, intenta una tabla previa más simple.
export const getHistorialDocente = async (docenteIdParam = null) => {
  const docente = docenteIdParam
    ? { id: docenteIdParam }
    : await getDocenteActual();

  // Intento 1: tabla nueva detallada
  const { data: dataDetalle, error: errorDetalle } = await supabase
    .from("docente_historial_detalle")
    .select("*")
    .eq("iddocente", docente.id)
    .order("fecha_inicio", { ascending: false });

  if (!errorDetalle) {
    return dataDetalle || [];
  }

  // Intento 2: posible tabla anterior
  const { data: dataLegacy, error: errorLegacy } = await supabase
    .from("historial_docente")
    .select("*")
    .eq("iddocente", docente.id)
    .order("fecha_inicio", { ascending: false });

  if (!errorLegacy) {
    return dataLegacy || [];
  }

  // Si ambas fallan, devolvemos vacío para no romper la pantalla
  console.warn("No se pudo leer historial docente:", errorDetalle?.message, errorLegacy?.message);
  return [];
};

// Agregar historial detallado
export const addHistorialDocente = async (payload) => {
  const docente = await getDocenteActual();

  const body = {
    iddocente: docente.id,
    tipo: payload.tipo,
    institucion: payload.institucion || null,
    cargo: payload.cargo || null,
    area: payload.area || null,
    sector: payload.sector || null,
    fecha_inicio: payload.fecha_inicio || null,
    fecha_fin: payload.fecha_fin || null,
    descripcion: payload.descripcion || null,
  };

  const { data, error } = await supabase
    .from("docente_historial_detalle")
    .insert(body)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

// Eliminar historial
export const deleteHistorialDocente = async (id) => {
  const docente = await getDocenteActual();

  const { error } = await supabase
    .from("docente_historial_detalle")
    .delete()
    .eq("id", id)
    .eq("iddocente", docente.id);

  if (error) throw new Error(error.message);
  return true;
};

// ======================================================
// CURSOS DEL DOCENTE
// ======================================================

export const getCursosDocente = async () => {
  const docente = await getDocenteActual();

  const { data: grupos, error: errGrupos } = await supabase
    .from("grupo")
    .select("id, idcurso, nombregrupo, horario, modalidad, cantidadpersonas")
    .eq("iddocente", docente.id);

  if (errGrupos) throw new Error(errGrupos.message);

  if (!grupos || grupos.length === 0) return [];

  const cursoIds = [...new Set(grupos.map((g) => g.idcurso).filter(Boolean))];
  if (cursoIds.length === 0) return [];

  const { data: cursos, error: errCursos } = await supabase
    .from("curso")
    .select("id, nombrecurso, descripcion, nivel, precio, duracion, creditos")
    .in("id", cursoIds);

  if (errCursos) throw new Error(errCursos.message);

  const cursoMap = new Map((cursos || []).map((c) => [c.id, c]));

  return grupos.map((g) => {
    const curso = cursoMap.get(g.idcurso);
    return {
      idgrupo: g.id,
      idcurso: g.idcurso,
      grupo: g.nombregrupo,
      horario: g.horario,
      modalidad: g.modalidad,
      cantidadpersonas: g.cantidadpersonas,
      ...(curso || {}),
      nombre: curso?.nombrecurso || "Curso sin nombre",
    };
  });
};



// ======================================================
// ALUMNOS POR CURSO
// ======================================================

export const getAlumnosByCurso = async (idgrupo) => {
  try {
    const grupoId = Number(idgrupo);

    const { data: matriculas, error: errMat } = await supabase
      .from("matricula")
      .select("id, idalumno, idgrupo")
      .eq("idgrupo", grupoId);

    if (errMat) throw new Error(errMat.message);
    if (!matriculas || matriculas.length === 0) return [];

    const matriculasUnicas = Array.from(
      new Map(
        matriculas
          .filter((m) => m.idalumno)
          .map((m) => [m.idalumno, m])
      ).values()
    );

    if (matriculasUnicas.length === 0) return [];

    const matriculaIds = matriculasUnicas.map((m) => m.id);
    const alumnoIds = matriculasUnicas.map((m) => m.idalumno);

    const { data: alumnos, error: errAlumnos } = await supabase
      .from("alumno")
      .select("*")
      .in("id", alumnoIds);

    if (errAlumnos) throw new Error(errAlumnos.message);

    const alumnosMap = new Map((alumnos || []).map((a) => [a.id, a]));

    const { data: notas, error: errNotas } = await supabase
      .from("nota")
      .select("idmatricula, evaluacion, nota")
      .in("idmatricula", matriculaIds);

    if (errNotas) throw new Error(errNotas.message);

    const notasMap = new Map();

    (notas || []).forEach((n) => {
      if (!notasMap.has(n.idmatricula)) {
        notasMap.set(n.idmatricula, {
          nota1: null,
          nota2: null,
          nota3: null,
        });
      }

      const fila = notasMap.get(n.idmatricula);

      if (Number(n.evaluacion) === 21 || Number(n.evaluacion) === 1) fila.nota1 = Number(n.nota);
      if (Number(n.evaluacion) === 22 || Number(n.evaluacion) === 2) fila.nota2 = Number(n.nota);
      if (Number(n.evaluacion) === 23 || Number(n.evaluacion) === 3) fila.nota3 = Number(n.nota);
    });

    return matriculasUnicas
      .map((m) => {
        const alumno = alumnosMap.get(m.idalumno);
        if (!alumno) return null;

        const nota = notasMap.get(m.id) || {};

        const n1 = nota.nota1;
        const n2 = nota.nota2;
        const n3 = nota.nota3;

        return {
          idalumno: alumno.id,
          idmatricula: m.id,
          nombre: alumno.nombre || "",
          apellido: alumno.apellido || "",
          correo: alumno.correo || "",
          numdocumento: alumno.numdocumento || "",
          foto_url: alumno.foto_url || "",
          nota1: n1,
          nota2: n2,
          nota3: n3,
        };
      })
      .filter(Boolean);
  } catch (error) {
    console.error("Error obteniendo alumnos:", error);
    return [];
  }
};  
// ======================================================
// GUARDAR NOTAS
// ======================================================

export const guardarNotas = async (idmatricula, notas) => {
  const idMat = Number(idmatricula);

  const paraGuardar = [];
  const paraEliminar = [];

  Object.entries(notas).forEach(([evaluacionId, valor]) => {
    const evalId = Number(evaluacionId);

    if (valor === "" || valor === null || valor === undefined) {
      paraEliminar.push(evalId);
    } else {
      paraGuardar.push({
        idmatricula: idMat,
        evaluacion: evalId,
        nota: Number(valor),
      });
    }
  });

  if (paraGuardar.length > 0) {
    const { error: errorUpsert } = await supabase
      .from("nota")
      .upsert(paraGuardar, {
        onConflict: "idmatricula,evaluacion",
      });

    if (errorUpsert) throw new Error(errorUpsert.message);
  }

  if (paraEliminar.length > 0) {
    const { error: errorDelete } = await supabase
      .from("nota")
      .delete()
      .eq("idmatricula", idMat)
      .in("evaluacion", paraEliminar);

    if (errorDelete) throw new Error(errorDelete.message);
  }

  return true;
};

// ======================================================
// APROBADOS / REPORTE DE NOTAS
// ======================================================

export const getAprobadosByCurso = async (idgrupo) => {
  const grupoId = Number(idgrupo);

  // 1. Traer matrículas del grupo
  const { data: matriculas, error: errMat } = await supabase
    .from("matricula")
    .select("id, idalumno, idgrupo")
    .eq("idgrupo", grupoId);

  if (errMat) throw new Error(errMat.message);
  if (!matriculas || matriculas.length === 0) return [];

  // 2. Dejar solo una matrícula por alumno dentro del grupo
  const matriculasUnicas = Array.from(
    new Map(
      matriculas
        .filter((m) => m.idalumno)
        .map((m) => [m.idalumno, m])
    ).values()
  );

  if (matriculasUnicas.length === 0) return [];

  const matriculaIds = matriculasUnicas.map((m) => m.id);
  const alumnoIds = matriculasUnicas.map((m) => m.idalumno);

  // 3. Traer alumnos
  const { data: alumnos, error: errAlumnos } = await supabase
    .from("alumno")
    .select("*")
    .in("id", alumnoIds);

  if (errAlumnos) throw new Error(errAlumnos.message);

  const alumnosMap = new Map((alumnos || []).map((a) => [a.id, a]));

  // 4. Traer notas de esas matrículas
  const { data: notas, error: errNotas } = await supabase
    .from("nota")
    .select("idmatricula, evaluacion, nota")
    .in("idmatricula", matriculaIds);

  if (errNotas) throw new Error(errNotas.message);

  // 5. Agrupar notas por matrícula
  const notasMap = new Map();

  (notas || []).forEach((n) => {
    if (!notasMap.has(n.idmatricula)) {
      notasMap.set(n.idmatricula, {
        nota1: null,
        nota2: null,
        nota3: null,
      });
    }

    const fila = notasMap.get(n.idmatricula);

    if (Number(n.evaluacion) === 1) fila.nota1 = Number(n.nota);
    if (Number(n.evaluacion) === 2) fila.nota2 = Number(n.nota);
    if (Number(n.evaluacion) === 3) fila.nota3 = Number(n.nota);
  });

  // 6. Armar resultado final, una fila por alumno
  return matriculasUnicas
    .map((m) => {
      const alumno = alumnosMap.get(m.idalumno);
      if (!alumno) return null;

      const nota = notasMap.get(m.id) || {};

      const tieneNota1 = nota.nota1 !== null && nota.nota1 !== undefined;
      const tieneNota2 = nota.nota2 !== null && nota.nota2 !== undefined;
      const tieneNota3 = nota.nota3 !== null && nota.nota3 !== undefined;

      const n1 = tieneNota1 ? Number(nota.nota1) : null;
      const n2 = tieneNota2 ? Number(nota.nota2) : null;
      const n3 = tieneNota3 ? Number(nota.nota3) : null;

      const notasValidas = [n1, n2, n3].filter((v) => v !== null);
      const promedio =
        notasValidas.length > 0
          ? notasValidas.reduce((acc, v) => acc + v, 0) / notasValidas.length
          : null;

      let estado = "sin_notas";
      if (promedio !== null) {
        if (promedio >= 12) estado = "aprobado";
        else if (promedio >= 9) estado = "recuperacion";
        else estado = "desaprobado";
      }

      return {
        idalumno: alumno.id,
        idmatricula: m.id,
        nombre: alumno.nombre || "",
        apellido: alumno.apellido || "",
        correo: alumno.correo || "",
        numdocumento: alumno.numdocumento || "",
        foto_url: alumno.foto_url || "",
        nota1: n1,
        nota2: n2,
        nota3: n3,
        promedio: promedio !== null ? promedio.toFixed(1) : null,
        estado,
      };
    })
    .filter(Boolean);
};

// ======================================================
// SUBIDA A STORAGE - FOTO
// ======================================================

export const uploadFotoDocente = async (file) => {
  const docente = await getDocenteActual();

  if (!file) throw new Error("No se proporcionó ningún archivo.");

  const extension = file.name.split(".").pop();
  const fileName = `docente-${docente.id}-${Date.now()}.${extension}`;
  const filePath = `docentes/fotos/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("documentos")
    .upload(filePath, file, {
      upsert: true,
    });

  if (uploadError) throw new Error(uploadError.message);

  const { data } = supabase.storage.from("documentos").getPublicUrl(filePath);

  const publicUrl = data?.publicUrl;
  if (!publicUrl) throw new Error("No se pudo obtener la URL pública de la foto.");

  await updatePerfilDocente({ foto_url: publicUrl });

  return publicUrl;
};

// ======================================================
// SUBIDA A STORAGE - PDF DOCUMENTO - S3
// ======================================================

export const uploadPdfDocumentoDocente = async (file, tipo = "cv") => {
  const docente = await getDocenteActual();

  if (!file) throw new Error("No se proporcionó ningún archivo.");
  if (file.type !== "application/pdf") {
    throw new Error("Solo se permiten archivos PDF.");
  }

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const formData = new FormData();
  formData.append("file", file);
  formData.append("docenteId", String(docente.id));
  formData.append("tipo", tipo);

  const res = await fetch(`${apiUrl}/s3/upload-docente-documento`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();

  if (!res.ok || !data.ok) {
    throw new Error(data?.message || "No se pudo subir el archivo.");
  }

  const doc = await addDocumentoDocente({
    nombre: file.name,
    tipo,
    archivo_url: null,
    mime_type: "application/pdf",
    storage_provider: "s3",
    bucket: data.bucket,
    object_key: data.key,
  });

  return doc;
};

//======================================================
// DESCARGAR DOCUMENTOS DE DOCENTE
//======================================================
export const getDocumentoDocenteDownloadUrl = async (objectKey) => {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const res = await fetch(`${apiUrl}/s3/presign-download`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ key: objectKey }),
  });

  const data = await res.json();

  if (!res.ok || !data.ok) {
    throw new Error(data?.message || "No se pudo obtener la URL del archivo.");
  }

  return data.downloadUrl;
};


// ======================================================
// SUBIDA A STORAGE - PDF CURSO ADICIONAL
// ======================================================

export const uploadPdfCursoAdicionalDocente = async (file, payload = {}) => {
  const docente = await getDocenteActual();

  if (!file) throw new Error("No se proporcionó ningún archivo.");
  if (file.type !== "application/pdf") {
    throw new Error("Solo se permiten archivos PDF.");
  }

  const extension = "pdf";
  const fileName = `docente-${docente.id}-curso-${Date.now()}.${extension}`;
  const filePath = `docentes/cursos/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("documentos")
    .upload(filePath, file, {
      upsert: true,
      contentType: "application/pdf",
    });

  if (uploadError) throw new Error(uploadError.message);

  const { data } = supabase.storage.from("documentos").getPublicUrl(filePath);

  const publicUrl = data?.publicUrl;
  if (!publicUrl) throw new Error("No se pudo obtener la URL pública del PDF.");

  const curso = await addCursoAdicionalDocente({
    nombre: payload.nombre,
    institucion: payload.institucion || null,
    fecha_inicio: payload.fecha_inicio || null,
    fecha_fin: payload.fecha_fin || null,
    archivo_url: publicUrl,
  });

  return curso;
};



export const getCursoById = async (cursoId) => {
  const grupoId = Number(cursoId);

  const { data: grupo, error: errGrupo } = await supabase
    .from("grupo")
    .select("id, idcurso, nombregrupo, horario")
    .eq("id", grupoId)
    .maybeSingle();

  if (errGrupo) throw new Error(errGrupo.message);
  if (!grupo) return null;

  const { data: curso, error: errCurso } = await supabase
    .from("curso")
    .select("id, nombrecurso, descripcion")
    .eq("id", Number(grupo.idcurso))
    .maybeSingle();

  if (errCurso) throw new Error(errCurso.message);
  if (!curso) return null;

  return {
    id: curso.id,
    idgrupo: grupo.id,
    nombre: curso.nombrecurso,
    descripcion: curso.descripcion,
    grupo: grupo.nombregrupo || "-",
    horario: grupo.horario || "-",
  };
};


export const getMaterialesCurso = async (cursoId) => {
  const { data, error } = await supabase
    .from("curso_material")
    .select("*")
    .eq("idcurso", Number(cursoId))
    .order("fecha_carga", { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
};



export const addMaterialCurso = async (cursoId, payload) => {
  let archivoUrl = null;
  let nombreArchivo = null;
  let videoUrl = payload.video_url || null;

  if (payload.file) {
    const file = payload.file;
    const extension = file.name.split(".").pop();
    const fileName = `curso-${cursoId}-${Date.now()}.${extension}`;
    const filePath = `cursos/materiales/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("documentos")
      .upload(filePath, file, {
        upsert: true,
      });

    if (uploadError) throw new Error(uploadError.message);

    const { data } = supabase.storage.from("documentos").getPublicUrl(filePath);

    archivoUrl = data?.publicUrl || null;
    nombreArchivo = file.name;
  }

  const body = {
    idcurso: Number(cursoId),
    titulo: payload.titulo,
    tipo: payload.tipo,
    archivo_url: archivoUrl,
    video_url: videoUrl,
    nombre_archivo: nombreArchivo,
  };

  const { data, error } = await supabase
    .from("curso_material")
    .insert(body)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};



export const getAsistenciaCursoPorFecha = async (cursoId, fecha) => {
  const { data, error } = await supabase
    .from("asistencia")
    .select("*")
    .eq("idcurso", Number(cursoId))
    .eq("fecha", fecha);

  if (error) throw new Error(error.message);
  return data || [];
};



export const guardarAsistenciaCurso = async (cursoId, asistencias) => {
  for (const item of asistencias) {
    const { data: existente, error: errBuscar } = await supabase
      .from("asistencia")
      .select("id")
      .eq("idcurso", Number(cursoId))
      .eq("idalumno", Number(item.idalumno))
      .eq("fecha", item.fecha)
      .maybeSingle();

    if (errBuscar) throw new Error(errBuscar.message);

    const payload = {
      idcurso: Number(cursoId),
      idalumno: Number(item.idalumno),
      fecha: item.fecha,
      estado: item.estado,
      tipo_justificacion: item.tipo_justificacion || null,
      observacion: item.observacion || null,
    };

    if (existente) {
      const { error } = await supabase
        .from("asistencia")
        .update(payload)
        .eq("id", existente.id);

      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase
        .from("asistencia")
        .insert(payload);

      if (error) throw new Error(error.message);
    }
  }

  return true;
};


export const crearTarea = async (payload) => {
  const {
    cursoId,
    grupoId,
    titulo,
    descripcion,
    fechaInicio,
    fechaLimite,
    tipoEntrega,
    tipoApoyo,
    textoApoyo,
    archivoApoyo,
    videoApoyo,
    calificable = false,
    idmodulo = null,
    idleccion = null,
  } = payload;

  let archivoApoyoUrl = null;
  let videoApoyoUrl = null;

  let apoyoStorageProvider = null;
  let apoyoBucket = null;
  let apoyoObjectKey = null;

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

  if (tipoApoyo === "archivo" && archivoApoyo) {
    const formData = new FormData();
    formData.append("file", archivoApoyo);
    formData.append("cursoId", String(cursoId));
    formData.append("tipoApoyo", "archivo");

    const res = await fetch(`${apiUrl}/s3/upload-tarea-apoyo`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok || !data.ok) {
      throw new Error(data?.message || "No se pudo subir el archivo de apoyo.");
    }

    apoyoStorageProvider = "s3";
    apoyoBucket = data.bucket;
    apoyoObjectKey = data.key;
    archivoApoyoUrl = null;
  }

  if (tipoApoyo === "video" && videoApoyo) {
    const formData = new FormData();
    formData.append("file", videoApoyo);
    formData.append("cursoId", String(cursoId));
    formData.append("tipoApoyo", "video");

    const res = await fetch(`${apiUrl}/s3/upload-tarea-apoyo`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok || !data.ok) {
      throw new Error(data?.message || "No se pudo subir el video de apoyo.");
    }

    apoyoStorageProvider = "s3";
    apoyoBucket = data.bucket;
    apoyoObjectKey = data.key;
    videoApoyoUrl = null;
  }

  let queryOrden = supabase
    .from("tarea")
    .select("orden")
    .eq("idcurso", Number(cursoId));

  if (idmodulo) {
    queryOrden = queryOrden.eq("idmodulo", Number(idmodulo));
  } else {
    queryOrden = queryOrden.is("idmodulo", null);
  }

  if (idleccion) {
    queryOrden = queryOrden.eq("idleccion", Number(idleccion));
  } else {
    queryOrden = queryOrden.is("idleccion", null);
  }

  const { data: ultimaTarea, error: errorUltimaTarea } = await queryOrden
    .order("orden", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (errorUltimaTarea) {
    throw new Error(`Error obteniendo orden de tarea: ${errorUltimaTarea.message}`);
  }

  const nuevoOrden = (ultimaTarea?.orden || 0) + 1;

  const { data, error } = await supabase
    .from("tarea")
    .insert([
      {
        idcurso: Number(cursoId),
        idgrupo: grupoId ? Number(grupoId) : null,
        titulo,
        descripcion,
        fecha_inicio: fechaInicio || null,
        fecha_limite: fechaLimite,
        tipo_entrega: tipoEntrega,
        tipo_apoyo: tipoApoyo,
        texto_apoyo: tipoApoyo === "texto" ? textoApoyo : null,
        archivo_apoyo_url: archivoApoyoUrl,
        video_apoyo_url: videoApoyoUrl,
        apoyo_storage_provider: apoyoStorageProvider,
        apoyo_bucket: apoyoBucket,
        apoyo_object_key: apoyoObjectKey,
        calificable: Boolean(calificable),
        idmodulo: idmodulo ? Number(idmodulo) : null,
        idleccion: idleccion ? Number(idleccion) : null,
        orden: nuevoOrden,
      },
    ])
    .select()
    .single();

  if (error) {
    throw new Error(`Error guardando tarea: ${error.message}`);
  }

  return data;
};


// ======================================================
// HORARIO DOCENTE
// ======================================================



export const getHorarioDocente = async () => {
  const docenteActual = await getDocenteActual();

  const { data: grupos, error: errGrupos } = await supabase
    .from("grupo")
    .select("id, nombregrupo, horario, modalidad, idcurso, iddocente")
    .eq("iddocente", Number(docenteActual.id));

  if (errGrupos) throw new Error(errGrupos.message);

  if (!grupos || grupos.length === 0) return [];

  const cursoIds = [...new Set(grupos.map((g) => g.idcurso).filter(Boolean))];

  let cursosMap = {};
  if (cursoIds.length > 0) {
    const { data: cursos, error: errCursos } = await supabase
      .from("curso")
      .select("id, nombrecurso")
      .in("id", cursoIds);

    if (errCursos) throw new Error(errCursos.message);

    cursosMap = Object.fromEntries((cursos || []).map((c) => [c.id, c]));
  }

  return grupos.map((g) => ({
    curso: cursosMap[g.idcurso]?.nombrecurso || "Curso",
    grupo: g.nombregrupo || "",
    modalidad: g.modalidad || "",
    hora: g.horario || "",
    dia: extraerDiaDesdeHorario(g.horario),
    salon: g.modalidad?.toLowerCase() === "presencial" ? g.salon || "" : "",
  }));
};

export const getHorariosDocentes = async () => {
  const { data: grupos, error: errGrupos } = await supabase
    .from("grupo")
    .select("id, nombregrupo, horario, modalidad, idcurso, iddocente");

  if (errGrupos) throw new Error(errGrupos.message);

  if (!grupos || grupos.length === 0) return [];

  const cursoIds = [...new Set(grupos.map((g) => g.idcurso).filter(Boolean))];
  const docenteIds = [...new Set(grupos.map((g) => g.iddocente).filter(Boolean))];

  let cursosMap = {};
  let docentesMap = {};

  if (cursoIds.length > 0) {
    const { data: cursos, error: errCursos } = await supabase
      .from("curso")
      .select("id, nombrecurso")
      .in("id", cursoIds);

    if (errCursos) throw new Error(errCursos.message);

    cursosMap = Object.fromEntries((cursos || []).map((c) => [c.id, c]));
  }

  if (docenteIds.length > 0) {
    const { data: docentes, error: errDocentes } = await supabase
      .from("docente")
      .select("id, nombre, apellido")
      .in("id", docenteIds);

    if (errDocentes) throw new Error(errDocentes.message);

    docentesMap = Object.fromEntries((docentes || []).map((d) => [d.id, d]));
  }

  return grupos.map((g) => {
    const docente = docentesMap[g.iddocente];
    return {
      docente: `${docente?.nombre || ""} ${docente?.apellido || ""}`.trim(),
      curso: cursosMap[g.idcurso]?.nombrecurso || "Curso",
      grupo: g.nombregrupo || "",
      modalidad: g.modalidad || "",
      hora: g.horario || "",
      dia: extraerDiaDesdeHorario(g.horario),
      salon: g.modalidad?.toLowerCase() === "presencial" ? g.salon || "" : "",
    };
  });
};

export const createCursoAdicionalDocente = async ({
  nombre,
  institucion,
  fecha_inicio,
  fecha_fin,
  archivo,
}) => {
  const docente = await getDocenteActual();

  let archivo_url = null;

  if (archivo) {
    const safeName = archivo.name.replace(/\s+/g, "_");
    const filePath = `docentes/cursos/${docente.id}_${Date.now()}_${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from("documentos")
      .upload(filePath, archivo, {
        upsert: false,
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data: publicUrlData } = supabase.storage
      .from("documentos")
      .getPublicUrl(filePath);

    archivo_url = publicUrlData?.publicUrl ?? null;
  }

  const { data, error } = await supabase
    .from("docente_curso_adicional")
    .insert([
      {
        iddocente: docente.id,
        nombre,
        institucion: institucion || null,
        fecha_inicio: fecha_inicio || null,
        fecha_fin: fecha_fin || null,
        archivo_url,
      },
    ])
    .select()
    .single();

  if (error) throw new Error(error.message);

  return data;
};

export const getTareasByCurso = async (cursoId) => {
  const { data: tareas, error } = await supabase
    .from("tarea")
    .select("*")
    .eq("idcurso", Number(cursoId))
    .order("orden", { ascending: true })
    .order("id", { ascending: true });

  if (error) throw new Error(error.message);

  const listaTareas = tareas || [];

  if (listaTareas.length === 0) {
    return [];
  }

  const tareaIds = listaTareas.map((t) => Number(t.id)).filter(Boolean);

  const { data: evaluaciones, error: errorEvaluaciones } = await supabase
    .from("evaluacion_config")
    .select("id, idtarea, nombre, porcentaje, tipo, activa")
    .in("idtarea", tareaIds)
    .eq("tipo", "tarea")
    .eq("activa", true);

  if (errorEvaluaciones) throw new Error(errorEvaluaciones.message);

  return listaTareas.map((tarea) => {
    const evaluacion = (evaluaciones || []).find(
      (ev) => Number(ev.idtarea) === Number(tarea.id)
    );

    return {
      ...tarea,
      evaluacion_nombre: evaluacion?.nombre || "",
      evaluacion_porcentaje: evaluacion?.porcentaje ?? null,
    };
  });
};  

export const marcarTareaRevisada = async (tareaId, revisada) => {
  const { data, error } = await supabase
    .from("tarea")
    .update({ revisada })
    .eq("id", Number(tareaId))
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const deleteTarea = async (tareaId) => {
  const { error } = await supabase
    .from("tarea")
    .delete()
    .eq("id", Number(tareaId));

  if (error) throw new Error(error.message);
  return true;
};

export const moverTarea = async (tareaId, direccion) => {
  const { data: actual, error: errorActual } = await supabase
    .from("tarea")
    .select("*")
    .eq("id", Number(tareaId))
    .maybeSingle();

  if (errorActual) throw new Error(errorActual.message);
  if (!actual) throw new Error("No se encontró la tarea.");

  let query = supabase
    .from("tarea")
    .select("*")
    .eq("idcurso", actual.idcurso);

  if (direccion === "arriba") {
    query = query.lt("orden", actual.orden).order("orden", { ascending: false });
  } else {
    query = query.gt("orden", actual.orden).order("orden", { ascending: true });
  }

  const { data: vecino, error: errorVecino } = await query.limit(1).maybeSingle();

  if (errorVecino) throw new Error(errorVecino.message);
  if (!vecino) return actual;

  // intercambiar orden
  const { error: errorSwap1 } = await supabase
    .from("tarea")
    .update({ orden: vecino.orden })
    .eq("id", actual.id);

  if (errorSwap1) throw new Error(errorSwap1.message);

  const { error: errorSwap2 } = await supabase
    .from("tarea")
    .update({ orden: actual.orden })
    .eq("id", vecino.id);

  if (errorSwap2) throw new Error(errorSwap2.message);

  return true;
};

//Arrastrar orden
export const moverTareaOrden = async (tareasOrdenadas) => {
  try {
    const updates = tareasOrdenadas.map((tarea, index) =>
      supabase
        .from("tarea")
        .update({ orden: index + 1 })
        .eq("id", Number(tarea.id))
    );

    const results = await Promise.all(updates);

    const errorConDetalle = results.find((r) => r.error);
    if (errorConDetalle?.error) {
      throw new Error(errorConDetalle.error.message);
    }

    return true;
  } catch (error) {
    console.error("Error moviendo tareas:", error);
    throw error;
  }
};


// ======================================================
// MÓDULOS / LECCIONES / MATERIALES DE LECCIÓN
// ======================================================

const LIMITE_ARCHIVO_LECCION = 20 * 1024 * 1024; // 20 MB

// ------------------------------
// MÓDULOS
// ------------------------------
export const getModulosByCurso = async (cursoId) => {
  const { data: modulosRaw, error: modulosError } = await supabase
    .from("curso_modulo")
    .select("*")
    .eq("idcurso", Number(cursoId))
    .order("orden", { ascending: true })
    .order("id", { ascending: true });

  if (modulosError) throw new Error(modulosError.message);

  const modulos = modulosRaw || [];
  const modulosPadre = modulos.filter((m) => !m.idpadre);
  const submodulos = modulos.filter((m) => !!m.idpadre);

  return modulosPadre.map((modulo) => ({
    ...modulo,
    submodulos: submodulos
      .filter((s) => Number(s.idpadre) === Number(modulo.id))
      .map((s) => ({
        ...s,
        lecciones: [],
      })),
    lecciones: [],
  }));
};

export const crearModulo = async ({
  cursoId,
  titulo,
  descripcion,
  idpadre = null,
}) => {
  if (!titulo?.trim()) {
    throw new Error("El título del módulo es obligatorio.");
  }

  let query = supabase
    .from("curso_modulo")
    .select("orden")
    .eq("idcurso", Number(cursoId));

  if (idpadre) {
    query = query.eq("idpadre", Number(idpadre));
  } else {
    query = query.is("idpadre", null);
  }

  const { data: ultimo, error: errorUltimo } = await query
    .order("orden", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (errorUltimo) throw new Error(errorUltimo.message);

  const nuevoOrden = (ultimo?.orden || 0) + 1;

  const { data, error } = await supabase
    .from("curso_modulo")
    .insert({
      idcurso: Number(cursoId),
      titulo: titulo.trim(),
      descripcion: descripcion?.trim() || null,
      idpadre: idpadre ? Number(idpadre) : null,
      orden: nuevoOrden,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const actualizarModulo = async (moduloId, payload) => {
  const body = {};

  if (payload.titulo !== undefined) body.titulo = payload.titulo?.trim() || "";
  if (payload.descripcion !== undefined) {
    body.descripcion = payload.descripcion?.trim() || null;
  }

  const { data, error } = await supabase
    .from("curso_modulo")
    .update(body)
    .eq("id", Number(moduloId))
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const deleteModulo = async (moduloId) => {
  const { error } = await supabase
    .from("curso_modulo")
    .delete()
    .eq("id", Number(moduloId));

  if (error) throw new Error(error.message);
  return true;
};

export const moverModulo = async (moduloId, direccion) => {
  const { data: actual, error: errorActual } = await supabase
    .from("curso_modulo")
    .select("*")
    .eq("id", Number(moduloId))
    .maybeSingle();

  if (errorActual) throw new Error(errorActual.message);
  if (!actual) throw new Error("No se encontró el módulo.");

  let query = supabase
    .from("curso_modulo")
    .select("*")
    .eq("idcurso", actual.idcurso);

  if (direccion === "arriba") {
    query = query.lt("orden", actual.orden).order("orden", { ascending: false });
  } else {
    query = query.gt("orden", actual.orden).order("orden", { ascending: true });
  }

  const { data: vecino, error: errorVecino } = await query.limit(1).maybeSingle();

  if (errorVecino) throw new Error(errorVecino.message);
  if (!vecino) return actual;

  const { error: errorSwap1 } = await supabase
    .from("curso_modulo")
    .update({ orden: vecino.orden })
    .eq("id", actual.id);

  if (errorSwap1) throw new Error(errorSwap1.message);

  const { error: errorSwap2 } = await supabase
    .from("curso_modulo")
    .update({ orden: actual.orden })
    .eq("id", vecino.id);

  if (errorSwap2) throw new Error(errorSwap2.message);

  return true;
};

// ------------------------------
// LECCIONES
// ------------------------------
export const getLeccionesByModulo = async (moduloId) => {
  const { data, error } = await supabase
    .from("curso_leccion")
    .select("*")
    .eq("idmodulo", Number(moduloId))
    .order("orden", { ascending: true })
    .order("id", { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
};

export const crearLeccion = async ({ moduloId, titulo, descripcion }) => {
  if (!titulo?.trim()) {
    throw new Error("El título de la lección es obligatorio.");
  }

  const { data: ultima, error: errorUltima } = await supabase
    .from("curso_leccion")
    .select("orden")
    .eq("idmodulo", Number(moduloId))
    .order("orden", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (errorUltima) throw new Error(errorUltima.message);

  const nuevoOrden = (ultima?.orden || 0) + 1;

  const { data, error } = await supabase
    .from("curso_leccion")
    .insert({
      idmodulo: Number(moduloId),
      titulo: titulo.trim(),
      descripcion: descripcion?.trim() || null,
      orden: nuevoOrden,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const actualizarLeccion = async (leccionId, payload) => {
  const body = {};

  if (payload.titulo !== undefined) body.titulo = payload.titulo?.trim() || "";
  if (payload.descripcion !== undefined) {
    body.descripcion = payload.descripcion?.trim() || null;
  }

  const { data, error } = await supabase
    .from("curso_leccion")
    .update(body)
    .eq("id", Number(leccionId))
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const deleteLeccion = async (leccionId) => {
  const { error } = await supabase
    .from("curso_leccion")
    .delete()
    .eq("id", Number(leccionId));

  if (error) throw new Error(error.message);
  return true;
};

export const moverLeccion = async (leccionId, direccion) => {
  const { data: actual, error: errorActual } = await supabase
    .from("curso_leccion")
    .select("*")
    .eq("id", Number(leccionId))
    .maybeSingle();

  if (errorActual) throw new Error(errorActual.message);
  if (!actual) throw new Error("No se encontró la lección.");

  let query = supabase
    .from("curso_leccion")
    .select("*")
    .eq("idmodulo", actual.idmodulo);

  if (direccion === "arriba") {
    query = query.lt("orden", actual.orden).order("orden", { ascending: false });
  } else {
    query = query.gt("orden", actual.orden).order("orden", { ascending: true });
  }

  const { data: vecino, error: errorVecino } = await query.limit(1).maybeSingle();

  if (errorVecino) throw new Error(errorVecino.message);
  if (!vecino) return actual;

  const { error: errorSwap1 } = await supabase
    .from("curso_leccion")
    .update({ orden: vecino.orden })
    .eq("id", actual.id);

  if (errorSwap1) throw new Error(errorSwap1.message);

  const { error: errorSwap2 } = await supabase
    .from("curso_leccion")
    .update({ orden: actual.orden })
    .eq("id", vecino.id);

  if (errorSwap2) throw new Error(errorSwap2.message);

  return true;
};

// ------------------------------
// MATERIALES DE LECCIÓN
// ------------------------------
export const getMaterialesByLeccion = async (leccionId) => {
  const { data, error } = await supabase
    .from("leccion_material")
    .select("*")
    .eq("idleccion", Number(leccionId))
    .order("orden", { ascending: true })
    .order("id", { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
};

export const addMaterialLeccion = async (leccionId, payload) => {
  if (!payload.titulo?.trim()) {
    throw new Error("El título del material es obligatorio.");
  }

  if (!payload.tipo) {
    throw new Error("El tipo de material es obligatorio.");
  }

  let archivoUrl = null;
  let videoUrl = payload.video_url || null;
  let embedUrl = null;
  let vimeoVideoId = null;
  let vimeoUri = null;
  let estadoVideo = null;

  let nombreArchivo = null;
  let tamanoBytes = null;
  let mimeType = null;
  let contenidoTexto = payload.contenido_texto || null;
  let enlaceUrl = payload.enlace_url || null;

  let storageProvider = null;
  let bucket = null;
  let objectKey = null;

  if (payload.file) {
    const file = payload.file;

    if (file.size > LIMITE_ARCHIVO_LECCION) {
      throw new Error("El archivo supera el límite permitido de 20 MB.");
    }

    nombreArchivo = file.name;
    tamanoBytes = file.size || null;
    mimeType = file.type || null;

    if (payload.tipo === "video") {
      const formData = new FormData();
      formData.append("video", file);
      formData.append("title", payload.titulo?.trim() || file.name);
      formData.append("leccionId", String(leccionId));

      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

      const result = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `${apiUrl}/videos/upload`);

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable && typeof payload.onProgress === "function") {
            const percent = Math.round((event.loaded / event.total) * 100);
            payload.onProgress(percent);
          }
        };

        xhr.onload = () => {
          try {
            const response = JSON.parse(xhr.responseText || "{}");

            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(response);
            } else {
              reject(
                new Error(response?.message || "No se pudo subir el video a Vimeo.")
              );
            }
          } catch {
            reject(new Error("Respuesta inválida del servidor."));
          }
        };

        xhr.onerror = () => {
          reject(new Error("Error de red al subir el video."));
        };

        xhr.send(formData);
      });

      videoUrl = result?.videoUrl || null;
      embedUrl = result?.embedUrl || null;
      vimeoVideoId = result?.vimeoVideoId || null;
      vimeoUri = result?.vimeoUri || null;
      estadoVideo = result?.status || "procesando";

      if (typeof payload.onProgress === "function") {
        payload.onProgress(100);
      }
    } else {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

      const formData = new FormData();
      formData.append("file", file);
      formData.append("leccionId", String(leccionId));

      const res = await fetch(`${apiUrl}/s3/upload-leccion-material`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data?.message || "No se pudo subir el archivo.");
      }

      storageProvider = "s3";
      bucket = data.bucket;
      objectKey = data.key;
      archivoUrl = null;

      if (typeof payload.onProgress === "function") {
        payload.onProgress(100);
      }
    }
  }

  if (payload.tipo === "url_video" && videoUrl) {
    estadoVideo = "listo";
  }

  const { data: ultimo, error: errorUltimo } = await supabase
    .from("leccion_material")
    .select("orden")
    .eq("idleccion", Number(leccionId))
    .order("orden", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (errorUltimo) throw new Error(errorUltimo.message);

  const nuevoOrden = (ultimo?.orden || 0) + 1;

  const body = {
    idleccion: Number(leccionId),
    titulo: payload.titulo.trim(),
    tipo: payload.tipo,
    contenido_texto: contenidoTexto,
    archivo_url: archivoUrl,
    video_url: videoUrl,
    embed_url: embedUrl,
    vimeo_video_id: vimeoVideoId,
    vimeo_uri: vimeoUri,
    estado_video: estadoVideo,
    enlace_url: enlaceUrl,
    nombre_archivo: nombreArchivo,
    tamano_bytes: tamanoBytes,
    mime_type: mimeType,
    storage_provider: storageProvider,
    bucket,
    object_key: objectKey,
    orden: nuevoOrden,
  };

  const { data, error } = await supabase
    .from("leccion_material")
    .insert(body)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const actualizarMaterialLeccion = async (materialId, payload) => {
  const body = {};

  if (payload.titulo !== undefined) body.titulo = payload.titulo?.trim() || "";
  if (payload.contenido_texto !== undefined) {
    body.contenido_texto = payload.contenido_texto || null;
  }
  if (payload.video_url !== undefined) body.video_url = payload.video_url || null;
  if (payload.embed_url !== undefined) body.embed_url = payload.embed_url || null;
  if (payload.vimeo_video_id !== undefined) body.vimeo_video_id = payload.vimeo_video_id || null;
  if (payload.vimeo_uri !== undefined) body.vimeo_uri = payload.vimeo_uri || null;
  if (payload.estado_video !== undefined) body.estado_video = payload.estado_video || null;
  if (payload.enlace_url !== undefined) body.enlace_url = payload.enlace_url || null;
  if (payload.tipo !== undefined) body.tipo = payload.tipo;

  const { data, error } = await supabase
    .from("leccion_material")
    .update(body)
    .eq("id", Number(materialId))
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const deleteMaterialLeccion = async (materialId) => {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const { data: material, error: findError } = await supabase
    .from("leccion_material")
    .select("id, object_key")
    .eq("id", Number(materialId))
    .maybeSingle();

  if (findError) throw new Error(findError.message);
  if (!material) throw new Error("No se encontró el material.");

  if (material.object_key) {
    await fetch(`${apiUrl}/s3/object`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ key: material.object_key }),
    });
  }

  const { error } = await supabase
    .from("leccion_material")
    .delete()
    .eq("id", Number(materialId));

  if (error) throw new Error(error.message);
  return true;
};

export const moverMaterialLeccion = async (materialId, direccion) => {
  const { data: actual, error: errorActual } = await supabase
    .from("leccion_material")
    .select("*")
    .eq("id", Number(materialId))
    .maybeSingle();

  if (errorActual) throw new Error(errorActual.message);
  if (!actual) throw new Error("No se encontró el material.");

  let query = supabase
    .from("leccion_material")
    .select("*")
    .eq("idleccion", actual.idleccion);

  if (direccion === "arriba") {
    query = query.lt("orden", actual.orden).order("orden", { ascending: false });
  } else {
    query = query.gt("orden", actual.orden).order("orden", { ascending: true });
  }

  const { data: vecino, error: errorVecino } = await query.limit(1).maybeSingle();

  if (errorVecino) throw new Error(errorVecino.message);
  if (!vecino) return actual;

  const { error: errorSwap1 } = await supabase
    .from("leccion_material")
    .update({ orden: vecino.orden })
    .eq("id", actual.id);

  if (errorSwap1) throw new Error(errorSwap1.message);

  const { error: errorSwap2 } = await supabase
    .from("leccion_material")
    .update({ orden: actual.orden })
    .eq("id", vecino.id);

  if (errorSwap2) throw new Error(errorSwap2.message);

  return true;
};

export const getMaterialLeccionDownloadUrl = async (objectKey) => {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const res = await fetch(`${apiUrl}/s3/presign-download`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ key: objectKey }),
  });

  const data = await res.json();

  if (!res.ok || !data.ok) {
    throw new Error(data?.message || "No se pudo obtener la URL del archivo.");
  }

  return data.downloadUrl;
};

export const moverMaterialOrden = async (materialesOrdenados) => {
  try {
    const updates = materialesOrdenados.map((material, index) =>
      supabase
        .from("leccion_material")
        .update({ orden: index + 1 })
        .eq("id", Number(material.id))
    );

    const results = await Promise.all(updates);
    const errorConDetalle = results.find((r) => r.error);

    if (errorConDetalle?.error) {
      throw new Error(errorConDetalle.error.message);
    }

    return true;
  } catch (error) {
    console.error("Error reordenando materiales:", error);
    throw error;
  }
};

//===================================
// Registro de notas
//===================================

export const getRegistroNotasByGrupo = async (grupoId) => {
  try {
    const idGrupo = Number(grupoId);

    // 1. Matrículas del grupo
    const { data: matriculas, error: errMat } = await supabase
      .from("matricula")
      .select("id, idalumno, idgrupo")
      .eq("idgrupo", idGrupo);

    if (errMat) throw errMat;
    if (!matriculas || matriculas.length === 0) {
      return { evaluaciones: [], alumnos: [] };
    }

    // 2. Evaluaciones configuradas
    const { data: evaluaciones, error: errEval } = await supabase
      .from("evaluacion_config")
      .select("*")
      .eq("idgrupo", idGrupo)
      .eq("activa", true)
      .order("orden", { ascending: true });

    if (errEval) throw errEval;

    // 3. Alumnos
    const alumnoIds = [...new Set(matriculas.map((m) => m.idalumno).filter(Boolean))];

    const { data: alumnosDB, error: errAlumnos } = await supabase
      .from("alumno")
      .select("id, nombre, apellido, numdocumento, foto_url")
      .in("id", alumnoIds.length ? alumnoIds : [-1]);

    if (errAlumnos) throw errAlumnos;

    // 4. Notas
    const matriculaIds = matriculas.map((m) => m.id);

    const { data: notas, error: errNotas } = await supabase
      .from("nota")
      .select("idmatricula, evaluacion, nota")
      .in("idmatricula", matriculaIds.length ? matriculaIds : [-1]);

    if (errNotas) throw errNotas;

    const alumnosMap = new Map((alumnosDB || []).map((a) => [Number(a.id), a]));
    const notasPorMatricula = new Map();

    (notas || []).forEach((n) => {
      const key = Number(n.idmatricula);
      if (!notasPorMatricula.has(key)) {
        notasPorMatricula.set(key, {});
      }
      notasPorMatricula.get(key)[Number(n.evaluacion)] = Number(n.nota);
    });

    const matriculasUnicas = Array.from(
      new Map(
        matriculas.map((m) => [`${m.idgrupo}-${m.idalumno}`, m])
      ).values()
    );

    const alumnos = matriculasUnicas.map((m) => {
      const alumno = alumnosMap.get(Number(m.idalumno));
      const notasAlumno = notasPorMatricula.get(Number(m.id)) || {};

      let sumaPonderada = 0;
      let faltantes = 0;

      (evaluaciones || []).forEach((ev) => {
        const valor = notasAlumno[Number(ev.id)];

        if (valor === undefined || valor === null || Number.isNaN(valor)) {
          faltantes++;
        } else {
          sumaPonderada += valor * (Number(ev.porcentaje || 0) / 100);
        }
      });

      return {
        idmatricula: Number(m.id),
        idgrupo: Number(m.idgrupo),
        nombre: alumno?.nombre || "",
        apellido: alumno?.apellido || "",
        numdocumento: alumno?.numdocumento || "",
        foto_url: alumno?.foto_url || "",
        notas: notasAlumno,
        promedio: (evaluaciones || []).length ? Number(sumaPonderada.toFixed(2)) : null,
        faltantes,
      };
    });

    return {
      evaluaciones: evaluaciones || [],
      alumnos,
    };
  } catch (error) {
    console.error("Error obteniendo registro de notas:", error);
    return { evaluaciones: [], alumnos: [] };
  }
};


//===================================
// Actualizar evaluaciones
//===================================
export const actualizarEvaluacionesGrupo = async (evaluaciones) => {
  if (!evaluaciones || evaluaciones.length === 0) return true;

  const payload = evaluaciones.map((ev, index) => ({
    id: Number(ev.id),
    idgrupo: Number(ev.idgrupo),
    nombre: String(ev.nombre || "").trim(),
    porcentaje: Number(ev.porcentaje || 0),
    orden: Number(ev.orden ?? index + 1),
    tipo: ev.tipo || "manual",
    idtarea: ev.tipo === "tarea" && ev.idtarea ? Number(ev.idtarea) : null,
    idexamen: ev.tipo === "examen" && ev.idexamen ? Number(ev.idexamen) : null,
    activa: ev.activa ?? true,
  }));

  const { error } = await supabase
    .from("evaluacion_config")
    .upsert(payload, { onConflict: "id" });

  if (error) throw new Error(error.message);
  return true;
};

export const crearEvaluacionGrupo = async ({
  idgrupo,
  nombre,
  porcentaje,
  tipo = "manual",
  idtarea = null,
  idexamen = null,
  orden = 1,
}) => {
  const { data, error } = await supabase
    .from("evaluacion_config")
    .insert([
      {
        idgrupo: Number(idgrupo),
        nombre: String(nombre || "").trim(),
        porcentaje: Number(porcentaje || 0),
        tipo,
        idtarea: tipo === "tarea" && idtarea ? Number(idtarea) : null,
        idexamen: tipo === "examen" && idexamen ? Number(idexamen) : null,
        orden: Number(orden),
        activa: true,
      },
    ])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const eliminarEvaluacionGrupo = async (evaluacionId) => {
  const { error } = await supabase
    .from("evaluacion_config")
    .delete()
    .eq("id", Number(evaluacionId));

  if (error) throw new Error(error.message);
  return true;
};

//Notas con tareas calificables
export const getEvaluacionesTareaDisponiblesByGrupo = async (grupoId, tareaIdActual = null) => {
  const { data, error } = await supabase
    .from("evaluacion_config")
    .select("id, idgrupo, nombre, porcentaje, tipo, idtarea, activa, orden")
    .eq("idgrupo", Number(grupoId))
    .eq("tipo", "tarea")
    .eq("activa", true)
    .order("orden", { ascending: true });

  if (error) throw new Error(error.message);

  const tareaActual = tareaIdActual ? Number(tareaIdActual) : null;

  return (data || []).filter((ev) => {
    if (!ev.idtarea) return true;
    return Number(ev.idtarea) === tareaActual;
  });
};

export const asignarEvaluacionATarea = async ({
  tareaId,
  evaluacionId,
  grupoId,
}) => {
  const idTarea = Number(tareaId);
  const idEvaluacion = Number(evaluacionId);
  const idGrupo = Number(grupoId);

  if (!idTarea || !idEvaluacion || !idGrupo) {
    throw new Error("Faltan datos para vincular la tarea con la evaluación.");
  }

  const { data: evaluacion, error: errEval } = await supabase
    .from("evaluacion_config")
    .select("id, idgrupo, tipo, activa")
    .eq("id", idEvaluacion)
    .eq("idgrupo", idGrupo)
    .eq("tipo", "tarea")
    .eq("activa", true)
    .maybeSingle();

  if (errEval) throw new Error(errEval.message);
  if (!evaluacion) {
    throw new Error("La evaluación seleccionada no es válida para este grupo.");
  }

  const { error } = await supabase
    .from("evaluacion_config")
    .update({ idtarea: idTarea })
    .eq("id", idEvaluacion);

  if (error) throw new Error(error.message);

  return true;
};


//==============================
//Tareas calificables
//==============================

export const getTareasCalificablesByGrupo = async (grupoId) => {
  const { data, error } = await supabase
    .from("tarea")
    .select("id, titulo, fecha_limite, calificable, idgrupo")
    .eq("idgrupo", Number(grupoId))
    .eq("calificable", true)
    .order("fecha_limite", { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
};




export const getEntregasByTarea = async (tareaId) => {
  const { data: tarea, error: errTarea } = await supabase
    .from("tarea")
    .select("id, idgrupo, titulo")
    .eq("id", Number(tareaId))
    .maybeSingle();

  if (errTarea) throw new Error(errTarea.message);
  if (!tarea) throw new Error("No se encontró la tarea.");
  if (!tarea.idgrupo) {
    throw new Error("La tarea no tiene grupo asociado.");
  }

  const { data: matriculas, error: errMat } = await supabase
    .from("matricula")
    .select("id, idalumno, idgrupo")
    .eq("idgrupo", Number(tarea.idgrupo))
    .order("id", { ascending: true });

  if (errMat) throw new Error(errMat.message);

  const matriculasUnicas = Array.from(
    new Map(
      (matriculas || [])
        .filter((m) => m.idalumno)
        .map((m) => [Number(m.idalumno), m])
    ).values()
  );

  const alumnoIds = [...new Set(matriculasUnicas.map((m) => m.idalumno))];

  const { data: alumnos, error: errAlumnos } = await supabase
    .from("alumno")
    .select("id, nombre, apellido, numdocumento, foto_url")
    .in("id", alumnoIds.length ? alumnoIds : [-1]);

  if (errAlumnos) throw new Error(errAlumnos.message);

  const matriculaIds = matriculasUnicas.map((m) => Number(m.id));

  const { data: entregas, error: errEntregas } = await supabase
    .from("tarea_entrega")
    .select("*")
    .eq("idtarea", Number(tareaId))
    .in("idmatricula", matriculaIds.length ? matriculaIds : [-1]);

  if (errEntregas) throw new Error(errEntregas.message);

  const alumnosMap = new Map(
    (alumnos || []).map((a) => [Number(a.id), a])
  );

  const entregaMap = new Map(
    (entregas || []).map((e) => [Number(e.idmatricula), e])
  );

  const filas = matriculasUnicas.map((m) => {
    const alumno = alumnosMap.get(Number(m.idalumno));
    const entrega = entregaMap.get(Number(m.id)) || null;

    return {
      idmatricula: Number(m.id),
      idalumno: Number(m.idalumno),
      nombre: alumno?.nombre || "",
      apellido: alumno?.apellido || "",
      numdocumento: alumno?.numdocumento || "",
      foto_url: alumno?.foto_url || "",
      entregaId: entrega?.id || null,
      archivo_url: entrega?.archivo_url || null,
      comentario: entrega?.comentario || "",
      fecha_entrega: entrega?.fecha_entrega || null,
      nota: entrega?.nota ?? "",
      revisado: entrega?.revisado ?? false,
      entrego: !!entrega,
    };
  });

  return {
    tarea,
    entregas: filas,
  };
};

export const guardarNotaEntregaYRegistro = async ({
  tareaId,
  idmatricula,
  nota,
}) => {
  const notaNumerica =
    nota === "" || nota === null || nota === undefined ? null : Number(nota);

  if (notaNumerica !== null && (Number.isNaN(notaNumerica) || notaNumerica < 0 || notaNumerica > 20)) {
    throw new Error("La nota debe estar entre 0 y 20.");
  }

  const { data: tarea, error: errTarea } = await supabase
    .from("tarea")
    .select("id, idgrupo, titulo")
    .eq("id", Number(tareaId))
    .maybeSingle();

  if (errTarea) throw new Error(errTarea.message);
  if (!tarea) throw new Error("No se encontró la tarea.");

  const { data: evaluacion, error: errEval } = await supabase
    .from("evaluacion_config")
    .select("id, idgrupo, idtarea, activa, tipo")
    .eq("idgrupo", Number(tarea.idgrupo))
    .eq("tipo", "tarea")
    .eq("idtarea", Number(tareaId))
    .eq("activa", true)
    .maybeSingle();

  if (errEval) throw new Error(errEval.message);
  if (!evaluacion) {
    throw new Error("Esta tarea no está vinculada a una evaluación activa.");
  }

  const { data: entrega, error: errEntrega } = await supabase
    .from("tarea_entrega")
    .select("id")
    .eq("idtarea", Number(tareaId))
    .eq("idmatricula", Number(idmatricula))
    .maybeSingle();

  if (errEntrega) throw new Error(errEntrega.message);

  if (entrega) {
  const { error: errUpdate } = await supabase
    .from("tarea_entrega")
    .update({
      nota: notaNumerica,
      revisado: notaNumerica !== null,
    })
    .eq("id", Number(entrega.id));

  if (errUpdate) throw new Error(errUpdate.message);
} else {
  const { error: errInsert } = await supabase
    .from("tarea_entrega")
    .insert({
      idtarea: Number(tareaId),
      idmatricula: Number(idmatricula),
      idalumno: null, // opcional si no lo tienes
      nota: notaNumerica,
      revisado: notaNumerica !== null,
    });

  if (errInsert) throw new Error(errInsert.message);
}

  await guardarNotas(Number(idmatricula), {
    [Number(evaluacion.id)]: notaNumerica,
  });

  return true;
};


//==============================
//Mover Sub Módulos
//==============================

export const moverSubModulo = async (submoduloId, direccion) => {
  const { data: actual, error: errorActual } = await supabase
    .from("curso_modulo")
    .select("*")
    .eq("id", Number(submoduloId))
    .maybeSingle();

  if (errorActual) throw new Error(errorActual.message);
  if (!actual) throw new Error("No se encontró el submódulo.");
  if (!actual.idpadre) throw new Error("El elemento indicado no es un submódulo.");

  let query = supabase
    .from("curso_modulo")
    .select("*")
    .eq("idcurso", Number(actual.idcurso))
    .eq("idpadre", Number(actual.idpadre));

  if (direccion === "arriba") {
    query = query.lt("orden", actual.orden).order("orden", { ascending: false });
  } else {
    query = query.gt("orden", actual.orden).order("orden", { ascending: true });
  }

  const { data: vecino, error: errorVecino } = await query.limit(1).maybeSingle();

  if (errorVecino) throw new Error(errorVecino.message);
  if (!vecino) return true;

  const { error: errorSwap1 } = await supabase
    .from("curso_modulo")
    .update({ orden: vecino.orden })
    .eq("id", actual.id);

  if (errorSwap1) throw new Error(errorSwap1.message);

  const { error: errorSwap2 } = await supabase
    .from("curso_modulo")
    .update({ orden: actual.orden })
    .eq("id", vecino.id);

  if (errorSwap2) throw new Error(errorSwap2.message);

  return true;
};


//Arrastrar submódulo y lección
export const moverSubModuloOrden = async (submodulosOrdenados) => {
  try {
    const updates = submodulosOrdenados.map((submodulo, index) =>
      supabase
        .from("curso_modulo")
        .update({ orden: index + 1 })
        .eq("id", Number(submodulo.id))
    );

    const results = await Promise.all(updates);
    const errorConDetalle = results.find((r) => r.error);

    if (errorConDetalle?.error) {
      throw new Error(errorConDetalle.error.message);
    }

    return true;
  } catch (error) {
    console.error("Error reordenando submódulos:", error);
    throw error;
  }
};

export const moverLeccionOrden = async (leccionesOrdenadas) => {
  try {
    const updates = leccionesOrdenadas.map((leccion, index) =>
      supabase
        .from("curso_leccion")
        .update({ orden: index + 1 })
        .eq("id", Number(leccion.id))
    );

    const results = await Promise.all(updates);
    const errorConDetalle = results.find((r) => r.error);

    if (errorConDetalle?.error) {
      throw new Error(errorConDetalle.error.message);
    }

    return true;
  } catch (error) {
    console.error("Error reordenando lecciones:", error);
    throw error;
  }
};


//Actualizar contraseña docente
export const updatePasswordDocente = async (newPassword) => {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) throw new Error(error.message || "No se pudo actualizar la contraseña");
  return data;
};


export const getPendientesRevisionByGrupo = async (grupoId) => {
  const idGrupo = Number(grupoId);

  const { data: tareas, error: errTareas } = await supabase
    .from("tarea")
    .select("id")
    .eq("idgrupo", idGrupo);

  if (errTareas) throw new Error(errTareas.message);

  const tareaIds = (tareas || []).map((t) => Number(t.id));
  if (tareaIds.length === 0) return 0;

  const { data: matriculas, error: errMat } = await supabase
    .from("matricula")
    .select("id")
    .eq("idgrupo", idGrupo);

  if (errMat) throw new Error(errMat.message);

  const matriculaIds = (matriculas || []).map((m) => Number(m.id));
  if (matriculaIds.length === 0) return 0;

  const { data: entregas, error: errEntregas } = await supabase
    .from("tarea_entrega")
    .select("id")
    .in("idtarea", tareaIds)
    .in("idmatricula", matriculaIds)
    .eq("revisado", false);

  if (errEntregas) throw new Error(errEntregas.message);

  return (entregas || []).length;
};




// ==============================
// EXÁMENES
// ==============================

const TIPOS_PREGUNTA_CON_OPCIONES = ["unica", "multiple"];
const TIPOS_PREGUNTA_TEXTO = ["texto_corto", "texto_largo"];

const normalizarConfiguracionPregunta = (pregunta = {}) => {
  const tipoPregunta = pregunta.tipo_pregunta || "unica";

  return {
    tipo_pregunta: tipoPregunta,
    respuesta_texto:
      TIPOS_PREGUNTA_TEXTO.includes(tipoPregunta) || tipoPregunta === "numerica"
        ? (pregunta.respuesta_texto || "").trim() || null
        : null,
    texto_placeholder:
      !TIPOS_PREGUNTA_CON_OPCIONES.includes(tipoPregunta)
        ? (pregunta.texto_placeholder || "").trim() || null
        : null,
    max_caracteres:
      tipoPregunta === "texto_corto"
        ? Number(pregunta.max_caracteres || 50)
        : tipoPregunta === "texto_largo"
        ? Number(pregunta.max_caracteres || 200)
        : null,
    permitir_decimales:
      tipoPregunta === "numerica"
        ? Boolean(pregunta.permitir_decimales)
        : true,
    tamano_max_mb:
      tipoPregunta === "archivo"
        ? Number(pregunta.tamano_max_mb || 10)
        : 10,
    extensiones_permitidas:
      tipoPregunta === "archivo"
        ? (pregunta.extensiones_permitidas || "").trim() || null
        : null,
  };
};

export const crearExamen = async ({
  leccionId,
  grupoId,
  titulo,
  descripcion,
  duracion_minutos,
  intentos_permitidos,
  nota_maxima,
  preguntas,
}) => {
  const { data: examen, error: errExamen } = await supabase
    .from("examen")
    .insert({
      idleccion: Number(leccionId),
      idgrupo: Number(grupoId),
      titulo: titulo?.trim(),
      descripcion: descripcion?.trim() || null,
      duracion_minutos: Number(duracion_minutos || 30),
      intentos_permitidos: Number(intentos_permitidos || 1),
      nota_maxima: Number(nota_maxima || 20),
      estado: true,
    })
    .select()
    .single();

  if (errExamen) throw new Error(errExamen.message);

  for (let i = 0; i < (preguntas || []).length; i++) {
    const pregunta = preguntas[i];
    const config = normalizarConfiguracionPregunta(pregunta);
    const tipoPregunta = config.tipo_pregunta;

    const { data: preguntaDB, error: errPregunta } = await supabase
      .from("examen_pregunta")
      .insert({
        idexamen: Number(examen.id),
        enunciado: pregunta.enunciado?.trim(),
        puntaje: Number(pregunta.puntaje || 1),
        orden: i + 1,
        estado: true,
        tipo_pregunta: tipoPregunta,
        respuesta_texto: config.respuesta_texto,
        texto_placeholder: config.texto_placeholder,
        max_caracteres: config.max_caracteres,
        permitir_decimales: config.permitir_decimales,
        tamano_max_mb: config.tamano_max_mb,
        extensiones_permitidas: config.extensiones_permitidas,
      })
      .select()
      .single();

    if (errPregunta) throw new Error(errPregunta.message);

    if (TIPOS_PREGUNTA_CON_OPCIONES.includes(tipoPregunta)) {
      const opciones = (pregunta.opciones || [])
        .filter((op) => op.texto?.trim())
        .map((op, idx) => ({
          idpregunta: Number(preguntaDB.id),
          texto: op.texto?.trim(),
          es_correcta: !!op.es_correcta,
          orden: idx + 1,
        }));

      if (opciones.length > 0) {
        const { error: errOpciones } = await supabase
          .from("examen_opcion")
          .insert(opciones);

        if (errOpciones) throw new Error(errOpciones.message);
      }
    }
  }

  return examen;
};

export const getExamenDetalle = async (examenId) => {
  const idExamen = Number(examenId);

  const { data: examen, error: errExamen } = await supabase
    .from("examen")
    .select("*")
    .eq("id", idExamen)
    .maybeSingle();

  if (errExamen) throw new Error(errExamen.message);
  if (!examen) throw new Error("No se encontró el examen.");

  const { data: preguntasDB, error: errPreg } = await supabase
    .from("examen_pregunta")
    .select(
      `
      id,
      idexamen,
      enunciado,
      puntaje,
      orden,
      estado,
      tipo_pregunta,
      respuesta_texto,
      texto_placeholder,
      max_caracteres,
      permitir_decimales,
      tamano_max_mb,
      extensiones_permitidas
      `
    )
    .eq("idexamen", idExamen)
    .eq("estado", true)
    .order("orden", { ascending: true });

  if (errPreg) throw new Error(errPreg.message);

  const preguntaIds = (preguntasDB || []).map((p) => Number(p.id));
  let opcionesDB = [];

  if (preguntaIds.length > 0) {
    const { data: opciones, error: errOpciones } = await supabase
      .from("examen_opcion")
      .select("id, idpregunta, texto, es_correcta, orden")
      .in("idpregunta", preguntaIds)
      .order("orden", { ascending: true });

    if (errOpciones) throw new Error(errOpciones.message);
    opcionesDB = opciones || [];
  }

  return {
    ...examen,
    preguntas: (preguntasDB || []).map((pregunta) => {
      const tipo = pregunta.tipo_pregunta || "unica";

      return {
        id: Number(pregunta.id),
        enunciado: pregunta.enunciado || "",
        puntaje: Number(pregunta.puntaje || 1),
        tipo_pregunta: tipo,
        respuesta_texto: pregunta.respuesta_texto || "",
        texto_placeholder: pregunta.texto_placeholder || "",
        max_caracteres:
          pregunta.max_caracteres !== null && pregunta.max_caracteres !== undefined
            ? Number(pregunta.max_caracteres)
            : tipo === "texto_corto"
            ? 50
            : tipo === "texto_largo"
            ? 200
            : null,
        permitir_decimales:
          pregunta.permitir_decimales !== null && pregunta.permitir_decimales !== undefined
            ? !!pregunta.permitir_decimales
            : true,
        tamano_max_mb:
          pregunta.tamano_max_mb !== null && pregunta.tamano_max_mb !== undefined
            ? Number(pregunta.tamano_max_mb)
            : 10,
        extensiones_permitidas: pregunta.extensiones_permitidas || "",
        opciones: TIPOS_PREGUNTA_CON_OPCIONES.includes(tipo)
          ? opcionesDB
              .filter((opcion) => Number(opcion.idpregunta) === Number(pregunta.id))
              .sort((a, b) => Number(a.orden || 0) - Number(b.orden || 0))
              .map((opcion) => ({
                id: Number(opcion.id),
                texto: opcion.texto || "",
                es_correcta: !!opcion.es_correcta,
              }))
          : [],
      };
    }),
  };
};

export const getExamenesByLeccion = async (leccionId) => {
  const { data: examenes, error } = await supabase
    .from("examen")
    .select("*")
    .eq("idleccion", Number(leccionId))
    .eq("estado", true)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  const examenIds = (examenes || []).map((e) => Number(e.id));

  let preguntas = [];
  let evaluaciones = [];

  if (examenIds.length > 0) {
    const { data: preguntasDB, error: errPreg } = await supabase
      .from("examen_pregunta")
      .select("id, idexamen")
      .in("idexamen", examenIds);

    if (errPreg) throw new Error(errPreg.message);
    preguntas = preguntasDB || [];

    const { data: evaluacionesDB, error: errEval } = await supabase
      .from("evaluacion_config")
      .select("id, nombre, porcentaje, idexamen, tipo, activa")
      .in("idexamen", examenIds)
      .eq("tipo", "examen")
      .eq("activa", true);

    if (errEval) throw new Error(errEval.message);
    evaluaciones = evaluacionesDB || [];
  }

  return (examenes || []).map((examen) => {
    const total_preguntas = preguntas.filter(
      (p) => Number(p.idexamen) === Number(examen.id)
    ).length;

    const evaluacion = evaluaciones.find(
      (ev) => Number(ev.idexamen) === Number(examen.id)
    );

    return {
      ...examen,
      total_preguntas,
      evaluacion_nombre: evaluacion?.nombre || "",
      evaluacion_porcentaje: evaluacion?.porcentaje ?? null,
    };
  });
};

export const getEvaluacionesExamenDisponiblesByGrupo = async (
  grupoId,
  examenIdActual = null
) => {
  const { data, error } = await supabase
    .from("evaluacion_config")
    .select("id, idgrupo, nombre, porcentaje, tipo, idexamen, activa, orden")
    .eq("idgrupo", Number(grupoId))
    .eq("tipo", "examen")
    .eq("activa", true)
    .order("orden", { ascending: true });

  if (error) throw new Error(error.message);

  const examenActual = examenIdActual ? Number(examenIdActual) : null;

  return (data || []).filter((ev) => {
    if (!ev.idexamen) return true;
    return Number(ev.idexamen) === examenActual;
  });
};

export const asignarEvaluacionAExamen = async ({
  examenId,
  evaluacionId,
  grupoId,
}) => {
  const idExamen = Number(examenId);
  const idEvaluacion = Number(evaluacionId);
  const idGrupo = Number(grupoId);

  if (!idExamen || !idEvaluacion || !idGrupo) {
    throw new Error("Faltan datos para vincular el examen con la evaluación.");
  }

  const { data: evaluacion, error: errEval } = await supabase
    .from("evaluacion_config")
    .select("id, idgrupo, tipo, activa")
    .eq("id", idEvaluacion)
    .eq("idgrupo", idGrupo)
    .eq("tipo", "examen")
    .eq("activa", true)
    .maybeSingle();

  if (errEval) throw new Error(errEval.message);
  if (!evaluacion) {
    throw new Error("La evaluación seleccionada no es válida para este grupo.");
  }

  const { error } = await supabase
    .from("evaluacion_config")
    .update({ idexamen: idExamen })
    .eq("id", idEvaluacion);

  if (error) throw new Error(error.message);

  return true;
};

export const deleteExamen = async (examenId) => {
  const { error } = await supabase
    .from("examen")
    .delete()
    .eq("id", Number(examenId));

  if (error) throw new Error(error.message);

  return true;
};

export const actualizarExamen = async (examenId, datosExamen) => {
  const idExamen = Number(examenId);

  const { error: errExamen } = await supabase
    .from("examen")
    .update({
      titulo: datosExamen.titulo?.trim(),
      descripcion: datosExamen.descripcion?.trim() || null,
      duracion_minutos: Number(datosExamen.duracion_minutos || 30),
      intentos_permitidos: Number(datosExamen.intentos_permitidos || 1),
      nota_maxima: Number(datosExamen.nota_maxima || 20),
      updated_at: new Date().toISOString(),
    })
    .eq("id", idExamen);

  if (errExamen) throw new Error(errExamen.message);

  const { data: preguntasActuales, error: errPreguntasActuales } = await supabase
    .from("examen_pregunta")
    .select("id")
    .eq("idexamen", idExamen);

  if (errPreguntasActuales) throw new Error(errPreguntasActuales.message);

  const preguntaIds = (preguntasActuales || []).map((p) => Number(p.id));

  if (preguntaIds.length > 0) {
    const { error: errEliminarOpciones } = await supabase
      .from("examen_opcion")
      .delete()
      .in("idpregunta", preguntaIds);

    if (errEliminarOpciones) throw new Error(errEliminarOpciones.message);
  }

  const { error: errEliminarPreguntas } = await supabase
    .from("examen_pregunta")
    .delete()
    .eq("idexamen", idExamen);

  if (errEliminarPreguntas) throw new Error(errEliminarPreguntas.message);

  for (let i = 0; i < (datosExamen.preguntas || []).length; i++) {
    const pregunta = datosExamen.preguntas[i];
    const config = normalizarConfiguracionPregunta(pregunta);
    const tipoPregunta = config.tipo_pregunta;

    const { data: preguntaDB, error: errPregunta } = await supabase
      .from("examen_pregunta")
      .insert({
        idexamen: idExamen,
        enunciado: pregunta.enunciado?.trim(),
        puntaje: Number(pregunta.puntaje || 1),
        orden: i + 1,
        estado: true,
        tipo_pregunta: tipoPregunta,
        respuesta_texto: config.respuesta_texto,
        texto_placeholder: config.texto_placeholder,
        max_caracteres: config.max_caracteres,
        permitir_decimales: config.permitir_decimales,
        tamano_max_mb: config.tamano_max_mb,
        extensiones_permitidas: config.extensiones_permitidas,
      })
      .select()
      .single();

    if (errPregunta) throw new Error(errPregunta.message);

    if (TIPOS_PREGUNTA_CON_OPCIONES.includes(tipoPregunta)) {
      const opciones = (pregunta.opciones || [])
        .filter((op) => op.texto?.trim())
        .map((opcion, idx) => ({
          idpregunta: Number(preguntaDB.id),
          texto: opcion.texto?.trim(),
          es_correcta: !!opcion.es_correcta,
          orden: idx + 1,
        }));

      if (opciones.length > 0) {
        const { error: errOpciones } = await supabase
          .from("examen_opcion")
          .insert(opciones);

        if (errOpciones) throw new Error(errOpciones.message);
      }
    }
  }

  return await getExamenDetalle(idExamen);
};

// ==============================
// SESIONES EN VIVO
// ==============================

export const getSesionesVivoByCurso = async (cursoId) => {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const res = await fetch(`${apiUrl}/sesion-vivo/curso/${cursoId}`);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || "No se pudieron cargar las sesiones en vivo.");
  }

  return data || [];
};

export const crearSesionVivo = async (payload) => {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const res = await fetch(`${apiUrl}/sesion-vivo`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      idcurso: Number(payload.idcurso),
      titulo: payload.titulo,
      descripcion: payload.descripcion,
      fecha: payload.fecha,
      duracion: Number(payload.duracion),
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || "No se pudo crear la sesión en vivo.");
  }

  return data;
};