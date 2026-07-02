import { useState } from "react";
import {
  useGetRawMaterialCategoriesQuery,
  useCreateRawMaterialCategoryMutation,
  useUpdateRawMaterialCategoryMutation,
  useDeleteRawMaterialCategoryMutation,
} from "../../../store/api/rawMaterialsApi";
import Modal from "../Modal";

const emptyForm = { name: "", description: "" };

export default function RawMaterialCategoriesModal({ isOpen, onClose }) {
  const { data: categories, isLoading } = useGetRawMaterialCategoriesQuery();
  const [createCategory, { isLoading: isCreating }] = useCreateRawMaterialCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateRawMaterialCategoryMutation();
  const [deleteCategory] = useDeleteRawMaterialCategoryMutation();

  const [view, setView] = useState("list");
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [alert, setAlert] = useState(null);

  const resetToList = () => {
    setView("list");
    setEditing(null);
    setDeleting(null);
    setForm(emptyForm);
    setAlert(null);
  };

  const handleClose = () => {
    resetToList();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);

    if (!form.name.trim()) {
      setAlert("El nombre es requerido");
      return;
    }

    try {
      if (editing) {
        await updateCategory({ id: editing.id, ...form }).unwrap();
      } else {
        await createCategory(form).unwrap();
      }
      resetToList();
    } catch (err) {
      const msg = err.data;
      if (typeof msg === "object") {
        const first = Object.values(msg)[0];
        setAlert(Array.isArray(first) ? first[0] : String(first));
      } else {
        setAlert("Error al guardar categoría");
      }
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCategory(deleting.id).unwrap();
      resetToList();
    } catch {
      setAlert("No se pudo eliminar. Puede tener insumos asociados.");
      setView("list");
      setDeleting(null);
    }
  };

  const isSaving = isCreating || isUpdating;

  const title =
    view === "form"
      ? editing ? "Editar Categoría" : "Nueva Categoría"
      : view === "delete"
        ? "Eliminar Categoría"
        : "Categorías de Insumos";

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title}>
      {view === "list" && (
        <div>
          <button
            onClick={() => { setForm(emptyForm); setEditing(null); setAlert(null); setView("form"); }}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors mb-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Agregar categoría
          </button>

          {isLoading ? (
            <div className="flex justify-center py-6">
              <svg className="animate-spin h-6 w-6 text-primary" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : !categories?.length ? (
            <p className="text-center text-gray-400 py-6">No hay categorías</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{cat.name}</p>
                    {cat.description && <p className="text-xs text-gray-400 truncate">{cat.description}</p>}
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-3">
                    <button onClick={() => { setEditing(cat); setForm({ name: cat.name, description: cat.description }); setAlert(null); setView("form"); }} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors" title="Editar">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button onClick={() => { setDeleting(cat); setAlert(null); setView("delete"); }} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors" title="Eliminar">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {view === "form" && (
        <div>
          {alert && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
              <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
              <span>{alert}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input type="text" value={form.name} onChange={(e) => { setForm({ ...form, name: e.target.value }); setAlert(null); }} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={resetToList} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">Volver</button>
              <button type="submit" disabled={isSaving} className="flex-1 bg-primary text-white py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {isSaving ? (<><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Guardando...</>) : editing ? "Actualizar" : "Crear"}
              </button>
            </div>
          </form>
        </div>
      )}

      {view === "delete" && (
        <div>
          <p className="text-gray-600 mb-6">¿Estás seguro de que deseas eliminar <span className="font-semibold text-gray-800">{deleting?.name}</span>? Esta acción no se puede deshacer.</p>
          <div className="flex gap-3">
            <button onClick={resetToList} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">Cancelar</button>
            <button onClick={handleDelete} className="flex-1 bg-red-500 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors">Eliminar</button>
          </div>
        </div>
      )}
    </Modal>
  );
}
