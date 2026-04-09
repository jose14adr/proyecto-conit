import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Loader2, Eye, EyeOff, AlertTriangle } from "lucide-react";

// Importamos lo que construimos en los pasos anteriores
import { loginSchema, LoginFormValues } from "../validations/auth.validation";
import { login } from "../services/auth.service";

// Importamos componente reCaptcha
import ReCAPTCHA from "react-google-recaptcha";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const navigate = useNavigate();

  // Conectamos el formulario con react-hook-form y zod para la validación
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const verificarMayusculas = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.getModifierState("CapsLock")) {
      setCapsLockOn(true);
    } else {
      setCapsLockOn(false);
    }
  };

  const onSubmit = async (data: LoginFormValues) => {
    // Validamos que el usuario haya completado el reCAPTCHA antes de enviar el formulario
    if (!captchaToken) {
      toast.error("Por favor completa el reCAPTCHA");
      return;
    }

    try {
      setIsLoading(true);

      // Combinamos los datos del formulario con el token del reCAPTCHA para enviar al backend
      const loginData = {
        ...data,
        recaptchaToken: captchaToken,
      };

      // Llamamos al backend pasando los datos completos, incluyendo el token del reCAPTCHA
      const respuesta = await login(loginData);
      console.log("RESPUESTA LOGIN >>>", respuesta);

      if (!respuesta?.access_token) {
        throw new Error("No llegó access_token del backend");
      }

      const token = respuesta.access_token;
      localStorage.setItem("token", token);

      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        window
          .atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join(""),
      );

      const tokenData = JSON.parse(jsonPayload);

      // Guardamos la información del usuario en el localStorage para usarla en otras partes de la aplicación
      localStorage.setItem("usuario", JSON.stringify(tokenData));

      // Buscamos el rol del usuario en el token o en la respuesta del backend, dependiendo de dónde lo envíe el backend
      const userRole = tokenData.rol || respuesta.usuario?.rol;

      // Si todo está bien, mostramos un mensaje de éxito
      toast.success("Inicio de sesión exitoso");

      // Redirigimos al dashboard
      if (userRole === "ADMINISTRADOR") {
        navigate("/admin");
      } else if (userRole === "DOCENTE") {
        navigate("/docente");
      } else if (userRole === "ALUMNO") {
        navigate("/alumno");
      } else {
        console.warn("Rol no reconocido", userRole);
        navigate("/web");
      }
    } catch (error: any) {
      // Si el backend rechaza el login, mostramos un mensaje de error
      toast.error(error.message || "Error al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-300 to-slate-400 p-4">
      <div className="w-full max-w-md p-10 bg-white/20 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl relative overflow-hidden">
        <h2 className="text-3xl font-extrabold text-center text-[#141426] mb-10 tracking-tight uppercase drop-shadow-sm">
          Accede a tu aula virtual
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
          {/* Campo Correo */}
          <div className="relative">
            <input
              id="correo"
              type="email"
              placeholder="Correo"
              className={`w-full py-4 px-6 bg-[#1b2751] text-white placeholder-gray-400 rounded-full shadow-inner focus:outline-none focus:ring-2 focus:ring-[#5573b3] transition-all duration-300 ${
                errors.correo ? "ring-2 ring-[#894329]" : ""
              }`}
              {...register("correo")}
            />
            {errors.correo && (
              <p className="text-[#894329] text-sm mt-2 ml-4 font-bold drop-shadow-sm">
                {errors.correo.message}
              </p>
            )}
          </div>

          {/* Campo Contraseña */}
          <div className="relative">
            <input
              id="contrasenia"
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              className={`w-full py-4 pl-6 pr-12 bg-[#1b2751] text-white placeholder-gray-400 rounded-full shadow-inner focus:outline-none focus:ring-2 focus:ring-[#5573b3] transition-all duration-300 ${
                errors.contrasenia ? "ring-2 ring-[#894329]" : ""
              }`}
              {...register("contrasenia")}
              onKeyUp={verificarMayusculas}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Mostramos mensaje de mayúsculas activadas */}
          {capsLockOn && (
            <p className="text-amber-600 text-sm mt-1 ml-4 font-semibold flex items-center gap-1">
              <AlertTriangle size={16} /> Mayúsculas activadas
            </p>
          )}

          {errors.contrasenia && (
            <p className="text-[#894329] text-sm mt-2 ml-4 font-bold drop-shadow-sm">
              {errors.contrasenia.message}
            </p>
          )}

          {/* Widget de reCAPTCHA */}
          <div className="flex justify-center mt-2 mb-2">
            <ReCAPTCHA
              sitekey="6LeBVX0sAAAAABptVURftyu-3F1crVMQnOr2uDoC"
              onChange={(token: string | null) => setCaptchaToken(token)}
            />
          </div>

          {/* Botón Iniciar sesión */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 pl-6 bg-[#5573b3] hover:bg-[#344c92] text-white text-lg font-bold rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin mr-3" size={24} />
                Iniciando...
              </>
            ) : (
              "Iniciar sesión"
            )}
          </button>

          <div className="text-center mt-6">
            <Link
              to="/forgot-password"
              className="text-[#141426] hover:text-[#5573b3] italic font-medium transition-colors text-sm drop-shadow-sm"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
