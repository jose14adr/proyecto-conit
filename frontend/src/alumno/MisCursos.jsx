import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function MisCursos() {

  const [cursos, setCursos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    
    api.get("/curso")
      .then(res => {
        setCursos(res.data);
      })
      .catch(err => {
        console.error("Error al obtener cursos:", err);
      });
  }, []);

  return (

    <div className="flex gap-8 h-full">

      {/* CURSOS */}

      <div className="flex-1 bg-white p-8 rounded-xl shadow-sm border border-gray-200">

        <h2 className="text-2xl font-bold mb-8">
          Mis Cursos
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

          {cursos.length === 0 ? (
            <p className="col-span-3 text-center text-gray-400">
              No tienes cursos registrados
            </p>
          ) : (

            cursos.map((curso) => (

              <div
                key={curso.id}
                onClick={() => navigate(`/alumno/mis-cursos/${curso.id}`)}
                className="cursor-pointer bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition duration-300 border border-gray-100"
              >

                {/* IMAGEN CURSO */}

                <img
                  src={curso.imagen || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3"}
                  alt={curso.nombre}
                  className="w-full h-40 object-cover"
                />

                {/* INFO */}

                <div className="p-5">

                  <h3 className="text-lg font-semibold mb-2">
                    {curso.nombre}
                  </h3>

                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                    {curso.descripcion}
                  </p>

                  <button
                    onClick={(e)=>{
                      e.stopPropagation()
                      navigate(`/alumno/mis-cursos/${curso.id}`)
                    }}
                    className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
                  >
                    Entrar al curso
                  </button>

                </div>

              </div>

            ))

          )}

        </div>

      </div>


      {/* PANEL DERECHO */}

      <div className="w-80 flex flex-col gap-6">

        {/* CALENDARIO */}

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">

          <p className="font-semibold text-center mb-4">
            2026 — MARZO
          </p>

          <div className="grid grid-cols-7 gap-2 text-sm text-center text-gray-600">

            {[...Array(31)].map((_, i) => (

              <div
                key={i}
                className="hover:bg-indigo-100 rounded-md cursor-pointer"
              >
                {i + 1}
              </div>

            ))}

          </div>

        </div>


        {/* CURSO DEL DIA */}

        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-8 rounded-xl shadow flex-1 flex flex-col justify-center text-center">

          <h2 className="text-xl font-bold">
            Cursos de Hoy
          </h2>

          <p className="text-sm opacity-80 mt-2">
            Sigue aprendiendo
          </p>

          {cursos.length > 0 && (

            <div className="mt-6">

              <p className="font-semibold text-lg">
                {cursos[0].nombre}
              </p>

              <button
                onClick={() => navigate(`/alumno/mis-cursos/${cursos[0].id}`)}
                className="mt-4 bg-white text-indigo-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100"
              >
                Continuar
              </button>

            </div>

          )}

        </div>

      </div>

    </div>

  );

}