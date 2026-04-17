import { useState, useMemo, useEffect } from "react";
import { Search, Star, Grid, List, Download, Eye } from "lucide-react";
import axios from "axios";

export default function Biblioteca() {
  const [archivos, setArchivos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [vista, setVista] = useState("grid");
  const [soloFav, setSoloFav] = useState(false);

  // Solución recomendada por React: La función asíncrona vive ADENTRO del useEffect
  useEffect(() => {
    const cargarRecursos = async () => {
      try {
        const res = await axios.get("http://localhost:3000/recurso");
        setArchivos(res.data);
      } catch (error) {
        console.error("Error cargando recursos", error);
      }
    };

    cargarRecursos();
  }, []);

  const filtrados = useMemo(() => {
    return archivos.filter((a) => {
      const coincideBusqueda = a.titulo
        .toLowerCase()
        .includes(busqueda.toLowerCase());

      const coincideFav = soloFav ? a.favorito : true;

      return coincideBusqueda && coincideFav;
    });
  }, [busqueda, soloFav, archivos]);

  const toggleFavorito = (id) => {
    setArchivos((prev) =>
      prev.map((a) => (a.id === id ? { ...a, favorito: !a.favorito } : a)),
    );
  };

  return (
    <div className="h-full flex flex-col gap-8 bg-gray-50 p-8">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">
          Centro de Recursos
        </h1>
      </div>

      {/* FILTROS */}
      <div className="flex gap-4 items-center">
        <div className="relative">
          <Search size={16} className="absolute top-3 left-3 text-gray-400" />
          <input
            placeholder="Buscar recurso..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-10 pr-300 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={() => setSoloFav(!soloFav)}
          className={`px-5 py-2 rounded-xl border text-sm flex items-center gap-2 transition
            ${soloFav ? "bg-yellow-100 border-yellow-300 text-yellow-700" : "bg-white border-gray-200 text-gray-600"}
          `}
        >
          <Star size={16} />
          Favoritos
        </button>

        <div className="ml-auto flex gap-2">
          <button
            onClick={() => setVista("grid")}
            className={`p-2 rounded-lg ${vista === "grid" ? "bg-white shadow" : "text-gray-400"}`}
          >
            <Grid size={18} />
          </button>

          <button
            onClick={() => setVista("list")}
            className={`p-2 rounded-lg ${vista === "list" ? "bg-white shadow" : "text-gray-400"}`}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard titulo="Recursos" valor={archivos.length} />
        <StatCard
          titulo="Descargas"
          valor={archivos.reduce((acc, a) => acc + (a.descargas || 0), 0)}
        />
        <StatCard
          titulo="Favoritos"
          valor={archivos.filter((a) => a.favorito).length}
        />
        <StatCard titulo="Este mes" valor="12" />
      </div>

      {/* CONTENIDO */}
      {vista === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtrados.map((a) => (
            <ResourceCard
              key={a.id}
              data={a}
              toggleFavorito={toggleFavorito}
              setArchivos={setArchivos}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm divide-y">
          {filtrados.map((a) => {
            const logos = {
              Dialnet: "/src/assets/logos/dialnet.png",
              "Alicia Concytec": "/src/assets/logos/concytec.png",
              "Google Scholar": "/src/assets/logos/scholar.png",
              SciELO: "/src/assets/logos/scielo.png",
              Redalyc: "/src/assets/logos/redalyc.png",
            };

            return (
              <div
                key={a.id}
                className="flex justify-between items-center px-6 py-4 hover:bg-gray-50 transition"
              >
                {/* IZQUIERDA */}
                <div className="flex items-center gap-4">
                  {logos[a.titulo] && (
                    <img
                      src={logos[a.titulo]}
                      className="w-8 h-8 object-contain"
                    />
                  )}

                  <div>
                    <div className="font-medium text-gray-800">{a.titulo}</div>

                    <div className="text-sm text-gray-500">{a.curso}</div>
                  </div>
                </div>

                {/* DERECHA */}
                <div className="flex gap-6 items-center text-gray-500">
                  <span className="text-sm">{a.tipo?.toUpperCase()}</span>

                  <span className="text-sm">{a.descargas || 0} clics</span>

                  <Eye
                    size={18}
                    className="cursor-pointer hover:text-blue-600"
                    onClick={async () => {
                      if (a.link) {
                        window.open(a.link, "_blank");
                        try {
                          await axios.patch(
                            `http://localhost:3000/recurso/${a.id}/click`,
                          );
                          setArchivos((prev) =>
                            prev.map((item) =>
                              item.id === a.id
                                ? {
                                    ...item,
                                    descargas: (item.descargas || 0) + 1,
                                  }
                                : item,
                            ),
                          );
                        } catch (error) {
                          console.error("Error registrando click", error);
                        }
                      }
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatCard({ titulo, valor }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="text-sm text-gray-500">{titulo}</div>
      <div className="text-2xl font-semibold text-gray-800 mt-2">{valor}</div>
    </div>
  );
}

function ResourceCard({ data, toggleFavorito, setArchivos }) {
  const logos = {
    Dialnet: "/src/assets/logos/dialnet.png",
    "Alicia Concytec": "/src/assets/logos/concytec.png",
    "Google Scholar": "/src/assets/logos/scholar.png",
    SciELO: "/src/assets/logos/scielo.png",
    Redalyc: "/src/assets/logos/redalyc.png",
  };

  const esWeb = data.tipo === "web";

  return (
    // Reemplazamos motion.div por un div normal con Tailwind para la animación
    <div
      className={`rounded-2xl p-6 shadow-sm border transition-all duration-200 hover:-translate-y-1 w-full
        ${
          esWeb
            ? "bg-blue-50 border-blue-200 hover:shadow-md"
            : "bg-white border-gray-100 hover:shadow-md"
        }
      `}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          {logos[data.titulo] && (
            <img
              src={logos[data.titulo]}
              className="w-14 h-10 object-contain"
            />
          )}
          <div>
            <div className="font-medium text-gray-800 text-lg">
              {data.titulo}
            </div>

            <div className="text-sm text-gray-500 mt-1">{data.curso}</div>
          </div>
        </div>

        <button onClick={() => toggleFavorito(data.id)}>
          <Star
            size={18}
            className={
              data.favorito
                ? "text-yellow-500 fill-yellow-500"
                : "text-gray-300"
            }
          />
        </button>
      </div>

      <div className="text-sm text-gray-500 mt-4">
        {data.tipo?.toUpperCase()} • {data.tamaño || "N/A"}
      </div>

      <div className="flex gap-4 mt-6 text-gray-500">
        <Eye
          size={18}
          className="cursor-pointer hover:text-blue-600"
          onClick={async () => {
            if (data.link) {
              window.open(data.link, "_blank");
              try {
                await axios.patch(
                  `http://localhost:3000/recurso/${data.id}/click`,
                );
                if (setArchivos) {
                  setArchivos((prev) =>
                    prev.map((item) =>
                      item.id === data.id
                        ? { ...item, descargas: (item.descargas || 0) + 1 }
                        : item,
                    ),
                  );
                }
              } catch (error) {
                console.error("Error registrando click", error);
              }
            }
          }}
        />

        {!esWeb && (
          <Download size={18} className="cursor-pointer hover:text-blue-600" />
        )}
      </div>
    </div>
  );
}
