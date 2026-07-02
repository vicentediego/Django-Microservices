import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useLoginMutation } from "../../store/api/authApi";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [alert, setAlert] = useState(null);
  const [pageReady, setPageReady] = useState(false);
  const [pageError, setPageError] = useState(false);
  const [login, { isLoading: isSubmitting }] = useLoginMutation();
  const { user, saveTokens } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    try {
      if (user) {
        navigate("/dashboard", { replace: true });
        return;
      }
      setPageReady(true);
    } catch {
      setPageError(true);
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setAlert(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);

    if (!form.username.trim()) {
      setAlert("Ingresa tu nombre de usuario");
      return;
    }

    if (!form.password) {
      setAlert("Ingresa tu contraseña");
      return;
    }

    try {
      const data = await login(form).unwrap();
      saveTokens(data);
      navigate("/dashboard");
    } catch (err) {
      if (err.status === 401) {
        setAlert("Usuario o contraseña incorrectos");
      } else if (err.status === "FETCH_ERROR") {
        setAlert("No se pudo conectar con el servidor");
      } else {
        setAlert("Ocurrió un error inesperado");
      }
    }
  };

  if (pageError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-light">
        <div className="text-center">
          <p className="text-red-600 font-medium mb-2">Error al cargar la página</p>
          <button
            onClick={() => window.location.reload()}
            className="text-primary hover:underline text-sm"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!pageReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-light">
        <svg className="animate-spin h-8 w-8 text-primary" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-light">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center text-primary mb-6">
          Iniciar Sesión
        </h1>

        {alert && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
            <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span>{alert}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Usuario
            </label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Tu usuario"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Tu contraseña"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-white py-2.5 rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Ingresando...
              </>
            ) : (
              "Ingresar"
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          ¿No tienes cuenta?{" "}
          <Link to="/register" className="text-primary font-medium hover:underline">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}
