import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { estilosService } from "../services/estilosService";

const ThemeContext = createContext(null);

const DEFAULT_THEME = {
  primary: "#3B82F6",
  secondary: "#0EA5E9",
  sidenav: "#1E293B",
  sidenavText: "#FFFFFF",
  buttonPrimary: "#1E293B",
  buttonPrimaryText: "#FFFFFF",
  buttonSecondary: "#0EA5E9",
  buttonSecondaryText: "#FFFFFF",
  background: "#F8FAFC",
  card: "#FFFFFF",
  text: "#0F172A",
  mutedText: "#64748B",
  border: "#E2E8F0",
  tipoSidenav: "OSCURO",
  sidenavMini: false,
  modoOscuro: false,
};

function aplicarVariablesCss(theme) {
  const root = document.documentElement;

  root.style.setProperty("--color-primary", theme.primary || DEFAULT_THEME.primary);
  root.style.setProperty("--color-secondary", theme.secondary || DEFAULT_THEME.secondary);

  root.style.setProperty("--color-sidenav", theme.sidenav || DEFAULT_THEME.sidenav);
  root.style.setProperty("--color-sidenav-text", theme.sidenavText || DEFAULT_THEME.sidenavText);

  root.style.setProperty("--color-button-primary", theme.buttonPrimary || DEFAULT_THEME.buttonPrimary);
  root.style.setProperty("--color-button-primary-text", theme.buttonPrimaryText || DEFAULT_THEME.buttonPrimaryText);

  root.style.setProperty("--color-button-secondary", theme.buttonSecondary || DEFAULT_THEME.buttonSecondary);
  root.style.setProperty("--color-button-secondary-text", theme.buttonSecondaryText || DEFAULT_THEME.buttonSecondaryText);

  root.style.setProperty("--color-background", theme.background || DEFAULT_THEME.background);
  root.style.setProperty("--color-card", theme.card || DEFAULT_THEME.card);
  root.style.setProperty("--color-text", theme.text || DEFAULT_THEME.text);
  root.style.setProperty("--color-muted-text", theme.mutedText || DEFAULT_THEME.mutedText);
  root.style.setProperty("--color-border", theme.border || DEFAULT_THEME.border);

  root.dataset.themeMode = theme.modoOscuro ? "dark" : "light";
  root.dataset.sidenavType = theme.tipoSidenav || "OSCURO";
  root.dataset.sidenavMini = theme.sidenavMini ? "true" : "false";
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const [cargandoTheme, setCargandoTheme] = useState(true);

  const cargarTheme = async () => {
    try {
      const data = await estilosService.obtenerConfiguracionPublica();

      const themeFinal = {
        ...DEFAULT_THEME,
        ...data,
      };

      setTheme(themeFinal);
      aplicarVariablesCss(themeFinal);

      localStorage.setItem("theme_config", JSON.stringify(themeFinal));
    } catch (error) {
      console.error("Error cargando estilos globales:", error);

      const themeCache = localStorage.getItem("theme_config");

      if (themeCache) {
        try {
          const themeGuardado = JSON.parse(themeCache);
          const themeFinal = {
            ...DEFAULT_THEME,
            ...themeGuardado,
          };

          setTheme(themeFinal);
          aplicarVariablesCss(themeFinal);
        } catch {
          aplicarVariablesCss(DEFAULT_THEME);
        }
      } else {
        aplicarVariablesCss(DEFAULT_THEME);
      }
    } finally {
      setCargandoTheme(false);
    }
  };

  const actualizarThemeLocal = (nuevoTheme) => {
    const themeFinal = {
      ...DEFAULT_THEME,
      ...theme,
      ...nuevoTheme,
    };

    setTheme(themeFinal);
    aplicarVariablesCss(themeFinal);
    localStorage.setItem("theme_config", JSON.stringify(themeFinal));
  };

  useEffect(() => {
    aplicarVariablesCss(DEFAULT_THEME);
    cargarTheme();
  }, []);

  const value = useMemo(
    () => ({
      theme,
      cargandoTheme,
      cargarTheme,
      actualizarThemeLocal,
    }),
    [theme, cargandoTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme debe usarse dentro de ThemeProvider");
  }

  return context;
}