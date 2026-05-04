import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  BookOpen,
  CheckCircle,
  Clock,
  Edit2,
  Eye,
  EyeOff,
  FolderOpen,
  Globe2,
  Home,
  Image,
  Inbox,
  Mail,
  MailOpen,
  MessageSquare,
  Plus,
  Save,
  Search,
  Star,
  Trash2,
  Users,
  X,
  Upload,
  ImageIcon,
  Copy,
  ArrowDown,
  ArrowUp,
  FileText,
  HelpCircle,
} from "lucide-react";

import {
  actualizarCategoriaAdminWeb,
  actualizarContenidoAdminWeb,
  actualizarCursoWebAdmin,
  actualizarEstadoMensajeContactoAdminWeb,
  asignarCategoriasCursoWeb,
  crearCategoriaAdminWeb,
  eliminarCategoriaAdminWeb,
  listarCategoriasAdminWeb,
  listarCursosAdminWeb,
  listarMensajesContactoAdminWeb,
  marcarMensajeContactoLeidoAdminWeb,
  obtenerContenidoAdminWeb,
  eliminarMedioAdminWeb,
  listarMediosAdminWeb,
  subirMedioAdminWeb,
  actualizarPaginaAdminWeb,
  crearPaginaAdminWeb,
  eliminarPaginaAdminWeb,
  listarPaginasAdminWeb,
} from "../services/adminWeb.service";

const emptyCategoriaForm = {
  nombre: "",
  slug: "",
  descripcion: "",
  imagen_url: "",
  visible_web: true,
  estado: true,
  orden: 1,
};

const emptyCursoWebForm = {
  visible_web: false,
  destacado_web: false,
  slug: "",
  imagen_url: "",
  orden_web: 1,
  etiqueta_web: "Curso",
  resumen_web: "",
  requisitos_web: "",
  beneficios_texto: "",
  categoriasIds: [],
};

const defaultHomeContent = {
  hero: {
    tag: "Formación profesional",
    title: "Aprende nuevas habilidades con cursos diseñados para crecer",
    description:
      "Explora programas académicos modernos, prácticos y orientados al desarrollo profesional.",
    backgroundImage:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=80",
    primaryButton: {
      text: "Ver cursos",
      to: "/web/cursos",
    },
    secondaryButton: {
      text: "Conócenos",
      to: "/web/nosotros",
    },
  },
  benefits: [
    {
      title: "Cursos prácticos",
      description:
        "Aprende con contenido aplicado, actividades y recursos útiles para tu formación.",
    },
    {
      title: "Docentes especializados",
      description:
        "Capacítate con profesionales preparados para acompañarte en tu aprendizaje.",
    },
    {
      title: "Certificación",
      description:
        "Obtén una constancia o certificado al completar satisfactoriamente tu curso.",
    },
  ],
  featured: {
    tag: "Cursos destacados",
    title: "Programas recomendados",
    description:
      "Explora los cursos seleccionados para mostrar en la página principal.",
  },
  cta: {
    title: "Comienza tu formación hoy",
    description:
      "Elige un curso, inscríbete y empieza a desarrollar nuevas habilidades.",
    buttonText: "Explorar cursos",
    buttonTo: "/web/cursos",
  },
};

const defaultNosotrosContent = {
  hero: {
    tag: "Sobre nosotros",
    title: "Impulsamos el aprendizaje con formación práctica y profesional",
    description:
      "Somos una plataforma orientada a brindar cursos, programas y experiencias de aprendizaje pensadas para el crecimiento académico y laboral.",
  },
  about: [
    {
      title: "Quiénes somos",
      paragraphs: [
        "Somos una institución comprometida con la formación continua y el desarrollo de habilidades aplicadas.",
        "Buscamos acercar la educación a más personas mediante cursos prácticos, accesibles y alineados a las necesidades actuales.",
      ],
    },
    {
      title: "Nuestro propósito",
      paragraphs: [
        "Queremos contribuir al crecimiento personal y profesional de nuestros estudiantes.",
        "Diseñamos experiencias de aprendizaje enfocadas en resultados, práctica y mejora continua.",
      ],
    },
  ],
  pillars: {
    tag: "Nuestros pilares",
    title: "Misión y visión",
    items: [
      {
        title: "Misión",
        description:
          "Brindar formación de calidad mediante programas prácticos que fortalezcan las competencias de nuestros estudiantes.",
      },
      {
        title: "Visión",
        description:
          "Ser una plataforma reconocida por impulsar el aprendizaje, la empleabilidad y el desarrollo profesional.",
      },
    ],
  },
  values: {
    tag: "Valores",
    title: "Lo que nos representa",
    items: [
      {
        title: "Compromiso",
        description:
          "Trabajamos con responsabilidad para ofrecer una experiencia educativa confiable.",
      },
      {
        title: "Innovación",
        description:
          "Buscamos mejorar continuamente nuestros contenidos, herramientas y metodologías.",
      },
      {
        title: "Calidad",
        description:
          "Promovemos programas bien estructurados, útiles y orientados a resultados.",
      },
    ],
  },
};

const defaultContactoContent = {
  hero: {
    tag: "Contacto",
    title: "Estamos aquí para ayudarte",
    description:
      "Comunícate con nosotros para resolver dudas sobre cursos, inscripciones, pagos o soporte académico.",
  },
  contactInfo: {
    title: "Información de contacto",
    items: [
      {
        label: "Correo",
        value: "contacto@conit.com",
      },
      {
        label: "Teléfono",
        value: "+51 999 999 999",
      },
      {
        label: "Dirección",
        value: "Cajamarca, Perú",
      },
      {
        label: "Horario",
        value: "Lunes a viernes de 9:00 a. m. a 6:00 p. m.",
      },
    ],
  },
  support: {
    title: "Soporte académico",
    paragraphs: [
      "Nuestro equipo puede orientarte sobre los cursos disponibles, requisitos, horarios y proceso de inscripción.",
      "También podemos ayudarte con consultas relacionadas a pagos, acceso a la plataforma y certificados.",
    ],
  },
  form: {
    tag: "Escríbenos",
    title: "Envíanos un mensaje",
    fields: {
      nombre: {
        label: "Nombre completo",
        placeholder: "Ingresa tu nombre",
      },
      correo: {
        label: "Correo electrónico",
        placeholder: "Ingresa tu correo",
      },
      asunto: {
        label: "Asunto",
        placeholder: "Motivo de contacto",
      },
      mensaje: {
        label: "Mensaje",
        placeholder: "Escribe tu consulta",
      },
    },
    buttonText: "Enviar mensaje",
  },
};

export default function GestionWeb() {
  const [tab, setTab] = useState("inicio");
  const [cursos, setCursos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(false);

  const [modalCategoria, setModalCategoria] = useState(false);
  const [categoriaEditar, setCategoriaEditar] = useState(null);
  const [formCategoria, setFormCategoria] = useState(emptyCategoriaForm);

  const [modalCurso, setModalCurso] = useState(false);
  const [cursoEditar, setCursoEditar] = useState(null);
  const [formCurso, setFormCurso] = useState(emptyCursoWebForm);

  const [homeForm, setHomeForm] = useState(defaultHomeContent);
  const [guardandoHome, setGuardandoHome] = useState(false);

  const [nosotrosForm, setNosotrosForm] = useState(defaultNosotrosContent);
  const [guardandoNosotros, setGuardandoNosotros] = useState(false);

  const [contactoForm, setContactoForm] = useState(defaultContactoContent);
  const [guardandoContacto, setGuardandoContacto] = useState(false);

  const [mensajesContacto, setMensajesContacto] = useState([]);
  const [mensajeSeleccionado, setMensajeSeleccionado] = useState(null);
  const [filtroMensajes, setFiltroMensajes] = useState("todos");

  const [medios, setMedios] = useState([]);
  const [subiendoMedio, setSubiendoMedio] = useState(false);

  const [paginas, setPaginas] = useState([]);
  const [modalPagina, setModalPagina] = useState(false);
  const [paginaEditar, setPaginaEditar] = useState(null);

  const [modalContenidoPagina, setModalContenidoPagina] = useState(false);
  const [paginaContenidoEditar, setPaginaContenidoEditar] = useState(null);
  const [contenidoPaginaForm, setContenidoPaginaForm] = useState({
   secciones: [],
  });

  const [formPagina, setFormPagina] = useState({
    titulo: "",
    slug: "",
    descripcion: "",
    visible_menu: true,
    publicada: true,
    orden: 1,
    seo_title: "",
    seo_description: "",
  });

  const [mediaPicker, setMediaPicker] = useState({
    abierto: false,
    destino: "",
    titulo: "Seleccionar imagen",
  });

  const cargarDatos = async () => {
    try {
        setCargando(true);

        const [
          categoriasData,
          cursosData,
          homeData,
          nosotrosData,
          contactoData,
          mensajesData,
          mediosData,
          paginasData,
        ] = await Promise.all([
          listarCategoriasAdminWeb(),
          listarCursosAdminWeb(),
          obtenerContenidoAdminWeb("home"),
          obtenerContenidoAdminWeb("nosotros"),
          obtenerContenidoAdminWeb("contacto"),
          listarMensajesContactoAdminWeb(),
          listarMediosAdminWeb(),
          listarPaginasAdminWeb(),
        ]);

        setCategorias(Array.isArray(categoriasData) ? categoriasData : []);
        setCursos(Array.isArray(cursosData) ? cursosData : []);
        setMensajesContacto(Array.isArray(mensajesData) ? mensajesData : []);
        setMedios(Array.isArray(mediosData) ? mediosData : []);
        setPaginas(Array.isArray(paginasData) ? paginasData : []);

        const contenidoHome =
        homeData?.contenido && typeof homeData.contenido === "object"
            ? homeData.contenido
            : defaultHomeContent;

        setHomeForm({
        ...defaultHomeContent,
        ...contenidoHome,
        hero: {
            ...defaultHomeContent.hero,
            ...(contenidoHome.hero || {}),
            primaryButton: {
            ...defaultHomeContent.hero.primaryButton,
            ...(contenidoHome.hero?.primaryButton || {}),
            },
            secondaryButton: {
            ...defaultHomeContent.hero.secondaryButton,
            ...(contenidoHome.hero?.secondaryButton || {}),
            },
        },
        benefits: Array.isArray(contenidoHome.benefits)
            ? contenidoHome.benefits
            : defaultHomeContent.benefits,
        featured: {
            ...defaultHomeContent.featured,
            ...(contenidoHome.featured || {}),
        },
        cta: {
            ...defaultHomeContent.cta,
            ...(contenidoHome.cta || {}),
        },
        });

        const contenidoNosotros =
          nosotrosData?.contenido && typeof nosotrosData.contenido === "object"
            ? nosotrosData.contenido
            : defaultNosotrosContent;

        setNosotrosForm({
          ...defaultNosotrosContent,
          ...contenidoNosotros,
          hero: {
            ...defaultNosotrosContent.hero,
            ...(contenidoNosotros.hero || {}),
          },
          about: Array.isArray(contenidoNosotros.about)
            ? contenidoNosotros.about
            : defaultNosotrosContent.about,
          pillars: {
            ...defaultNosotrosContent.pillars,
            ...(contenidoNosotros.pillars || {}),
            items: Array.isArray(contenidoNosotros.pillars?.items)
              ? contenidoNosotros.pillars.items
              : defaultNosotrosContent.pillars.items,
          },
          values: {
            ...defaultNosotrosContent.values,
            ...(contenidoNosotros.values || {}),
            items: Array.isArray(contenidoNosotros.values?.items)
              ? contenidoNosotros.values.items
              : defaultNosotrosContent.values.items,
          },
        });

        const contenidoContacto =
          contactoData?.contenido && typeof contactoData.contenido === "object"
            ? contactoData.contenido
            : defaultContactoContent;

        setContactoForm({
          ...defaultContactoContent,
          ...contenidoContacto,
          hero: {
            ...defaultContactoContent.hero,
            ...(contenidoContacto.hero || {}),
          },
          contactInfo: {
            ...defaultContactoContent.contactInfo,
            ...(contenidoContacto.contactInfo || {}),
            items: Array.isArray(contenidoContacto.contactInfo?.items)
              ? contenidoContacto.contactInfo.items
              : defaultContactoContent.contactInfo.items,
          },
          support: {
            ...defaultContactoContent.support,
            ...(contenidoContacto.support || {}),
            paragraphs: Array.isArray(contenidoContacto.support?.paragraphs)
              ? contenidoContacto.support.paragraphs
              : defaultContactoContent.support.paragraphs,
          },
          form: {
            ...defaultContactoContent.form,
            ...(contenidoContacto.form || {}),
            fields: {
              ...defaultContactoContent.form.fields,
              ...(contenidoContacto.form?.fields || {}),
            },
          },
        });
    } catch (error) {
        console.error("Error cargando gestión web:", error);
        toast.error("Error al cargar la gestión web");
    } finally {
        setCargando(false);
    }
    };

  useEffect(() => {
    cargarDatos();
  }, []);

  const cursosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    if (!texto) return cursos;

    return cursos.filter((curso) => {
      const nombre = (curso.nombrecurso || "").toLowerCase();
      const slug = (curso.slug || "").toLowerCase();
      const categoriaTexto = (curso.categorias || [])
        .map((cat) => cat.nombre)
        .join(" ")
        .toLowerCase();

      return (
        nombre.includes(texto) ||
        slug.includes(texto) ||
        categoriaTexto.includes(texto)
      );
    });
  }, [cursos, busqueda]);

  const categoriasFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    if (!texto) return categorias;

    return categorias.filter((categoria) => {
      const nombre = (categoria.nombre || "").toLowerCase();
      const slug = (categoria.slug || "").toLowerCase();

      return nombre.includes(texto) || slug.includes(texto);
    });
  }, [categorias, busqueda]);

  const abrirCrearCategoria = () => {
    setCategoriaEditar(null);
    setFormCategoria(emptyCategoriaForm);
    setModalCategoria(true);
  };

  const abrirEditarCategoria = (categoria) => {
    setCategoriaEditar(categoria);

    setFormCategoria({
      nombre: categoria.nombre || "",
      slug: categoria.slug || "",
      descripcion: categoria.descripcion || "",
      imagen_url: categoria.imagenUrl || "",
      visible_web: categoria.visibleWeb ?? true,
      estado: categoria.estado ?? true,
      orden: categoria.orden ?? 1,
    });

    setModalCategoria(true);
  };

  const cerrarModalCategoria = () => {
    setCategoriaEditar(null);
    setFormCategoria(emptyCategoriaForm);
    setModalCategoria(false);
  };

  const guardarCategoria = async (e) => {
    e.preventDefault();

    if (!formCategoria.nombre.trim()) {
      toast.error("El nombre de la categoría es obligatorio");
      return;
    }

    try {
      const payload = {
        nombre: formCategoria.nombre.trim(),
        slug: formCategoria.slug.trim(),
        descripcion: formCategoria.descripcion.trim(),
        imagen_url: formCategoria.imagen_url.trim(),
        visible_web: formCategoria.visible_web,
        estado: formCategoria.estado,
        orden: Number(formCategoria.orden || 1),
      };

      if (categoriaEditar) {
        await actualizarCategoriaAdminWeb(categoriaEditar.id, payload);
        toast.success("Categoría actualizada");
      } else {
        await crearCategoriaAdminWeb(payload);
        toast.success("Categoría creada");
      }

      cerrarModalCategoria();
      cargarDatos();
    } catch (error) {
      console.error("Error guardando categoría:", error);
      toast.error(
        error?.response?.data?.message || "No se pudo guardar la categoría"
      );
    }
  };

  const inhabilitarCategoria = async (categoria) => {
    const confirmar = window.confirm(
      `¿Seguro que deseas ocultar la categoría "${categoria.nombre}"?`
    );

    if (!confirmar) return;

    try {
      await eliminarCategoriaAdminWeb(categoria.id);
      toast.success("Categoría ocultada correctamente");
      cargarDatos();
    } catch (error) {
      console.error("Error ocultando categoría:", error);
      toast.error("No se pudo ocultar la categoría");
    }
  };

  const abrirEditarCursoWeb = (curso) => {
    setCursoEditar(curso);

    setFormCurso({
      visible_web: curso.visible_web ?? false,
      destacado_web: curso.destacado_web ?? false,
      slug: curso.slug || "",
      imagen_url: curso.imagen_url || "",
      orden_web: curso.orden_web ?? 1,
      etiqueta_web: curso.etiqueta_web || "Curso",
      resumen_web: curso.resumen_web || "",
      requisitos_web: curso.requisitos_web || "",
      beneficios_texto: Array.isArray(curso.beneficios_web)
        ? curso.beneficios_web.join("\n")
        : "",
      categoriasIds: Array.isArray(curso.categorias)
        ? curso.categorias.map((cat) => cat.id)
        : [],
    });

    setModalCurso(true);
  };

  const cerrarModalCurso = () => {
    setCursoEditar(null);
    setFormCurso(emptyCursoWebForm);
    setModalCurso(false);
  };

  const toggleCategoriaCurso = (idCategoria) => {
    setFormCurso((prev) => {
      const existe = prev.categoriasIds.includes(idCategoria);

      return {
        ...prev,
        categoriasIds: existe
          ? prev.categoriasIds.filter((id) => id !== idCategoria)
          : [...prev.categoriasIds, idCategoria],
      };
    });
  };

  const guardarCursoWeb = async (e) => {
    e.preventDefault();

    if (!cursoEditar) return;

    try {
      const payload = {
        visible_web: formCurso.visible_web,
        destacado_web: formCurso.destacado_web,
        slug: formCurso.slug.trim(),
        imagen_url: formCurso.imagen_url.trim(),
        orden_web: Number(formCurso.orden_web || 1),
        etiqueta_web: formCurso.etiqueta_web.trim() || "Curso",
        resumen_web: formCurso.resumen_web.trim(),
        requisitos_web: formCurso.requisitos_web.trim(),
        beneficios_web: formCurso.beneficios_texto,
      };

      await actualizarCursoWebAdmin(cursoEditar.id, payload);
      await asignarCategoriasCursoWeb(cursoEditar.id, formCurso.categoriasIds);

      toast.success("Configuración web del curso actualizada");
      cerrarModalCurso();
      cargarDatos();
    } catch (error) {
      console.error("Error guardando curso web:", error);
      toast.error(
        error?.response?.data?.message ||
          "No se pudo guardar la configuración del curso"
      );
    }
  };

  const cambiarVisibleCurso = async (curso) => {
    try {
      await actualizarCursoWebAdmin(curso.id, {
        visible_web: !curso.visible_web,
      });

      toast.success(
        !curso.visible_web
          ? "Curso visible en la web"
          : "Curso oculto de la web"
      );

      cargarDatos();
    } catch (error) {
      console.error("Error cambiando visibilidad:", error);
      toast.error("No se pudo cambiar la visibilidad");
    }
  };

  const cambiarDestacadoCurso = async (curso) => {
    try {
      await actualizarCursoWebAdmin(curso.id, {
        destacado_web: !curso.destacado_web,
      });

      toast.success(
        !curso.destacado_web
          ? "Curso marcado como destacado"
          : "Curso quitado de destacados"
      );

      cargarDatos();
    } catch (error) {
      console.error("Error cambiando destacado:", error);
      toast.error("No se pudo cambiar el destacado");
    }
  };

  const actualizarSeccionHome = (seccion, campo, valor) => {
    setHomeForm((prev) => ({
        ...prev,
        [seccion]: {
        ...prev[seccion],
        [campo]: valor,
        },
    }));
    };

    const actualizarBotonHero = (boton, campo, valor) => {
    setHomeForm((prev) => ({
        ...prev,
        hero: {
        ...prev.hero,
        [boton]: {
            ...prev.hero[boton],
            [campo]: valor,
        },
        },
    }));
    };

    const actualizarBeneficio = (index, campo, valor) => {
    setHomeForm((prev) => ({
        ...prev,
        benefits: prev.benefits.map((benefit, i) =>
        i === index ? { ...benefit, [campo]: valor } : benefit
        ),
    }));
    };

    const agregarBeneficio = () => {
    setHomeForm((prev) => ({
        ...prev,
        benefits: [
        ...prev.benefits,
        {
            title: "",
            description: "",
        },
        ],
    }));
    };

    const eliminarBeneficio = (index) => {
    setHomeForm((prev) => ({
        ...prev,
        benefits: prev.benefits.filter((_, i) => i !== index),
    }));
    };

    const guardarContenidoHome = async (e) => {
    e.preventDefault();

    try {
        setGuardandoHome(true);

        await actualizarContenidoAdminWeb("home", homeForm, true);

        toast.success("Contenido del inicio actualizado");
        cargarDatos();
    } catch (error) {
        console.error("Error guardando inicio:", error);
        toast.error(
        error?.response?.data?.message || "No se pudo guardar el contenido"
        );
    } finally {
        setGuardandoHome(false);
    }
    };

    const actualizarNosotrosHero = (campo, valor) => {
      setNosotrosForm((prev) => ({
        ...prev,
        hero: {
          ...prev.hero,
          [campo]: valor,
        },
      }));
    };

    const actualizarAboutItem = (index, campo, valor) => {
      setNosotrosForm((prev) => ({
        ...prev,
        about: prev.about.map((item, i) =>
          i === index ? { ...item, [campo]: valor } : item
        ),
      }));
    };

    const actualizarAboutParagraph = (itemIndex, paragraphIndex, valor) => {
      setNosotrosForm((prev) => ({
        ...prev,
        about: prev.about.map((item, i) =>
          i === itemIndex
            ? {
                ...item,
                paragraphs: item.paragraphs.map((paragraph, pIndex) =>
                  pIndex === paragraphIndex ? valor : paragraph
                ),
              }
            : item
        ),
      }));
    };

    const agregarAboutItem = () => {
      setNosotrosForm((prev) => ({
        ...prev,
        about: [
          ...prev.about,
          {
            title: "",
            paragraphs: [""],
          },
        ],
      }));
    };

    const eliminarAboutItem = (index) => {
      setNosotrosForm((prev) => ({
        ...prev,
        about: prev.about.filter((_, i) => i !== index),
      }));
    };

    const agregarAboutParagraph = (itemIndex) => {
      setNosotrosForm((prev) => ({
        ...prev,
        about: prev.about.map((item, i) =>
          i === itemIndex
            ? {
                ...item,
                paragraphs: [...(item.paragraphs || []), ""],
              }
            : item
        ),
      }));
    };

    const eliminarAboutParagraph = (itemIndex, paragraphIndex) => {
      setNosotrosForm((prev) => ({
        ...prev,
        about: prev.about.map((item, i) =>
          i === itemIndex
            ? {
                ...item,
                paragraphs: item.paragraphs.filter((_, pIndex) => pIndex !== paragraphIndex),
              }
            : item
        ),
      }));
    };

    const actualizarPillars = (campo, valor) => {
      setNosotrosForm((prev) => ({
        ...prev,
        pillars: {
          ...prev.pillars,
          [campo]: valor,
        },
      }));
    };

    const actualizarPillarItem = (index, campo, valor) => {
      setNosotrosForm((prev) => ({
        ...prev,
        pillars: {
          ...prev.pillars,
          items: prev.pillars.items.map((item, i) =>
            i === index ? { ...item, [campo]: valor } : item
          ),
        },
      }));
    };

    const agregarPillarItem = () => {
      setNosotrosForm((prev) => ({
        ...prev,
        pillars: {
          ...prev.pillars,
          items: [
            ...prev.pillars.items,
            {
              title: "",
              description: "",
            },
          ],
        },
      }));
    };

    const eliminarPillarItem = (index) => {
      setNosotrosForm((prev) => ({
        ...prev,
        pillars: {
          ...prev.pillars,
          items: prev.pillars.items.filter((_, i) => i !== index),
        },
      }));
    };

    const actualizarValues = (campo, valor) => {
      setNosotrosForm((prev) => ({
        ...prev,
        values: {
          ...prev.values,
          [campo]: valor,
        },
      }));
    };

    const actualizarValueItem = (index, campo, valor) => {
      setNosotrosForm((prev) => ({
        ...prev,
        values: {
          ...prev.values,
          items: prev.values.items.map((item, i) =>
            i === index ? { ...item, [campo]: valor } : item
          ),
        },
      }));
    };

    const agregarValueItem = () => {
      setNosotrosForm((prev) => ({
        ...prev,
        values: {
          ...prev.values,
          items: [
            ...prev.values.items,
            {
              title: "",
              description: "",
            },
          ],
        },
      }));
    };

    const eliminarValueItem = (index) => {
      setNosotrosForm((prev) => ({
        ...prev,
        values: {
          ...prev.values,
          items: prev.values.items.filter((_, i) => i !== index),
        },
      }));
    };

    const guardarContenidoNosotros = async (e) => {
      e.preventDefault();

      try {
        setGuardandoNosotros(true);

        await actualizarContenidoAdminWeb("nosotros", nosotrosForm, true);

        toast.success("Contenido de Nosotros actualizado");
        cargarDatos();
      } catch (error) {
        console.error("Error guardando Nosotros:", error);
        toast.error(
          error?.response?.data?.message || "No se pudo guardar el contenido"
        );
      } finally {
        setGuardandoNosotros(false);
      }
    };

    const actualizarContactoHero = (campo, valor) => {
      setContactoForm((prev) => ({
        ...prev,
        hero: {
          ...prev.hero,
          [campo]: valor,
        },
      }));
    };

    const actualizarContactoInfo = (campo, valor) => {
      setContactoForm((prev) => ({
        ...prev,
        contactInfo: {
          ...prev.contactInfo,
          [campo]: valor,
        },
      }));
    };

    const actualizarContactoItem = (index, campo, valor) => {
      setContactoForm((prev) => ({
        ...prev,
        contactInfo: {
          ...prev.contactInfo,
          items: prev.contactInfo.items.map((item, i) =>
            i === index ? { ...item, [campo]: valor } : item
          ),
        },
      }));
    };

    const agregarContactoItem = () => {
      setContactoForm((prev) => ({
        ...prev,
        contactInfo: {
          ...prev.contactInfo,
          items: [
            ...prev.contactInfo.items,
            {
              label: "",
              value: "",
            },
          ],
        },
      }));
    };

    const eliminarContactoItem = (index) => {
      setContactoForm((prev) => ({
        ...prev,
        contactInfo: {
          ...prev.contactInfo,
          items: prev.contactInfo.items.filter((_, i) => i !== index),
        },
      }));
    };

    const actualizarContactoSupport = (campo, valor) => {
      setContactoForm((prev) => ({
        ...prev,
        support: {
          ...prev.support,
          [campo]: valor,
        },
      }));
    };

    const actualizarContactoSupportParagraph = (index, valor) => {
      setContactoForm((prev) => ({
        ...prev,
        support: {
          ...prev.support,
          paragraphs: prev.support.paragraphs.map((paragraph, i) =>
            i === index ? valor : paragraph
          ),
        },
      }));
    };

    const agregarContactoSupportParagraph = () => {
      setContactoForm((prev) => ({
        ...prev,
        support: {
          ...prev.support,
          paragraphs: [...prev.support.paragraphs, ""],
        },
      }));
    };

    const eliminarContactoSupportParagraph = (index) => {
      setContactoForm((prev) => ({
        ...prev,
        support: {
          ...prev.support,
          paragraphs: prev.support.paragraphs.filter((_, i) => i !== index),
        },
      }));
    };

    const actualizarContactoForm = (campo, valor) => {
      setContactoForm((prev) => ({
        ...prev,
        form: {
          ...prev.form,
          [campo]: valor,
        },
      }));
    };

    const actualizarContactoFormField = (fieldName, campo, valor) => {
      setContactoForm((prev) => ({
        ...prev,
        form: {
          ...prev.form,
          fields: {
            ...prev.form.fields,
            [fieldName]: {
              ...prev.form.fields[fieldName],
              [campo]: valor,
            },
          },
        },
      }));
    };

    const guardarContenidoContacto = async (e) => {
      e.preventDefault();

      try {
        setGuardandoContacto(true);

        await actualizarContenidoAdminWeb("contacto", contactoForm, true);

        toast.success("Contenido de Contacto actualizado");
        cargarDatos();
      } catch (error) {
        console.error("Error guardando Contacto:", error);
        toast.error(
          error?.response?.data?.message || "No se pudo guardar el contenido"
        );
      } finally {
        setGuardandoContacto(false);
      }
    };

    const mensajesFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return mensajesContacto.filter((mensaje) => {
      const coincideTexto =
        !texto ||
        (mensaje.nombre || "").toLowerCase().includes(texto) ||
        (mensaje.correo || "").toLowerCase().includes(texto) ||
        (mensaje.asunto || "").toLowerCase().includes(texto) ||
        (mensaje.mensaje || "").toLowerCase().includes(texto);

      let coincideFiltro = true;

      if (filtroMensajes === "no_leidos") {
        coincideFiltro = mensaje.leido === false;
      } else if (filtroMensajes === "leidos") {
        coincideFiltro = mensaje.leido === true;
      } else if (filtroMensajes !== "todos") {
        coincideFiltro = mensaje.estado === filtroMensajes;
      }

      return coincideTexto && coincideFiltro;
    });
  }, [mensajesContacto, busqueda, filtroMensajes]);

  const mensajesNoLeidos = mensajesContacto.filter(
    (mensaje) => !mensaje.leido
  ).length;

  const abrirMensajeContacto = async (mensaje) => {
    setMensajeSeleccionado(mensaje);

    if (!mensaje.leido) {
      try {
        await marcarMensajeContactoLeidoAdminWeb(mensaje.id);
        cargarDatos();
      } catch (error) {
        console.error("Error marcando mensaje como leído:", error);
      }
    }
  };

  const cambiarEstadoMensaje = async (id, estado) => {
    try {
      await actualizarEstadoMensajeContactoAdminWeb(id, estado);
      toast.success("Estado del mensaje actualizado");
      setMensajeSeleccionado((prev) =>
        prev && prev.id === id ? { ...prev, estado, leido: true } : prev
      );
      cargarDatos();
    } catch (error) {
      console.error("Error actualizando estado del mensaje:", error);
      toast.error(
        error?.response?.data?.message ||
          "No se pudo actualizar el estado del mensaje"
      );
    }
  };

  const getEstadoMensajeClasses = (estado) => {
    switch (estado) {
      case "RESPONDIDO":
        return "bg-green-100 text-green-700";
      case "EN_REVISION":
        return "bg-blue-100 text-blue-700";
      case "ARCHIVADO":
        return "bg-slate-200 text-slate-700";
      default:
        return "bg-amber-100 text-amber-700";
    }
  };

  const formatearFechaMensaje = (fecha) => {
    if (!fecha) return "Sin fecha";

    return new Date(fecha).toLocaleString("es-PE", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const handleSubirMedio = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    try {
      setSubiendoMedio(true);

      await subirMedioAdminWeb(file, "web");

      toast.success("Imagen subida correctamente");
      cargarDatos();
    } catch (error) {
      console.error("Error subiendo imagen:", error);
      toast.error(
        error?.response?.data?.message || "No se pudo subir la imagen"
      );
    } finally {
      setSubiendoMedio(false);
      e.target.value = "";
    }
  };

  const copiarUrlMedio = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("URL copiada");
    } catch {
      toast.error("No se pudo copiar la URL");
    }
  };

  const eliminarMedio = async (media) => {
    const confirmar = window.confirm(
      `¿Seguro que deseas eliminar la imagen "${media.nombreOriginal}"?`
    );

    if (!confirmar) return;

    try {
      await eliminarMedioAdminWeb(media.id);
      toast.success("Imagen eliminada");
      cargarDatos();
    } catch (error) {
      console.error("Error eliminando imagen:", error);
      toast.error("No se pudo eliminar la imagen");
    }
  };

  const abrirSelectorMedia = (destino, titulo = "Seleccionar imagen") => {
    setMediaPicker({
      abierto: true,
      destino,
      titulo,
    });
  };

  const cerrarSelectorMedia = () => {
    setMediaPicker({
      abierto: false,
      destino: "",
      titulo: "Seleccionar imagen",
    });
  };

  const seleccionarImagenMedia = (media) => {
    const url = media?.archivoUrl;

    if (!url) {
      toast.error("La imagen no tiene URL válida");
      return;
    }

    if (mediaPicker.destino === "homeHeroBackground") {
      setHomeForm((prev) => ({
        ...prev,
        hero: {
          ...prev.hero,
          backgroundImage: url,
        },
      }));
    }

    if (mediaPicker.destino === "categoriaImagen") {
      setFormCategoria((prev) => ({
        ...prev,
        imagen_url: url,
      }));
    }

    if (mediaPicker.destino === "cursoImagen") {
      setFormCurso((prev) => ({
        ...prev,
        imagen_url: url,
      }));
    }

    if (mediaPicker.destino?.startsWith("paginaSeccionImagen:")) {
      const index = Number(mediaPicker.destino.split(":")[1]);

      if (!Number.isNaN(index)) {
        setContenidoPaginaForm((prev) => ({
          ...prev,
          secciones: prev.secciones.map((seccion, i) =>
            i === index
              ? {
                  ...seccion,
                  config: {
                    ...seccion.config,
                    imagenUrl: url,
                  },
                }
              : seccion
          ),
        }));
      }
    }

    toast.success("Imagen seleccionada");
    cerrarSelectorMedia();
  };

  const paginasFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    if (!texto) return paginas;

    return paginas.filter((pagina) => {
      return (
        (pagina.titulo || "").toLowerCase().includes(texto) ||
        (pagina.slug || "").toLowerCase().includes(texto) ||
        (pagina.ruta || "").toLowerCase().includes(texto)
      );
    });
  }, [paginas, busqueda]);

  const abrirCrearPagina = () => {
    setPaginaEditar(null);
    setFormPagina({
      titulo: "",
      slug: "",
      descripcion: "",
      visible_menu: true,
      publicada: true,
      orden: paginas.length + 1,
      seo_title: "",
      seo_description: "",
    });
    setModalPagina(true);
  };

  const abrirEditarPagina = (pagina) => {
    setPaginaEditar(pagina);
    setFormPagina({
      titulo: pagina.titulo || "",
      slug: pagina.slug || "",
      descripcion: pagina.descripcion || "",
      visible_menu: pagina.visible_menu ?? true,
      publicada: pagina.publicada ?? true,
      orden: pagina.orden ?? 1,
      seo_title: pagina.seo_title || "",
      seo_description: pagina.seo_description || "",
    });
    setModalPagina(true);
  };

  const cerrarModalPagina = () => {
    setPaginaEditar(null);
    setModalPagina(false);
  };

  const guardarPagina = async (e) => {
    e.preventDefault();

    if (!formPagina.titulo.trim()) {
      toast.error("El título de la página es obligatorio");
      return;
    }

    try {
      const payload = {
        titulo: formPagina.titulo.trim(),
        slug: formPagina.slug.trim(),
        descripcion: formPagina.descripcion.trim(),
        visible_menu: formPagina.visible_menu,
        publicada: formPagina.publicada,
        orden: Number(formPagina.orden || 1),
        seo_title: formPagina.seo_title.trim(),
        seo_description: formPagina.seo_description.trim(),
      };

      if (paginaEditar) {
        await actualizarPaginaAdminWeb(paginaEditar.id, payload);
        toast.success("Página actualizada");
      } else {
        await crearPaginaAdminWeb({
          ...payload,
          contenido: {
            secciones: [],
          },
        });
        toast.success("Página creada");
      }

      cerrarModalPagina();
      cargarDatos();
    } catch (error) {
      console.error("Error guardando página:", error);
      toast.error(error?.response?.data?.message || "No se pudo guardar la página");
    }
  };

  const eliminarPagina = async (pagina) => {
    const confirmar = window.confirm(
      `¿Seguro que deseas eliminar u ocultar la página "${pagina.titulo}"?`
    );

    if (!confirmar) return;

    try {
      await eliminarPaginaAdminWeb(pagina.id);
      toast.success(
        pagina.protegida
          ? "Página protegida ocultada del menú"
          : "Página eliminada correctamente"
      );
      cargarDatos();
    } catch (error) {
      console.error("Error eliminando página:", error);
      toast.error(error?.response?.data?.message || "No se pudo eliminar la página");
    }
  };

  const cambiarVisibilidadMenuPagina = async (pagina) => {
    try {
      await actualizarPaginaAdminWeb(pagina.id, {
        visible_menu: !pagina.visible_menu,
      });

      toast.success(
        !pagina.visible_menu
          ? "Página visible en el menú"
          : "Página oculta del menú"
      );

      cargarDatos();
    } catch (error) {
      console.error("Error cambiando visibilidad:", error);
      toast.error("No se pudo cambiar la visibilidad");
    }
  };

  const cambiarPublicacionPagina = async (pagina) => {
    try {
      await actualizarPaginaAdminWeb(pagina.id, {
        publicada: !pagina.publicada,
      });

      toast.success(
        !pagina.publicada ? "Página publicada" : "Página despublicada"
      );

      cargarDatos();
    } catch (error) {
      console.error("Error cambiando publicación:", error);
      toast.error("No se pudo cambiar la publicación");
    }
  };

  const crearSeccionBase = (tipo) => {
    const base = {
      id: `${tipo}-${Date.now()}`,
      tipo,
      activo: true,
      orden: (contenidoPaginaForm.secciones?.length || 0) + 1,
      config: {},
    };

    if (tipo === "texto") {
      return {
        ...base,
        config: {
          titulo: "Título de sección",
          descripcion: "Escribe aquí el contenido de esta sección.",
        },
      };
    }

    if (tipo === "imagen_texto") {
      return {
        ...base,
        config: {
          titulo: "Título con imagen",
          descripcion: "Describe esta sección.",
          imagenUrl: "",
          posicionImagen: "derecha",
        },
      };
    }

    if (tipo === "faq") {
      return {
        ...base,
        config: {
          titulo: "Preguntas frecuentes",
          items: [
            {
              pregunta: "¿Cuál es la pregunta?",
              respuesta: "Escribe aquí la respuesta.",
            },
          ],
        },
      };
    }

    return base;
  };

  const abrirEditorContenidoPagina = (pagina) => {
    setPaginaContenidoEditar(pagina);

    const contenido =
      pagina.contenido && typeof pagina.contenido === "object"
        ? pagina.contenido
        : { secciones: [] };

    setContenidoPaginaForm({
      secciones: Array.isArray(contenido.secciones)
        ? contenido.secciones
        : [],
    });

    setModalContenidoPagina(true);
  };

  const cerrarEditorContenidoPagina = () => {
    setPaginaContenidoEditar(null);
    setContenidoPaginaForm({ secciones: [] });
    setModalContenidoPagina(false);
  };

  const agregarSeccionPagina = (tipo) => {
    setContenidoPaginaForm((prev) => ({
      ...prev,
      secciones: [...(prev.secciones || []), crearSeccionBase(tipo)],
    }));
  };

  const actualizarSeccionConfig = (index, campo, valor) => {
    setContenidoPaginaForm((prev) => ({
      ...prev,
      secciones: prev.secciones.map((seccion, i) =>
        i === index
          ? {
              ...seccion,
              config: {
                ...seccion.config,
                [campo]: valor,
              },
            }
          : seccion
      ),
    }));
  };

  const toggleSeccionActiva = (index) => {
    setContenidoPaginaForm((prev) => ({
      ...prev,
      secciones: prev.secciones.map((seccion, i) =>
        i === index
          ? {
              ...seccion,
              activo: seccion.activo === false,
            }
          : seccion
      ),
    }));
  };

  const eliminarSeccionPagina = (index) => {
    const confirmar = window.confirm("¿Eliminar esta sección?");

    if (!confirmar) return;

    setContenidoPaginaForm((prev) => ({
      ...prev,
      secciones: prev.secciones
        .filter((_, i) => i !== index)
        .map((seccion, i) => ({
          ...seccion,
          orden: i + 1,
        })),
    }));
  };

  const moverSeccionPagina = (index, direccion) => {
    setContenidoPaginaForm((prev) => {
      const secciones = [...prev.secciones];
      const nuevoIndex = direccion === "arriba" ? index - 1 : index + 1;

      if (nuevoIndex < 0 || nuevoIndex >= secciones.length) {
        return prev;
      }

      const actual = secciones[index];
      secciones[index] = secciones[nuevoIndex];
      secciones[nuevoIndex] = actual;

      return {
        ...prev,
        secciones: secciones.map((seccion, i) => ({
          ...seccion,
          orden: i + 1,
        })),
      };
    });
  };

  const actualizarFaqItem = (sectionIndex, itemIndex, campo, valor) => {
    setContenidoPaginaForm((prev) => ({
      ...prev,
      secciones: prev.secciones.map((seccion, i) =>
        i === sectionIndex
          ? {
              ...seccion,
              config: {
                ...seccion.config,
                items: (seccion.config.items || []).map((item, idx) =>
                  idx === itemIndex ? { ...item, [campo]: valor } : item
                ),
              },
            }
          : seccion
      ),
    }));
  };

  const agregarFaqItem = (sectionIndex) => {
    setContenidoPaginaForm((prev) => ({
      ...prev,
      secciones: prev.secciones.map((seccion, i) =>
        i === sectionIndex
          ? {
              ...seccion,
              config: {
                ...seccion.config,
                items: [
                  ...(seccion.config.items || []),
                  {
                    pregunta: "",
                    respuesta: "",
                  },
                ],
              },
            }
          : seccion
      ),
    }));
  };

  const eliminarFaqItem = (sectionIndex, itemIndex) => {
    setContenidoPaginaForm((prev) => ({
      ...prev,
      secciones: prev.secciones.map((seccion, i) =>
        i === sectionIndex
          ? {
              ...seccion,
              config: {
                ...seccion.config,
                items: (seccion.config.items || []).filter(
                  (_, idx) => idx !== itemIndex
                ),
              },
            }
          : seccion
      ),
    }));
  };

  const guardarContenidoPagina = async () => {
    if (!paginaContenidoEditar) return;

    try {
      await actualizarPaginaAdminWeb(paginaContenidoEditar.id, {
        contenido: contenidoPaginaForm,
      });

      toast.success("Contenido de la página actualizado");
      cerrarEditorContenidoPagina();
      cargarDatos();
    } catch (error) {
      console.error("Error guardando contenido de página:", error);
      toast.error(
        error?.response?.data?.message ||
          "No se pudo guardar el contenido de la página"
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 space-y-8">
      <section className="rounded-2xl bg-gradient-to-r from-slate-900 to-blue-900 p-8 text-white shadow">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-sky-200">
              <Globe2 size={18} />
              Editor del sitio público
            </div>

            <h1 className="text-3xl font-bold">Gestión web</h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-200">
              Administra los cursos que aparecen en la web pública, sus
              categorías, imágenes, textos, destacados y visibilidad.
            </p>
          </div>

          <button
            onClick={abrirCrearCategoria}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-blue-800 transition hover:bg-slate-100"
          >
            <Plus size={20} />
            Nueva categoría
          </button>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setTab("inicio")}
              className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition ${
                  tab === "inicio"
                  ? "bg-blue-600 text-white shadow"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
              >
              <Home size={18} />
              Inicio
              </button>
              <button
                type="button"
                onClick={() => setTab("nosotros")}
                className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition ${
                  tab === "nosotros"
                    ? "bg-blue-600 text-white shadow"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <Users size={18} />
                Nosotros
              </button>
            <button
              type="button"
              onClick={() => setTab("cursos")}
              className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition ${
                tab === "cursos"
                  ? "bg-blue-600 text-white shadow"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <BookOpen size={18} />
              Cursos web
            </button>

            <button
              type="button"
              onClick={() => setTab("categorias")}
              className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition ${
                tab === "categorias"
                  ? "bg-blue-600 text-white shadow"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <FolderOpen size={18} />
              Categorías
            </button>

            <button
              type="button"
              onClick={() => setTab("contacto")}
              className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition ${
                tab === "contacto"
                  ? "bg-blue-600 text-white shadow"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <Mail size={18} />
              Contacto
            </button>

            <button
              type="button"
              onClick={() => setTab("mensajes")}
              className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition ${
                tab === "mensajes"
                  ? "bg-blue-600 text-white shadow"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <Inbox size={18} />
              Mensajes
              {mensajesNoLeidos > 0 && (
                <span className="ml-1 rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
                  {mensajesNoLeidos}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setTab("medios")}
              className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition ${
                tab === "medios"
                  ? "bg-blue-600 text-white shadow"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <ImageIcon size={18} />
              Medios
            </button>
            <button
              type="button"
              onClick={() => setTab("paginas")}
              className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition ${
                tab === "paginas"
                  ? "bg-blue-600 text-white shadow"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <Globe2 size={18} />
              Páginas
            </button>
          </div>

          <div className="relative w-full max-w-md">
            <Search
              size={19}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder={
                tab === "cursos"
                  ? "Buscar curso o categoría..."
                  : "Buscar categoría..."
              }
              className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>
        </div>
      </section>

      {cargando ? (
        <div className="rounded-2xl bg-white p-10 text-center font-semibold text-slate-600 shadow-sm ring-1 ring-slate-200">
          Cargando información...
        </div>
        ) : tab === "inicio" ? (
            <form
                onSubmit={guardarContenidoHome}
                className="space-y-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
            >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                    Contenido del Inicio
                    </h2>
                    <p className="text-sm text-slate-500">
                    Edita el hero, beneficios, cursos destacados y CTA final de la página principal.
                    </p>
                </div>

                <button
                    type="submit"
                    disabled={guardandoHome}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                >
                    <Save size={18} />
                    {guardandoHome ? "Guardando..." : "Guardar inicio"}
                </button>
                </div>

                <section className="rounded-2xl border border-slate-200 p-5">
                <div className="mb-5 flex items-center gap-2">
                    <Home size={20} className="text-blue-600" />
                    <h3 className="text-lg font-bold text-slate-900">Hero principal</h3>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                    <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Etiqueta superior
                    </label>
                    <input
                        value={homeForm.hero.tag}
                        onChange={(e) =>
                        actualizarSeccionHome("hero", "tag", e.target.value)
                        }
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        placeholder="Formación profesional"
                    />
                    </div>

                    <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Imagen de fondo URL
                    </label>
                    <div className="space-y-3">
                      <input
                        value={homeForm.hero.backgroundImage}
                        onChange={(e) =>
                          actualizarSeccionHome("hero", "backgroundImage", e.target.value)
                        }
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        placeholder="https://..."
                      />

                      <button
                        type="button"
                        onClick={() =>
                          abrirSelectorMedia("homeHeroBackground", "Seleccionar imagen del Home")
                        }
                        className="w-full rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                      >
                        Seleccionar desde biblioteca
                      </button>

                      {homeForm.hero.backgroundImage && (
                        <img
                          src={homeForm.hero.backgroundImage}
                          alt="Vista previa del fondo"
                          className="h-32 w-full rounded-xl object-cover"
                        />
                      )}
                    </div>
                    </div>

                    <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Título principal
                    </label>
                    <input
                        value={homeForm.hero.title}
                        onChange={(e) =>
                        actualizarSeccionHome("hero", "title", e.target.value)
                        }
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        placeholder="Título del inicio"
                    />
                    </div>

                    <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Descripción
                    </label>
                    <textarea
                        rows="4"
                        value={homeForm.hero.description}
                        onChange={(e) =>
                        actualizarSeccionHome("hero", "description", e.target.value)
                        }
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        placeholder="Descripción del hero..."
                    />
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4">
                    <h4 className="mb-3 font-bold text-slate-800">Botón principal</h4>

                    <div className="space-y-3">
                        <input
                        value={homeForm.hero.primaryButton.text}
                        onChange={(e) =>
                            actualizarBotonHero("primaryButton", "text", e.target.value)
                        }
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        placeholder="Texto del botón"
                        />

                        <input
                        value={homeForm.hero.primaryButton.to}
                        onChange={(e) =>
                            actualizarBotonHero("primaryButton", "to", e.target.value)
                        }
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        placeholder="/web/cursos"
                        />
                    </div>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4">
                    <h4 className="mb-3 font-bold text-slate-800">Botón secundario</h4>

                    <div className="space-y-3">
                        <input
                        value={homeForm.hero.secondaryButton.text}
                        onChange={(e) =>
                            actualizarBotonHero("secondaryButton", "text", e.target.value)
                        }
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        placeholder="Texto del botón"
                        />

                        <input
                        value={homeForm.hero.secondaryButton.to}
                        onChange={(e) =>
                            actualizarBotonHero("secondaryButton", "to", e.target.value)
                        }
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        placeholder="/web/nosotros"
                        />
                    </div>
                    </div>
                </div>
                </section>

                <section className="rounded-2xl border border-slate-200 p-5">
                <div className="mb-5 flex items-center justify-between gap-3">
                    <div>
                    <h3 className="text-lg font-bold text-slate-900">Beneficios</h3>
                    <p className="text-sm text-slate-500">
                        Estos aparecen debajo del hero principal.
                    </p>
                    </div>

                    <button
                    type="button"
                    onClick={agregarBeneficio}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
                    >
                    <Plus size={17} />
                    Agregar
                    </button>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    {homeForm.benefits.map((benefit, index) => (
                    <div
                        key={index}
                        className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"
                    >
                        <div className="mb-3 flex items-center justify-between gap-3">
                        <h4 className="font-bold text-slate-800">
                            Beneficio {index + 1}
                        </h4>

                        {homeForm.benefits.length > 1 && (
                            <button
                            type="button"
                            onClick={() => eliminarBeneficio(index)}
                            className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                            >
                            <Trash2 size={16} />
                            </button>
                        )}
                        </div>

                        <input
                        value={benefit.title}
                        onChange={(e) =>
                            actualizarBeneficio(index, "title", e.target.value)
                        }
                        className="mb-3 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        placeholder="Título"
                        />

                        <textarea
                        rows="4"
                        value={benefit.description}
                        onChange={(e) =>
                            actualizarBeneficio(index, "description", e.target.value)
                        }
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        placeholder="Descripción"
                        />
                    </div>
                    ))}
                </div>
                </section>

                <section className="rounded-2xl border border-slate-200 p-5">
                <div className="mb-5 flex items-center gap-2">
                    <BookOpen size={20} className="text-blue-600" />
                    <h3 className="text-lg font-bold text-slate-900">
                    Sección cursos destacados
                    </h3>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                    <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Etiqueta
                    </label>
                    <input
                        value={homeForm.featured.tag}
                        onChange={(e) =>
                        actualizarSeccionHome("featured", "tag", e.target.value)
                        }
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                    </div>

                    <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Título
                    </label>
                    <input
                        value={homeForm.featured.title}
                        onChange={(e) =>
                        actualizarSeccionHome("featured", "title", e.target.value)
                        }
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                    </div>

                    <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Descripción
                    </label>
                    <textarea
                        rows="3"
                        value={homeForm.featured.description}
                        onChange={(e) =>
                        actualizarSeccionHome("featured", "description", e.target.value)
                        }
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                    </div>
                </div>
                </section>

                <section className="rounded-2xl border border-slate-200 p-5">
                <div className="mb-5 flex items-center gap-2">
                    <Image size={20} className="text-blue-600" />
                    <h3 className="text-lg font-bold text-slate-900">CTA final</h3>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                    <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Título
                    </label>
                    <input
                        value={homeForm.cta.title}
                        onChange={(e) =>
                        actualizarSeccionHome("cta", "title", e.target.value)
                        }
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                    </div>

                    <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Descripción
                    </label>
                    <textarea
                        rows="3"
                        value={homeForm.cta.description}
                        onChange={(e) =>
                        actualizarSeccionHome("cta", "description", e.target.value)
                        }
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                    </div>

                    <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Texto del botón
                    </label>
                    <input
                        value={homeForm.cta.buttonText}
                        onChange={(e) =>
                        actualizarSeccionHome("cta", "buttonText", e.target.value)
                        }
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                    </div>

                    <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Ruta del botón
                    </label>
                    <input
                        value={homeForm.cta.buttonTo}
                        onChange={(e) =>
                        actualizarSeccionHome("cta", "buttonTo", e.target.value)
                        }
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        placeholder="/web/cursos"
                    />
                    </div>
                </div>
                </section>

                <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={guardandoHome}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                >
                    <Save size={18} />
                    {guardandoHome ? "Guardando..." : "Guardar inicio"}
                </button>
                </div>
            </form>

            ) : tab === "nosotros" ? (
              <form
                onSubmit={guardarContenidoNosotros}
                className="space-y-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                      Contenido de Nosotros
                    </h2>
                    <p className="text-sm text-slate-500">
                      Edita el hero, descripción institucional, misión, visión y valores.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={guardandoNosotros}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                  >
                    <Save size={18} />
                    {guardandoNosotros ? "Guardando..." : "Guardar Nosotros"}
                  </button>
                </div>

                <section className="rounded-2xl border border-slate-200 p-5">
                  <div className="mb-5 flex items-center gap-2">
                    <Users size={20} className="text-blue-600" />
                    <h3 className="text-lg font-bold text-slate-900">Hero de Nosotros</h3>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Etiqueta
                      </label>
                      <input
                        value={nosotrosForm.hero.tag}
                        onChange={(e) => actualizarNosotrosHero("tag", e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        placeholder="Sobre nosotros"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Título
                      </label>
                      <input
                        value={nosotrosForm.hero.title}
                        onChange={(e) => actualizarNosotrosHero("title", e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        placeholder="Título principal"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Descripción
                      </label>
                      <textarea
                        rows="4"
                        value={nosotrosForm.hero.description}
                        onChange={(e) =>
                          actualizarNosotrosHero("description", e.target.value)
                        }
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        placeholder="Descripción principal..."
                      />
                    </div>
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200 p-5">
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        Bloques institucionales
                      </h3>
                      <p className="text-sm text-slate-500">
                        Por ejemplo: Quiénes somos, propósito, historia, enfoque, etc.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={agregarAboutItem}
                      className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
                    >
                      <Plus size={17} />
                      Agregar bloque
                    </button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {nosotrosForm.about.map((item, index) => (
                      <div
                        key={index}
                        className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"
                      >
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <h4 className="font-bold text-slate-800">Bloque {index + 1}</h4>

                          {nosotrosForm.about.length > 1 && (
                            <button
                              type="button"
                              onClick={() => eliminarAboutItem(index)}
                              className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>

                        <input
                          value={item.title}
                          onChange={(e) =>
                            actualizarAboutItem(index, "title", e.target.value)
                          }
                          className="mb-3 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                          placeholder="Título del bloque"
                        />

                        <div className="space-y-3">
                          {(item.paragraphs || []).map((paragraph, paragraphIndex) => (
                            <div key={paragraphIndex} className="flex gap-2">
                              <textarea
                                rows="3"
                                value={paragraph}
                                onChange={(e) =>
                                  actualizarAboutParagraph(
                                    index,
                                    paragraphIndex,
                                    e.target.value
                                  )
                                }
                                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                placeholder="Párrafo..."
                              />

                              {item.paragraphs.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    eliminarAboutParagraph(index, paragraphIndex)
                                  }
                                  className="h-fit rounded-xl bg-red-50 p-3 text-red-600 hover:bg-red-100"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => agregarAboutParagraph(index)}
                          className="mt-3 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
                        >
                          + Agregar párrafo
                        </button>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200 p-5">
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Misión y visión</h3>
                      <p className="text-sm text-slate-500">
                        Edita los pilares principales de la institución.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={agregarPillarItem}
                      className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
                    >
                      <Plus size={17} />
                      Agregar pilar
                    </button>
                  </div>

                  <div className="mb-5 grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Etiqueta
                      </label>
                      <input
                        value={nosotrosForm.pillars.tag}
                        onChange={(e) => actualizarPillars("tag", e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Título de sección
                      </label>
                      <input
                        value={nosotrosForm.pillars.title}
                        onChange={(e) => actualizarPillars("title", e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {nosotrosForm.pillars.items.map((item, index) => (
                      <div
                        key={index}
                        className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"
                      >
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <h4 className="font-bold text-slate-800">Pilar {index + 1}</h4>

                          {nosotrosForm.pillars.items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => eliminarPillarItem(index)}
                              className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>

                        <input
                          value={item.title}
                          onChange={(e) =>
                            actualizarPillarItem(index, "title", e.target.value)
                          }
                          className="mb-3 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                          placeholder="Misión"
                        />

                        <textarea
                          rows="4"
                          value={item.description}
                          onChange={(e) =>
                            actualizarPillarItem(index, "description", e.target.value)
                          }
                          className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                          placeholder="Descripción..."
                        />
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200 p-5">
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Valores</h3>
                      <p className="text-sm text-slate-500">
                        Edita los valores que aparecen al final de la página.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={agregarValueItem}
                      className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
                    >
                      <Plus size={17} />
                      Agregar valor
                    </button>
                  </div>

                  <div className="mb-5 grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Etiqueta
                      </label>
                      <input
                        value={nosotrosForm.values.tag}
                        onChange={(e) => actualizarValues("tag", e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Título de sección
                      </label>
                      <input
                        value={nosotrosForm.values.title}
                        onChange={(e) => actualizarValues("title", e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    {nosotrosForm.values.items.map((item, index) => (
                      <div
                        key={index}
                        className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"
                      >
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <h4 className="font-bold text-slate-800">Valor {index + 1}</h4>

                          {nosotrosForm.values.items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => eliminarValueItem(index)}
                              className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>

                        <input
                          value={item.title}
                          onChange={(e) =>
                            actualizarValueItem(index, "title", e.target.value)
                          }
                          className="mb-3 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                          placeholder="Compromiso"
                        />

                        <textarea
                          rows="4"
                          value={item.description}
                          onChange={(e) =>
                            actualizarValueItem(index, "description", e.target.value)
                          }
                          className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                          placeholder="Descripción..."
                        />
                      </div>
                    ))}
                  </div>
                </section>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={guardandoNosotros}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                  >
                    <Save size={18} />
                    {guardandoNosotros ? "Guardando..." : "Guardar Nosotros"}
                  </button>
                </div>
              </form>

              ) : tab === "contacto" ? (
                <form
                  onSubmit={guardarContenidoContacto}
                  className="space-y-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">
                        Contenido de Contacto
                      </h2>
                      <p className="text-sm text-slate-500">
                        Edita el hero, datos de contacto, soporte y textos del formulario.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={guardandoContacto}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                    >
                      <Save size={18} />
                      {guardandoContacto ? "Guardando..." : "Guardar Contacto"}
                    </button>
                  </div>

                  <section className="rounded-2xl border border-slate-200 p-5">
                    <div className="mb-5 flex items-center gap-2">
                      <Mail size={20} className="text-blue-600" />
                      <h3 className="text-lg font-bold text-slate-900">Hero de Contacto</h3>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          Etiqueta
                        </label>
                        <input
                          value={contactoForm.hero.tag}
                          onChange={(e) => actualizarContactoHero("tag", e.target.value)}
                          className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                          placeholder="Contacto"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          Título
                        </label>
                        <input
                          value={contactoForm.hero.title}
                          onChange={(e) => actualizarContactoHero("title", e.target.value)}
                          className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                          placeholder="Estamos aquí para ayudarte"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          Descripción
                        </label>
                        <textarea
                          rows="4"
                          value={contactoForm.hero.description}
                          onChange={(e) =>
                            actualizarContactoHero("description", e.target.value)
                          }
                          className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                          placeholder="Descripción principal..."
                        />
                      </div>
                    </div>
                  </section>

                  <section className="rounded-2xl border border-slate-200 p-5">
                    <div className="mb-5 flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">
                          Información de contacto
                        </h3>
                        <p className="text-sm text-slate-500">
                          Agrega correo, teléfono, dirección, horario u otros datos.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={agregarContactoItem}
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
                      >
                        <Plus size={17} />
                        Agregar dato
                      </button>
                    </div>

                    <div className="mb-5">
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Título de sección
                      </label>
                      <input
                        value={contactoForm.contactInfo.title}
                        onChange={(e) => actualizarContactoInfo("title", e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        placeholder="Información de contacto"
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      {contactoForm.contactInfo.items.map((item, index) => (
                        <div
                          key={index}
                          className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"
                        >
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <h4 className="font-bold text-slate-800">Dato {index + 1}</h4>

                            {contactoForm.contactInfo.items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => eliminarContactoItem(index)}
                                className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>

                          <input
                            value={item.label}
                            onChange={(e) =>
                              actualizarContactoItem(index, "label", e.target.value)
                            }
                            className="mb-3 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                            placeholder="Correo"
                          />

                          <input
                            value={item.value}
                            onChange={(e) =>
                              actualizarContactoItem(index, "value", e.target.value)
                            }
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                            placeholder="contacto@conit.com"
                          />
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="rounded-2xl border border-slate-200 p-5">
                    <div className="mb-5 flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">
                          Soporte académico
                        </h3>
                        <p className="text-sm text-slate-500">
                          Edita los textos informativos que aparecen al costado.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={agregarContactoSupportParagraph}
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
                      >
                        <Plus size={17} />
                        Agregar párrafo
                      </button>
                    </div>

                    <div className="mb-5">
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Título de soporte
                      </label>
                      <input
                        value={contactoForm.support.title}
                        onChange={(e) => actualizarContactoSupport("title", e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        placeholder="Soporte académico"
                      />
                    </div>

                    <div className="space-y-3">
                      {contactoForm.support.paragraphs.map((paragraph, index) => (
                        <div key={index} className="flex gap-2">
                          <textarea
                            rows="3"
                            value={paragraph}
                            onChange={(e) =>
                              actualizarContactoSupportParagraph(index, e.target.value)
                            }
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                            placeholder="Párrafo de soporte..."
                          />

                          {contactoForm.support.paragraphs.length > 1 && (
                            <button
                              type="button"
                              onClick={() => eliminarContactoSupportParagraph(index)}
                              className="h-fit rounded-xl bg-red-50 p-3 text-red-600 hover:bg-red-100"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="rounded-2xl border border-slate-200 p-5">
                    <div className="mb-5 flex items-center gap-2">
                      <Edit2 size={20} className="text-blue-600" />
                      <h3 className="text-lg font-bold text-slate-900">
                        Textos del formulario
                      </h3>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          Etiqueta superior
                        </label>
                        <input
                          value={contactoForm.form.tag}
                          onChange={(e) => actualizarContactoForm("tag", e.target.value)}
                          className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                          placeholder="Escríbenos"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          Título del formulario
                        </label>
                        <input
                          value={contactoForm.form.title}
                          onChange={(e) => actualizarContactoForm("title", e.target.value)}
                          className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                          placeholder="Envíanos un mensaje"
                        />
                      </div>

                      {["nombre", "correo", "asunto", "mensaje"].map((fieldName) => (
                        <div
                          key={fieldName}
                          className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"
                        >
                          <h4 className="mb-3 font-bold capitalize text-slate-800">
                            Campo: {fieldName}
                          </h4>

                          <input
                            value={contactoForm.form.fields[fieldName]?.label || ""}
                            onChange={(e) =>
                              actualizarContactoFormField(
                                fieldName,
                                "label",
                                e.target.value
                              )
                            }
                            className="mb-3 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                            placeholder="Label"
                          />

                          <input
                            value={contactoForm.form.fields[fieldName]?.placeholder || ""}
                            onChange={(e) =>
                              actualizarContactoFormField(
                                fieldName,
                                "placeholder",
                                e.target.value
                              )
                            }
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                            placeholder="Placeholder"
                          />
                        </div>
                      ))}

                      <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          Texto del botón
                        </label>
                        <input
                          value={contactoForm.form.buttonText}
                          onChange={(e) =>
                            actualizarContactoForm("buttonText", e.target.value)
                          }
                          className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                          placeholder="Enviar mensaje"
                        />
                      </div>
                    </div>
                  </section>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={guardandoContacto}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                    >
                      <Save size={18} />
                      {guardandoContacto ? "Guardando..." : "Guardar Contacto"}
                    </button>
                  </div>
                </form>

                ) : tab === "mensajes" ? (
                  <section className="space-y-6">
                    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                          <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
                            <Inbox size={24} className="text-blue-600" />
                            Bandeja de mensajes
                          </h2>
                          <p className="mt-1 text-sm text-slate-500">
                            Revisa los mensajes enviados desde el formulario de contacto.
                          </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                          <select
                            value={filtroMensajes}
                            onChange={(e) => setFiltroMensajes(e.target.value)}
                            className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                          >
                            <option value="todos">Todos</option>
                            <option value="no_leidos">No leídos</option>
                            <option value="leidos">Leídos</option>
                            <option value="PENDIENTE">Pendientes</option>
                            <option value="EN_REVISION">En revisión</option>
                            <option value="RESPONDIDO">Respondidos</option>
                            <option value="ARCHIVADO">Archivados</option>
                          </select>

                          <button
                            type="button"
                            onClick={cargarDatos}
                            className="rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                          >
                            Actualizar
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
                      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <h3 className="font-bold text-slate-900">
                            {mensajesFiltrados.length} mensaje(s)
                          </h3>

                          {mensajesNoLeidos > 0 && (
                            <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                              {mensajesNoLeidos} sin leer
                            </span>
                          )}
                        </div>

                        <div className="space-y-3">
                          {mensajesFiltrados.length === 0 ? (
                            <div className="rounded-2xl bg-slate-50 p-8 text-center text-sm font-medium text-slate-500">
                              No se encontraron mensajes.
                            </div>
                          ) : (
                            mensajesFiltrados.map((mensaje) => (
                              <button
                                key={mensaje.id}
                                type="button"
                                onClick={() => abrirMensajeContacto(mensaje)}
                                className={`w-full rounded-2xl border p-4 text-left transition hover:border-blue-300 hover:bg-blue-50/50 ${
                                  mensajeSeleccionado?.id === mensaje.id
                                    ? "border-blue-400 bg-blue-50"
                                    : mensaje.leido
                                    ? "border-slate-200 bg-white"
                                    : "border-amber-200 bg-amber-50"
                                }`}
                              >
                                <div className="mb-2 flex items-start justify-between gap-3">
                                  <div className="flex items-center gap-2">
                                    {mensaje.leido ? (
                                      <MailOpen size={18} className="text-slate-400" />
                                    ) : (
                                      <Mail size={18} className="text-amber-600" />
                                    )}

                                    <p className="font-bold text-slate-900">
                                      {mensaje.nombre}
                                    </p>
                                  </div>

                                  <span
                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${getEstadoMensajeClasses(
                                      mensaje.estado
                                    )}`}
                                  >
                                    {mensaje.estado}
                                  </span>
                                </div>

                                <p className="text-sm font-medium text-slate-600">
                                  {mensaje.asunto}
                                </p>

                                <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                                  {mensaje.mensaje}
                                </p>

                                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                                  <span>{mensaje.correo}</span>
                                  <span>{formatearFechaMensaje(mensaje.created_at)}</span>
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      </section>

                      <aside className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                        {!mensajeSeleccionado ? (
                          <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
                            <MessageSquare size={44} className="mb-4 text-slate-300" />
                            <h3 className="text-xl font-bold text-slate-900">
                              Selecciona un mensaje
                            </h3>
                            <p className="mt-2 max-w-sm text-sm text-slate-500">
                              Haz clic en un mensaje de la bandeja para revisar su contenido.
                            </p>
                          </div>
                        ) : (
                          <div>
                            <div className="mb-5 flex items-start justify-between gap-3">
                              <div>
                                <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                                  <Clock size={14} />
                                  {formatearFechaMensaje(mensajeSeleccionado.created_at)}
                                </p>

                                <h3 className="text-2xl font-bold text-slate-900">
                                  {mensajeSeleccionado.asunto}
                                </h3>
                              </div>

                              <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${getEstadoMensajeClasses(
                                  mensajeSeleccionado.estado
                                )}`}
                              >
                                {mensajeSeleccionado.estado}
                              </span>
                            </div>

                            <div className="mb-5 rounded-2xl bg-slate-50 p-4">
                              <p className="text-sm text-slate-500">Nombre</p>
                              <p className="font-bold text-slate-900">
                                {mensajeSeleccionado.nombre}
                              </p>

                              <p className="mt-3 text-sm text-slate-500">Correo</p>
                              <a
                                href={`mailto:${mensajeSeleccionado.correo}`}
                                className="font-bold text-blue-600 hover:underline"
                              >
                                {mensajeSeleccionado.correo}
                              </a>
                            </div>

                            <div className="mb-6">
                              <p className="mb-2 text-sm font-semibold text-slate-700">
                                Mensaje
                              </p>
                              <div className="whitespace-pre-line rounded-2xl border border-slate-200 bg-white p-4 leading-7 text-slate-700">
                                {mensajeSeleccionado.mensaje}
                              </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                              <button
                                type="button"
                                onClick={() =>
                                  cambiarEstadoMensaje(mensajeSeleccionado.id, "EN_REVISION")
                                }
                                className="rounded-xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                              >
                                En revisión
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  cambiarEstadoMensaje(mensajeSeleccionado.id, "RESPONDIDO")
                                }
                                className="rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700 transition hover:bg-green-100"
                              >
                                Respondido
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  cambiarEstadoMensaje(mensajeSeleccionado.id, "PENDIENTE")
                                }
                                className="rounded-xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
                              >
                                Pendiente
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  cambiarEstadoMensaje(mensajeSeleccionado.id, "ARCHIVADO")
                                }
                                className="rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                              >
                                Archivar
                              </button>
                            </div>

                            <a
                              href={`mailto:${mensajeSeleccionado.correo}?subject=Re: ${mensajeSeleccionado.asunto}`}
                              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
                            >
                              <Mail size={18} />
                              Responder por correo
                            </a>
                          </div>
                        )}
                      </aside>
                    </div>
                  </section>
                  
                  ) : tab === "medios" ? (
                    <section className="space-y-6">
                      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                          <div>
                            <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
                              <ImageIcon size={24} className="text-blue-600" />
                              Biblioteca de medios
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                              Sube imágenes para usarlas en el sitio web público.
                            </p>
                          </div>

                          <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700">
                            <Upload size={18} />
                            {subiendoMedio ? "Subiendo..." : "Subir imagen"}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleSubirMedio}
                              disabled={subiendoMedio}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>

                      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                        {medios.length === 0 ? (
                          <div className="rounded-2xl bg-slate-50 p-10 text-center">
                            <ImageIcon size={42} className="mx-auto mb-3 text-slate-300" />
                            <h3 className="text-xl font-bold text-slate-900">
                              Aún no hay imágenes
                            </h3>
                            <p className="mt-2 text-sm text-slate-500">
                              Sube tu primera imagen para usarla en la web.
                            </p>
                          </div>
                        ) : (
                          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {medios.map((media) => (
                              <article
                                key={media.id}
                                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
                              >
                                <div className="h-44 bg-slate-100">
                                  <img
                                    src={media.archivoUrl}
                                    alt={media.nombreOriginal}
                                    className="h-full w-full object-cover"
                                  />
                                </div>

                                <div className="p-4">
                                  <h3 className="truncate font-bold text-slate-900">
                                    {media.nombreOriginal}
                                  </h3>

                                  <p className="mt-1 truncate text-xs text-slate-500">
                                    {media.archivoKey}
                                  </p>

                                  <div className="mt-4 grid grid-cols-2 gap-2">
                                    <button
                                      type="button"
                                      onClick={() => copiarUrlMedio(media.archivoUrl)}
                                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                                    >
                                      <Copy size={15} />
                                      Copiar
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => eliminarMedio(media)}
                                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                                    >
                                      <Trash2 size={15} />
                                      Eliminar
                                    </button>
                                  </div>
                                </div>
                              </article>
                            ))}
                          </div>
                        )}
                      </div>
                    </section>

                    ) : tab === "paginas" ? (
                      <section className="space-y-6">
                        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                              <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
                                <Globe2 size={24} className="text-blue-600" />
                                Páginas del sitio web
                              </h2>
                              <p className="mt-1 text-sm text-slate-500">
                                Crea, publica, oculta y ordena las páginas visibles en la web.
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={abrirCrearPagina}
                              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
                            >
                              <Plus size={18} />
                              Nueva página
                            </button>
                          </div>
                        </div>

                        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                          <div className="overflow-x-auto">
                            <table className="w-full text-left">
                              <thead className="border-b bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                                <tr>
                                  <th className="px-5 py-4">Página</th>
                                  <th className="px-5 py-4">Ruta</th>
                                  <th className="px-5 py-4">Menú</th>
                                  <th className="px-5 py-4">Publicada</th>
                                  <th className="px-5 py-4">Orden</th>
                                  <th className="px-5 py-4 text-center">Acciones</th>
                                </tr>
                              </thead>

                              <tbody className="divide-y divide-slate-100">
                                {paginasFiltradas.length === 0 ? (
                                  <tr>
                                    <td
                                      colSpan="6"
                                      className="px-5 py-10 text-center font-medium text-slate-500"
                                    >
                                      No se encontraron páginas.
                                    </td>
                                  </tr>
                                ) : (
                                  paginasFiltradas.map((pagina) => (
                                    <tr key={pagina.id} className="hover:bg-slate-50">
                                      <td className="px-5 py-4">
                                        <div>
                                          <p className="font-bold text-slate-900">
                                            {pagina.titulo}
                                          </p>

                                          <div className="mt-1 flex flex-wrap gap-2">
                                            <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                                              {pagina.tipo}
                                            </span>

                                            {pagina.protegida && (
                                              <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">
                                                Protegida
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </td>

                                      <td className="px-5 py-4">
                                        <a
                                          href={pagina.ruta}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="font-semibold text-blue-600 hover:underline"
                                        >
                                          {pagina.ruta}
                                        </a>
                                      </td>

                                      <td className="px-5 py-4">
                                        <button
                                          type="button"
                                          onClick={() => cambiarVisibilidadMenuPagina(pagina)}
                                          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                                            pagina.visible_menu
                                              ? "bg-green-100 text-green-700"
                                              : "bg-slate-100 text-slate-600"
                                          }`}
                                        >
                                          {pagina.visible_menu ? "Visible" : "Oculta"}
                                        </button>
                                      </td>

                                      <td className="px-5 py-4">
                                        <button
                                          type="button"
                                          onClick={() => cambiarPublicacionPagina(pagina)}
                                          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                                            pagina.publicada
                                              ? "bg-blue-100 text-blue-700"
                                              : "bg-red-100 text-red-700"
                                          }`}
                                        >
                                          {pagina.publicada ? "Publicada" : "No publicada"}
                                        </button>
                                      </td>

                                      <td className="px-5 py-4 font-semibold text-slate-700">
                                        {pagina.orden}
                                      </td>

                                      <td className="px-5 py-4">
                                        <div className="flex justify-center gap-2">
                                          <button
                                            type="button"
                                            onClick={() => abrirEditorContenidoPagina(pagina)}
                                            className="rounded-xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                                          >
                                            Contenido
                                          </button>

                                          <button
                                            type="button"
                                            onClick={() => abrirEditarPagina(pagina)}
                                            className="rounded-xl bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                                          >
                                            Editar
                                          </button>

                                          <button
                                            type="button"
                                            onClick={() => eliminarPagina(pagina)}
                                            className="rounded-xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                                          >
                                            {pagina.protegida ? "Ocultar" : "Eliminar"}
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </section>
      ) : tab === "cursos" ? (
        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Cursos publicados en web
              </h2>
              <p className="text-sm text-slate-500">
                Activa, oculta, destaca y asigna categorías a tus cursos.
              </p>
            </div>

            <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
              {cursosFiltrados.length} curso(s)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4">Curso</th>
                  <th className="px-5 py-4">Categorías</th>
                  <th className="px-5 py-4">Web</th>
                  <th className="px-5 py-4">Destacado</th>
                  <th className="px-5 py-4">Slug</th>
                  <th className="px-5 py-4 text-center">Acciones</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {cursosFiltrados.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-5 py-10 text-center font-medium text-slate-500"
                    >
                      No se encontraron cursos.
                    </td>
                  </tr>
                ) : (
                  cursosFiltrados.map((curso) => (
                    <tr key={curso.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {curso.imagen_url ? (
                            <img
                              src={curso.imagen_url}
                              alt={curso.nombrecurso}
                              className="h-12 w-12 rounded-xl object-cover"
                            />
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                              <BookOpen size={22} />
                            </div>
                          )}

                          <div>
                            <p className="font-bold text-slate-800">
                              {curso.nombrecurso}
                            </p>
                            <p className="max-w-[260px] truncate text-xs text-slate-500">
                              {curso.resumen_web ||
                                curso.descripcion ||
                                "Sin resumen web"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex max-w-[240px] flex-wrap gap-2">
                          {curso.categorias?.length > 0 ? (
                            curso.categorias.map((cat) => (
                              <span
                                key={cat.id}
                                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
                              >
                                {cat.nombre}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-slate-400">
                              Sin categoría
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => cambiarVisibleCurso(curso)}
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                            curso.visible_web
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {curso.visible_web ? (
                            <Eye size={15} />
                          ) : (
                            <EyeOff size={15} />
                          )}
                          {curso.visible_web ? "Visible" : "Oculto"}
                        </button>
                      </td>

                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => cambiarDestacadoCurso(curso)}
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                            curso.destacado_web
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          <Star size={15} />
                          {curso.destacado_web ? "Sí" : "No"}
                        </button>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-sm font-medium text-slate-600">
                          {curso.slug || "Sin slug"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-center">
                          <button
                            type="button"
                            onClick={() => abrirEditarCursoWeb(curso)}
                            className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                          >
                            <Edit2 size={17} />
                            Configurar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Categorías web
              </h2>
              <p className="text-sm text-slate-500">
                Crea categorías para organizar los cursos en la web pública.
              </p>
            </div>

            <button
              type="button"
              onClick={abrirCrearCategoria}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <Plus size={18} />
              Nueva categoría
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {categoriasFiltradas.length === 0 ? (
              <div className="col-span-full rounded-2xl bg-slate-50 p-8 text-center font-medium text-slate-500">
                No se encontraron categorías.
              </div>
            ) : (
              categoriasFiltradas.map((categoria) => (
                <article
                  key={categoria.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">
                        {categoria.nombre}
                      </h3>
                      <p className="text-sm font-medium text-slate-500">
                        /{categoria.slug || "sin-slug"}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        categoria.estado && categoria.visibleWeb
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {categoria.estado && categoria.visibleWeb
                        ? "Visible"
                        : "Oculta"}
                    </span>
                  </div>

                  <p className="mb-5 min-h-[48px] text-sm leading-6 text-slate-600">
                    {categoria.descripcion || "Sin descripción."}
                  </p>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => abrirEditarCategoria(categoria)}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                    >
                      <Edit2 size={17} />
                      Editar
                    </button>

                    <button
                      type="button"
                      onClick={() => inhabilitarCategoria(categoria)}
                      className="inline-flex items-center justify-center rounded-xl bg-red-50 px-4 py-2 text-red-700 transition hover:bg-red-100"
                      title="Ocultar categoría"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      )}

      {modalCategoria && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <form
            onSubmit={guardarCategoria}
            className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {categoriaEditar ? "Editar categoría" : "Nueva categoría"}
                </h2>
                <p className="text-sm text-slate-500">
                  Configura cómo aparecerá en la web pública.
                </p>
              </div>

              <button
                type="button"
                onClick={cerrarModalCategoria}
                className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={22} />
              </button>
            </div>

            <div className="grid gap-5 p-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Nombre
                </label>
                <input
                  value={formCategoria.nombre}
                  onChange={(e) =>
                    setFormCategoria((prev) => ({
                      ...prev,
                      nombre: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  placeholder="Ej. Programación"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Slug
                </label>
                <input
                  value={formCategoria.slug}
                  onChange={(e) =>
                    setFormCategoria((prev) => ({
                      ...prev,
                      slug: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  placeholder="programacion"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Orden
                </label>
                <input
                  type="number"
                  value={formCategoria.orden}
                  onChange={(e) =>
                    setFormCategoria((prev) => ({
                      ...prev,
                      orden: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Imagen URL
                </label>
                <div className="space-y-3">
                  <input
                    value={formCategoria.imagen_url}
                    onChange={(e) =>
                      setFormCategoria((prev) => ({
                        ...prev,
                        imagen_url: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    placeholder="https://..."
                  />

                  <button
                    type="button"
                    onClick={() =>
                      abrirSelectorMedia("categoriaImagen", "Seleccionar imagen de categoría")
                    }
                    className="w-full rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                  >
                    Seleccionar desde biblioteca
                  </button>

                  {formCategoria.imagen_url && (
                    <img
                      src={formCategoria.imagen_url}
                      alt="Vista previa categoría"
                      className="h-28 w-full rounded-xl object-cover"
                    />
                  )}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Descripción
                </label>
                <textarea
                  rows="4"
                  value={formCategoria.descripcion}
                  onChange={(e) =>
                    setFormCategoria((prev) => ({
                      ...prev,
                      descripcion: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  placeholder="Descripción de la categoría..."
                />
              </div>

              <label className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
                <input
                  type="checkbox"
                  checked={formCategoria.visible_web}
                  onChange={(e) =>
                    setFormCategoria((prev) => ({
                      ...prev,
                      visible_web: e.target.checked,
                    }))
                  }
                  className="h-5 w-5"
                />
                <span className="font-semibold text-slate-700">
                  Visible en web
                </span>
              </label>

              <label className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
                <input
                  type="checkbox"
                  checked={formCategoria.estado}
                  onChange={(e) =>
                    setFormCategoria((prev) => ({
                      ...prev,
                      estado: e.target.checked,
                    }))
                  }
                  className="h-5 w-5"
                />
                <span className="font-semibold text-slate-700">Activa</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 border-t bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={cerrarModalCategoria}
                className="rounded-xl px-5 py-3 font-semibold text-slate-700 hover:bg-slate-200"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
                <Save size={18} />
                Guardar
              </button>
            </div>
          </form>
        </div>
      )}

      {modalCurso && cursoEditar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <form
            onSubmit={guardarCursoWeb}
            className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Configuración web del curso
                </h2>
                <p className="text-sm text-slate-500">
                  {cursoEditar.nombrecurso}
                </p>
              </div>

              <button
                type="button"
                onClick={cerrarModalCurso}
                className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={22} />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-6">
              <div className="grid gap-5 lg:grid-cols-2">
                <label className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
                  <input
                    type="checkbox"
                    checked={formCurso.visible_web}
                    onChange={(e) =>
                      setFormCurso((prev) => ({
                        ...prev,
                        visible_web: e.target.checked,
                      }))
                    }
                    className="h-5 w-5"
                  />
                  <span className="font-semibold text-slate-700">
                    Mostrar curso en la web
                  </span>
                </label>

                <label className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
                  <input
                    type="checkbox"
                    checked={formCurso.destacado_web}
                    onChange={(e) =>
                      setFormCurso((prev) => ({
                        ...prev,
                        destacado_web: e.target.checked,
                      }))
                    }
                    className="h-5 w-5"
                  />
                  <span className="font-semibold text-slate-700">
                    Marcar como destacado
                  </span>
                </label>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Slug
                  </label>
                  <input
                    value={formCurso.slug}
                    onChange={(e) =>
                      setFormCurso((prev) => ({
                        ...prev,
                        slug: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    placeholder="excel-profesional"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Etiqueta
                  </label>
                  <input
                    value={formCurso.etiqueta_web}
                    onChange={(e) =>
                      setFormCurso((prev) => ({
                        ...prev,
                        etiqueta_web: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    placeholder="Curso, Taller, Diplomado..."
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Orden en web
                  </label>
                  <input
                    type="number"
                    value={formCurso.orden_web}
                    onChange={(e) =>
                      setFormCurso((prev) => ({
                        ...prev,
                        orden_web: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Imagen URL
                  </label>
                  <div className="space-y-3">
                    <input
                      value={formCurso.imagen_url}
                      onChange={(e) =>
                        setFormCurso((prev) => ({
                          ...prev,
                          imagen_url: e.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      placeholder="https://..."
                    />

                    <button
                      type="button"
                      onClick={() =>
                        abrirSelectorMedia("cursoImagen", "Seleccionar imagen del curso")
                      }
                      className="w-full rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                    >
                      Seleccionar desde biblioteca
                    </button>

                    {formCurso.imagen_url && (
                      <img
                        src={formCurso.imagen_url}
                        alt="Vista previa curso"
                        className="h-32 w-full rounded-xl object-cover"
                      />
                    )}
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Resumen web
                  </label>
                  <textarea
                    rows="3"
                    value={formCurso.resumen_web}
                    onChange={(e) =>
                      setFormCurso((prev) => ({
                        ...prev,
                        resumen_web: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    placeholder="Resumen corto para la tarjeta del curso..."
                  />
                </div>

                <div className="lg:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Requisitos
                  </label>
                  <textarea
                    rows="3"
                    value={formCurso.requisitos_web}
                    onChange={(e) =>
                      setFormCurso((prev) => ({
                        ...prev,
                        requisitos_web: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    placeholder="Requisitos visibles en el detalle del curso..."
                  />
                </div>

                <div className="lg:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Beneficios
                  </label>
                  <textarea
                    rows="5"
                    value={formCurso.beneficios_texto}
                    onChange={(e) =>
                      setFormCurso((prev) => ({
                        ...prev,
                        beneficios_texto: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    placeholder={"Un beneficio por línea\nCertificado al finalizar\nMaterial descargable"}
                  />
                </div>

                <div className="lg:col-span-2">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        Categorías del curso
                      </h3>
                      <p className="text-sm text-slate-500">
                        Selecciona en qué categorías aparecerá este curso.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    {categorias.length === 0 ? (
                      <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500 md:col-span-2">
                        Aún no hay categorías creadas.
                      </div>
                    ) : (
                      categorias.map((categoria) => (
                        <label
                          key={categoria.id}
                          className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${
                            formCurso.categoriasIds.includes(categoria.id)
                              ? "border-blue-300 bg-blue-50"
                              : "border-slate-200 bg-white hover:bg-slate-50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={formCurso.categoriasIds.includes(
                              categoria.id
                            )}
                            onChange={() => toggleCategoriaCurso(categoria.id)}
                            className="h-5 w-5"
                          />

                          <div>
                            <p className="font-semibold text-slate-800">
                              {categoria.nombre}
                            </p>
                            <p className="text-xs text-slate-500">
                              /{categoria.slug}
                            </p>
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={cerrarModalCurso}
                className="rounded-xl px-5 py-3 font-semibold text-slate-700 hover:bg-slate-200"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
                <Save size={18} />
                Guardar configuración
              </button>
            </div>
          </form>
        </div>
      )}

      {modalPagina && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <form
            onSubmit={guardarPagina}
            className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {paginaEditar ? "Editar página" : "Nueva página"}
                </h2>
                <p className="text-sm text-slate-500">
                  Configura la información básica de la página.
                </p>
              </div>

              <button
                type="button"
                onClick={cerrarModalPagina}
                className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={22} />
              </button>
            </div>

            <div className="grid max-h-[70vh] gap-5 overflow-y-auto p-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Título
                </label>
                <input
                  value={formPagina.titulo}
                  onChange={(e) =>
                    setFormPagina((prev) => ({
                      ...prev,
                      titulo: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  placeholder="Preguntas frecuentes"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Slug
                </label>
                <input
                  value={formPagina.slug}
                  onChange={(e) =>
                    setFormPagina((prev) => ({
                      ...prev,
                      slug: e.target.value,
                    }))
                  }
                  disabled={paginaEditar?.protegida}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
                  placeholder="preguntas-frecuentes"
                />
                {paginaEditar?.protegida && (
                  <p className="mt-1 text-xs text-slate-500">
                    Las páginas protegidas no permiten cambiar el slug.
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Orden
                </label>
                <input
                  type="number"
                  value={formPagina.orden}
                  onChange={(e) =>
                    setFormPagina((prev) => ({
                      ...prev,
                      orden: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex flex-1 items-center gap-3 rounded-xl bg-slate-50 p-4">
                  <input
                    type="checkbox"
                    checked={formPagina.visible_menu}
                    onChange={(e) =>
                      setFormPagina((prev) => ({
                        ...prev,
                        visible_menu: e.target.checked,
                      }))
                    }
                    className="h-5 w-5"
                  />
                  <span className="font-semibold text-slate-700">
                    Visible en menú
                  </span>
                </label>

                <label className="flex flex-1 items-center gap-3 rounded-xl bg-slate-50 p-4">
                  <input
                    type="checkbox"
                    checked={formPagina.publicada}
                    onChange={(e) =>
                      setFormPagina((prev) => ({
                        ...prev,
                        publicada: e.target.checked,
                      }))
                    }
                    className="h-5 w-5"
                  />
                  <span className="font-semibold text-slate-700">Publicada</span>
                </label>
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Descripción
                </label>
                <textarea
                  rows="4"
                  value={formPagina.descripcion}
                  onChange={(e) =>
                    setFormPagina((prev) => ({
                      ...prev,
                      descripcion: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  placeholder="Descripción visible de la página..."
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  SEO title
                </label>
                <input
                  value={formPagina.seo_title}
                  onChange={(e) =>
                    setFormPagina((prev) => ({
                      ...prev,
                      seo_title: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  placeholder="Título SEO"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  SEO description
                </label>
                <input
                  value={formPagina.seo_description}
                  onChange={(e) =>
                    setFormPagina((prev) => ({
                      ...prev,
                      seo_description: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  placeholder="Descripción SEO"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={cerrarModalPagina}
                className="rounded-xl px-5 py-3 font-semibold text-slate-700 hover:bg-slate-200"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
                <Save size={18} />
                Guardar página
              </button>
            </div>
          </form>
        </div>
      )}

      {modalContenidoPagina && paginaContenidoEditar && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="max-h-[94vh] w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Editor de contenido
                </h2>
                <p className="text-sm text-slate-500">
                  Página: {paginaContenidoEditar.titulo}
                </p>
              </div>

              <button
                type="button"
                onClick={cerrarEditorContenidoPagina}
                className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={22} />
              </button>
            </div>

            <div className="max-h-[74vh] overflow-y-auto p-6">
              <div className="mb-6 rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
                <h3 className="mb-3 text-lg font-bold text-slate-900">
                  Agregar sección
                </h3>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => agregarSeccionPagina("texto")}
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
                  >
                    <FileText size={17} />
                    Texto simple
                  </button>

                  <button
                    type="button"
                    onClick={() => agregarSeccionPagina("imagen_texto")}
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
                  >
                    <ImageIcon size={17} />
                    Imagen + texto
                  </button>

                  <button
                    type="button"
                    onClick={() => agregarSeccionPagina("faq")}
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
                  >
                    <HelpCircle size={17} />
                    Preguntas frecuentes
                  </button>
                </div>
              </div>

              {contenidoPaginaForm.secciones.length === 0 ? (
                <div className="rounded-2xl bg-white p-10 text-center ring-1 ring-slate-200">
                  <Globe2 size={42} className="mx-auto mb-3 text-slate-300" />
                  <h3 className="text-xl font-bold text-slate-900">
                    Esta página aún no tiene secciones
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Agrega una sección para empezar a construir la página.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {contenidoPaginaForm.secciones.map((seccion, index) => (
                    <section
                      key={seccion.id || index}
                      className={`rounded-2xl border p-5 ${
                        seccion.activo === false
                          ? "border-slate-200 bg-slate-50 opacity-70"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">
                            Sección {index + 1}:{" "}
                            {seccion.tipo === "texto"
                              ? "Texto simple"
                              : seccion.tipo === "imagen_texto"
                              ? "Imagen + texto"
                              : seccion.tipo === "faq"
                              ? "Preguntas frecuentes"
                              : seccion.tipo}
                          </h3>

                          <p className="text-sm text-slate-500">
                            Orden: {seccion.orden} ·{" "}
                            {seccion.activo === false ? "Oculta" : "Visible"}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => moverSeccionPagina(index, "arriba")}
                            disabled={index === 0}
                            className="rounded-xl bg-slate-100 p-2 text-slate-700 hover:bg-slate-200 disabled:opacity-40"
                          >
                            <ArrowUp size={17} />
                          </button>

                          <button
                            type="button"
                            onClick={() => moverSeccionPagina(index, "abajo")}
                            disabled={
                              index === contenidoPaginaForm.secciones.length - 1
                            }
                            className="rounded-xl bg-slate-100 p-2 text-slate-700 hover:bg-slate-200 disabled:opacity-40"
                          >
                            <ArrowDown size={17} />
                          </button>

                          <button
                            type="button"
                            onClick={() => toggleSeccionActiva(index)}
                            className="rounded-xl bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-100"
                          >
                            {seccion.activo === false ? "Mostrar" : "Ocultar"}
                          </button>

                          <button
                            type="button"
                            onClick={() => eliminarSeccionPagina(index)}
                            className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>

                      {seccion.tipo === "texto" && (
                        <div className="grid gap-4">
                          <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                              Título
                            </label>
                            <input
                              value={seccion.config?.titulo || ""}
                              onChange={(e) =>
                                actualizarSeccionConfig(
                                  index,
                                  "titulo",
                                  e.target.value
                                )
                              }
                              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                            />
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                              Descripción / contenido
                            </label>
                            <textarea
                              rows="6"
                              value={seccion.config?.descripcion || ""}
                              onChange={(e) =>
                                actualizarSeccionConfig(
                                  index,
                                  "descripcion",
                                  e.target.value
                                )
                              }
                              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                            />
                          </div>
                        </div>
                      )}

                      {seccion.tipo === "imagen_texto" && (
                        <div className="grid gap-4 lg:grid-cols-2">
                          <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                              Título
                            </label>
                            <input
                              value={seccion.config?.titulo || ""}
                              onChange={(e) =>
                                actualizarSeccionConfig(
                                  index,
                                  "titulo",
                                  e.target.value
                                )
                              }
                              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                            />
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                              Posición de imagen
                            </label>
                            <select
                              value={seccion.config?.posicionImagen || "derecha"}
                              onChange={(e) =>
                                actualizarSeccionConfig(
                                  index,
                                  "posicionImagen",
                                  e.target.value
                                )
                              }
                              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                            >
                              <option value="derecha">Derecha</option>
                              <option value="izquierda">Izquierda</option>
                            </select>
                          </div>

                          <div className="lg:col-span-2">
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                              Descripción
                            </label>
                            <textarea
                              rows="5"
                              value={seccion.config?.descripcion || ""}
                              onChange={(e) =>
                                actualizarSeccionConfig(
                                  index,
                                  "descripcion",
                                  e.target.value
                                )
                              }
                              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                            />
                          </div>

                          <div className="lg:col-span-2">
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                              Imagen
                            </label>

                            <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
                              <div className="space-y-3">
                                <input
                                  value={seccion.config?.imagenUrl || ""}
                                  onChange={(e) =>
                                    actualizarSeccionConfig(
                                      index,
                                      "imagenUrl",
                                      e.target.value
                                    )
                                  }
                                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                  placeholder="https://..."
                                />

                                <button
                                  type="button"
                                  onClick={() =>
                                    abrirSelectorMedia(
                                      `paginaSeccionImagen:${index}`,
                                      "Seleccionar imagen de sección"
                                    )
                                  }
                                  className="w-full rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-200"
                                >
                                  Seleccionar desde biblioteca
                                </button>
                              </div>

                              {seccion.config?.imagenUrl ? (
                                <img
                                  src={seccion.config.imagenUrl}
                                  alt="Vista previa"
                                  className="h-36 w-full rounded-xl object-cover"
                                />
                              ) : (
                                <div className="flex h-36 items-center justify-center rounded-xl bg-slate-100 text-sm font-semibold text-slate-400">
                                  Sin imagen
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {seccion.tipo === "faq" && (
                        <div>
                          <div className="mb-4">
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                              Título de sección
                            </label>
                            <input
                              value={seccion.config?.titulo || ""}
                              onChange={(e) =>
                                actualizarSeccionConfig(
                                  index,
                                  "titulo",
                                  e.target.value
                                )
                              }
                              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                            />
                          </div>

                          <div className="space-y-4">
                            {(seccion.config?.items || []).map((item, itemIndex) => (
                              <div
                                key={itemIndex}
                                className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"
                              >
                                <div className="mb-3 flex items-center justify-between gap-3">
                                  <h4 className="font-bold text-slate-800">
                                    Pregunta {itemIndex + 1}
                                  </h4>

                                  {(seccion.config?.items || []).length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        eliminarFaqItem(index, itemIndex)
                                      }
                                      className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  )}
                                </div>

                                <input
                                  value={item.pregunta || ""}
                                  onChange={(e) =>
                                    actualizarFaqItem(
                                      index,
                                      itemIndex,
                                      "pregunta",
                                      e.target.value
                                    )
                                  }
                                  className="mb-3 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                  placeholder="Pregunta"
                                />

                                <textarea
                                  rows="4"
                                  value={item.respuesta || ""}
                                  onChange={(e) =>
                                    actualizarFaqItem(
                                      index,
                                      itemIndex,
                                      "respuesta",
                                      e.target.value
                                    )
                                  }
                                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                  placeholder="Respuesta"
                                />
                              </div>
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={() => agregarFaqItem(index)}
                            className="mt-4 rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-200"
                          >
                            + Agregar pregunta
                          </button>
                        </div>
                      )}
                    </section>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 border-t bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={cerrarEditorContenidoPagina}
                className="rounded-xl px-5 py-3 font-semibold text-slate-700 hover:bg-slate-200"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={guardarContenidoPagina}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
                <Save size={18} />
                Guardar contenido
              </button>
            </div>
          </div>
        </div>
      )}

      {mediaPicker.abierto && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {mediaPicker.titulo}
                </h2>
                <p className="text-sm text-slate-500">
                  Elige una imagen subida en la biblioteca de medios.
                </p>
              </div>

              <button
                type="button"
                onClick={cerrarSelectorMedia}
                className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={22} />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-6">
              {medios.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 p-10 text-center">
                  <ImageIcon size={42} className="mx-auto mb-3 text-slate-300" />
                  <h3 className="text-xl font-bold text-slate-900">
                    No hay imágenes disponibles
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Primero sube imágenes desde la pestaña Medios.
                  </p>
                </div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {medios.map((media) => (
                    <button
                      key={media.id}
                      type="button"
                      onClick={() => seleccionarImagenMedia(media)}
                      className="overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition hover:border-blue-400 hover:shadow-md"
                    >
                      <div className="h-40 bg-slate-100">
                        <img
                          src={media.archivoUrl}
                          alt={media.nombreOriginal}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="p-4">
                        <h3 className="truncate font-bold text-slate-900">
                          {media.nombreOriginal}
                        </h3>

                        <p className="mt-1 truncate text-xs text-slate-500">
                          {media.archivoKey}
                        </p>

                        <span className="mt-3 inline-flex rounded-xl bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700">
                          Seleccionar imagen
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}