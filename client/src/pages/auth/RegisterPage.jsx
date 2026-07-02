import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useRegisterMutation } from "../../store/api/authApi";
import { useAuth } from "../../context/AuthContext";

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "employee",
  });
  const [alert, setAlert] = useState(null);
  const [success, setSuccess] = useState(false);
  const [pageReady, setPageReady] = useState(false);
  const [pageError, setPageError] = useState(false);
  const [register, { isLoading: isSubmitting }] = useRegisterMutation();
  const { user } = useAuth();
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

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);
    setSuccess(false);

    if (!form.username.trim()) {
      setAlert("Ingresa un nombre de usuario");
      return;
    }

    if (!validateEmail(form.email)) {
      setAlert("Ingresa un correo electrónico válido");
      return;
    }

    if (form.password.length < 6) {
      setAlert("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    try {
      await register(form).unwrap();
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      const msg = err.data;
      if (typeof msg === "object") {
        const first = Object.values(msg)[0];
        setAlert(Array.isArray(first) ? first[0] : String(first));
      } else if (err.status === "FETCH_ERROR") {
        setAlert("No se pudo conectar con el servidor");
      } else {
        setAlert("Error al registrar usuario");
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
          Crear Cuenta
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

        {success && (
          <div className="flex items-center gap-2 bg-primary-light border border-primary text-primary text-sm px-4 py-3 rounded-lg mb-4">
            <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>Cuenta creada. Redirigiendo al login...</span>
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
              Correo electrónico
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="correo@ejemplo.com"
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
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rol
            </label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
            >
              <option value="employee">Empleado</option>
              <option value="admin">Administrador</option>
            </select>
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
                Registrando...
              </>
            ) : (
              "Registrarse"
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
