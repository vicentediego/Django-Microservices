import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useUpdateUserMutation } from "../../store/api/authApi";
import Modal from "../ui/Modal";

export default function ProfileModal({ isOpen, onClose }) {
  const { user, saveTokens, logout } = useAuth();
  const [updateUser, { isLoading }] = useUpdateUserMutation();
  const [alert, setAlert] = useState(null);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    if (isOpen && user) {
      setForm({
        username: user.username || "",
        email: user.email || "",
        password: "",
      });
      setAlert(null);
      setSuccess(false);
    }
  }, [isOpen, user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setAlert(null);
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);

    if (!form.username.trim()) {
      setAlert("El nombre de usuario es requerido");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setAlert("Ingresa un correo electrónico válido");
      return;
    }

    const payload = {
      id: user.user_id,
      username: form.username,
      email: form.email,
    };

    if (form.password) {
      if (form.password.length < 6) {
        setAlert("La contraseña debe tener al menos 6 caracteres");
        return;
      }
      payload.password = form.password;
    }

    try {
      await updateUser(payload).unwrap();
      setSuccess(true);
      setTimeout(() => {
        onClose();
        logout();
      }, 1500);
    } catch (err) {
      const msg = err.data;
      if (typeof msg === "object") {
        const first = Object.values(msg)[0];
        setAlert(Array.isArray(first) ? first[0] : String(first));
      } else {
        setAlert("Error al actualizar perfil");
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Perfil">
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
          <span>Perfil actualizado. Inicia sesión de nuevo...</span>
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
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nueva contraseña
          </label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Dejar vacío para no cambiar"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-primary text-white py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Guardando...
              </>
            ) : (
              "Guardar"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
