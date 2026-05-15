import { useMemo } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useTheme } from "../theme/ThemeProvider";

ChartJS.register(ArcElement, Tooltip, Legend);

function obtenerVariableCss(nombre, fallback) {
  if (typeof window === "undefined") return fallback;

  const valor = getComputedStyle(document.documentElement)
    .getPropertyValue(nombre)
    .trim();

  return valor || fallback;
}

export default function GraficoProgreso({ nombre, progreso }) {
  const { theme } = useTheme();

  const progresoSeguro = Math.min(100, Math.max(0, Number(progreso || 0)));

  const colores = useMemo(() => {
    return {
      primary: obtenerVariableCss("--color-primary", "#3B82F6"),
      border: obtenerVariableCss("--color-border", "#E2E8F0"),
      card: obtenerVariableCss("--color-card", "#FFFFFF"),
      text: obtenerVariableCss("--color-text", "#0F172A"),
      mutedText: obtenerVariableCss("--color-muted-text", "#64748B"),
      background: obtenerVariableCss("--color-background", "#F8FAFC"),
    };
  }, [theme]);

  const data = useMemo(
    () => ({
      datasets: [
        {
          data: [progresoSeguro, 100 - progresoSeguro],
          backgroundColor: [colores.primary, colores.border],
          borderWidth: 0,
        },
      ],
    }),
    [progresoSeguro, colores]
  );

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: colores.text,
          titleColor: colores.card,
          bodyColor: colores.card,
          callbacks: {
            label: (context) => `${context.parsed}%`,
          },
        },
      },
    }),
    [colores]
  );

  return (
    <div className="flex flex-col items-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-sm transition hover:shadow-md">
      <div className="relative h-40 w-40">
        <Pie data={data} options={options} />

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="rounded-full bg-[var(--color-card)] px-3 py-2 text-center shadow-sm">
            <p className="text-lg font-black text-[var(--color-primary)]">
              {progresoSeguro}%
            </p>
          </div>
        </div>
      </div>

      <p className="mt-4 line-clamp-2 text-center font-semibold text-[var(--color-text)]">
        {nombre}
      </p>

      <p className="mt-1 text-sm font-medium text-[var(--color-muted-text)]">
        Progreso del curso
      </p>
    </div>
  );
}