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
    archivo_url: payload.archivo_url,
    mime_type: payload.mime_type || "application/pdf",
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

export const getAlumnosByCurso = async (cursoId) => {
  // 1. Traer grupos del curso del docente actual
  const docente = await getDocenteActual();

  const { data: grupos, error: errGrupos } = await supabase
    .from("grupo")
    .select("id")
    .eq("idcurso", Number(cursoId))
    .eq("iddocente", docente.id);

  if (errGrupos) throw new Error(errGrupos.message);

  const grupoIds = (grupos || []).map((g) => g.id);
  if (grupoIds.length === 0) return [];

  // 2. Traer matrículas de esos grupos
  const { data: matriculas, error: errMat } = await supabase
    .from("matricula")
    .select("id, idalumno, idgrupo")
    .in("idgrupo", grupoIds);

    

  if (errMat) throw new Error(errMat.message);
  if (!matriculas || matriculas.length === 0) return [];

  // 3. Dejar solo una matrícula por alumno
  const matriculasUnicas = Array.from(
    new Map(
      matriculas
        .filter((m) => m.idalumno)
        .map((m) => [m.idalumno, m])
    ).values()
  );

  const alumnoIds = matriculasUnicas.map((m) => m.idalumno);
  if (alumnoIds.length === 0) return [];

  // 4. Traer alumnos
  const alumnosChunks = chunkArray(alumnoIds, 100);
  let alumnos = [];

  for (const chunk of alumnosChunks) {
    const { data, error } = await supabase
      .from("alumno")
      .select("*")
      .in("id", chunk);

    if (error) throw new Error(error.message);
    alumnos = alumnos.concat(data || []);
  }

  const alumnosMap = new Map((alumnos || []).map((a) => [a.id, a]));

  // 5. Traer notas solo de las matrículas únicas
const matriculaIds = matriculasUnicas.map((m) => m.id);

const { data: notas, error: errNotas } = await supabase
  .from("nota")
  .select("idmatricula, evaluacion, nota")
  .in("idmatricula", matriculaIds);

if (errNotas) throw new Error(errNotas.message);

// Agrupar notas por matrícula
const notasMap = new Map();

(notas || []).forEach((n) => {
  const key = n.idmatricula;

  if (!notasMap.has(key)) {
    notasMap.set(key, {});
  }

  const fila = notasMap.get(key);

  if (Number(n.evaluacion) === 1) fila.nota1 = n.nota;
  if (Number(n.evaluacion) === 2) fila.nota2 = n.nota;
  if (Number(n.evaluacion) === 3) fila.nota3 = n.nota;
});

// 6. Armar resultado final
return matriculasUnicas
  .map((m) => {
    const alumno = alumnosMap.get(m.idalumno);
    if (!alumno) return null;

    const nota = notasMap.get(m.id) || {};

    return {
      idalumno: alumno.id,
      idmatricula: m.id,
      nombre: alumno.nombre || "",
      apellido: alumno.apellido || "",
      correo: alumno.correo || "",
      numdocumento: alumno.numdocumento || "",
      foto_url: alumno.foto_url || "",
      nota1: nota.nota1 ?? "",
      nota2: nota.nota2 ?? "",
      nota3: nota.nota3 ?? "",
    };
  })
  .filter(Boolean);
};
// ======================================================
// GUARDAR NOTAS
// ======================================================

export const guardarNotas = async (idmatricula, notas) => {
  const idMat = Number(idmatricula);

  const registros = [
    { idmatricula: idMat, evaluacion: 1, nota: Number(notas[1] ?? notas.nota1) },
    { idmatricula: idMat, evaluacion: 2, nota: Number(notas[2] ?? notas.nota2) },
    { idmatricula: idMat, evaluacion: 3, nota: Number(notas[3] ?? notas.nota3) },
  ];

  const { error } = await supabase
    .from("nota")
    .upsert(registros, {
      onConflict: "idmatricula,evaluacion",
    });

  if (error) throw new Error(error.message);

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
// SUBIDA A STORAGE - PDF DOCUMENTO
// ======================================================

export const uploadPdfDocumentoDocente = async (file, tipo = "cv") => {
  const docente = await getDocenteActual();

  if (!file) throw new Error("No se proporcionó ningún archivo.");
  if (file.type !== "application/pdf") {
    throw new Error("Solo se permiten archivos PDF.");
  }

  const extension = "pdf";
  const fileName = `docente-${docente.id}-${tipo}-${Date.now()}.${extension}`;
  const filePath = `docentes/documentos/${fileName}`;

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

  const doc = await addDocumentoDocente({
    nombre: file.name,
    tipo,
    archivo_url: publicUrl,
    mime_type: "application/pdf",
  });

  return doc;
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
  const { data: curso, error: errCurso } = await supabase
    .from("curso")
    .select("id, nombrecurso, descripcion")
    .eq("id", Number(cursoId))
    .maybeSingle();

  if (errCurso) throw new Error(errCurso.message);
  if (!curso) return null;

  const { data: grupo, error: errGrupo } = await supabase
    .from("grupo")
    .select("nombregrupo, horario")
    .eq("idcurso", Number(cursoId))
    .limit(1)
    .maybeSingle();

  if (errGrupo) throw new Error(errGrupo.message);

  return {
    id: curso.id,
    nombre: curso.nombrecurso,
    descripcion: curso.descripcion,
    grupo: grupo?.nombregrupo || "-",
    horario: grupo?.horario || "-",
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
    titulo,
    descripcion,
    fechaInicio,
    fechaLimite,
    tipoEntrega,
    tipoApoyo,
    textoApoyo,
    archivoApoyo,
    videoApoyo,
  } = payload;

  let archivoApoyoUrl = null;
  let videoApoyoUrl = null;

  // ==============================
  // Subir archivo de apoyo si existe
  // ==============================
  if (tipoApoyo === "archivo" && archivoApoyo) {
    const extension = archivoApoyo.name.split(".").pop();
    const fileName = `archivo_${Date.now()}.${extension}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("tareas-apoyo")
      .upload(filePath, archivoApoyo, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Error subiendo archivo de apoyo: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabase.storage
      .from("tareas-apoyo")
      .getPublicUrl(filePath);

    archivoApoyoUrl = publicUrlData?.publicUrl || null;
  }

  // ==============================
  // Subir video de apoyo si existe
  // ==============================
  if (tipoApoyo === "video" && videoApoyo) {
    const extension = videoApoyo.name.split(".").pop();
    const fileName = `video_${Date.now()}.${extension}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("tareas-apoyo")
      .upload(filePath, videoApoyo, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Error subiendo video de apoyo: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabase.storage
      .from("tareas-apoyo")
      .getPublicUrl(filePath);

    videoApoyoUrl = publicUrlData?.publicUrl || null;
  }

  // ==============================
  // Insertar tarea en la tabla
  // ==============================
  const { data, error } = await supabase
    .from("tarea")
    .insert([
      {
        idcurso: Number(cursoId),
        titulo,
        descripcion,
        fecha_inicio: fechaInicio || null,
        fecha_limite: fechaLimite,
        tipo_entrega: tipoEntrega,
        tipo_apoyo: tipoApoyo,
        texto_apoyo: tipoApoyo === "texto" ? textoApoyo : null,
        archivo_apoyo_url: archivoApoyoUrl,
        video_apoyo_url: videoApoyoUrl,
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


