import { useState } from "react";
import {
  useGetExpensesQuery,
  useGetExpenseCategoriesQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
} from "../../../store/api/expensesApi";
import DataTable from "../DataTable";
import Modal from "../../ui/Modal";
import ExpenseCategoriesModal from "../../ui/expenses/ExpenseCategoriesModal";

const emptyForm = {
  name: "",
  description: "",
  category_id: "",
  quantity: 1,
  unit_price: "",
};

export default function ExpensesTable() {
  const { data: expenses, isLoading, isError } = useGetExpensesQuery();
  const { data: categories } = useGetExpenseCategoriesQuery();
  const [createExpense, { isLoading: isCreating }] = useCreateExpenseMutation();
  const [updateExpense, { isLoading: isUpdating }] = useUpdateExpenseMutation();
  const [deleteExpense] = useDeleteExpenseMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [alert, setAlert] = useState(null);

  const columns = [
    { key: "id", label: "ID" },
    { key: "name", label: "Nombre" },
    {
      key: "category",
      label: "Categoría",
      render: (row) => row.category?.name || row.category,
    },
    { key: "description", label: "Descripción" },
    { key: "quantity", label: "Cantidad" },
    {
      key: "unit_price",
      label: "Precio Unit.",
      render: (row) => `$${Number(row.unit_price).toFixed(2)}`,
    },
    {
      key: "total",
      label: "Total",
      render: (row) => `$${Number(row.total).toFixed(2)}`,
    },
    { key: "date", label: "Fecha" },
  ];

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setAlert(null);
    setModalOpen(true);
  };

  const openEdit = (expense) => {
    setEditing(expense);
    setForm({
      name: expense.name,
      description: expense.description,
      category_id: expense.category?.id || expense.category,
      quantity: expense.quantity,
      unit_price: expense.unit_price,
    });
    setAlert(null);
    setModalOpen(true);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setAlert(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);

    if (!form.name.trim()) { setAlert("El nombre es requerido"); return; }
    if (!form.category_id) { setAlert("Selecciona una categoría"); return; }
    if (!form.quantity || Number(form.quantity) <= 0) { setAlert("La cantidad debe ser mayor a 0"); return; }
    if (!form.unit_price || Number(form.unit_price) <= 0) { setAlert("El precio unitario debe ser mayor a 0"); return; }

    const payload = {
      ...form,
      category_id: Number(form.category_id),
      quantity: Number(form.quantity),
      unit_price: Number(form.unit_price),
    };

    try {
      if (editing) {
        await updateExpense({ id: editing.id, ...payload }).unwrap();
      } else {
        await createExpense(payload).unwrap();
      }
      setModalOpen(false);
    } catch (err) {
      const msg = err.data;
      if (typeof msg === "object") {
        const first = Object.values(msg)[0];
        setAlert(Array.isArray(first) ? first[0] : String(first));
      } else {
        setAlert("Error al guardar gasto");
      }
    }
  };

  const handleDelete = async () => {
    try {
      await deleteExpense(deleting.id).unwrap();
      setDeleteModalOpen(false);
      setDeleting(null);
    } catch {
      setAlert("Error al eliminar gasto");
    }
  };

  const isSaving = isCreating || isUpdating;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gastos</h1>
          <p className="text-gray-500 text-sm mt-1">Gestión de gastos</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setCategoryModalOpen(true)} className="flex items-center gap-2 border border-primary text-primary px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-light transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" /></svg>
            Categorías
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Agregar gasto
          </button>
        </div>
      </div>

      <DataTable columns={columns} data={expenses} isLoading={isLoading} isError={isError} onEdit={openEdit} onDelete={(row) => { setDeleting(row); setDeleteModalOpen(true); }} />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar Gasto" : "Nuevo Gasto"}>
        {alert && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
            <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
            <span>{alert}</span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select name="category_id" value={form.category_id} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white">
              <option value="">Seleccionar...</option>
              {categories?.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={2} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
              <input type="number" name="quantity" value={form.quantity} onChange={handleChange} min="1" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio Unitario</label>
              <input type="number" name="unit_price" value={form.unit_price} onChange={handleChange} step="0.01" min="0" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
            </div>
          </div>
          {form.quantity && form.unit_price && (
            <p className="text-sm text-gray-500">
              Total: <span className="font-medium text-gray-800">${(Number(form.quantity) * Number(form.unit_price)).toFixed(2)}</span>
            </p>
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">Cancelar</button>
            <button type="submit" disabled={isSaving} className="flex-1 bg-primary text-white py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {isSaving ? (<><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Guardando...</>) : editing ? "Actualizar" : "Crear"}
            </button>
          </div>
        </form>
      </Modal>

      <ExpenseCategoriesModal isOpen={categoryModalOpen} onClose={() => setCategoryModalOpen(false)} />

      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Eliminar Gasto">
        <p className="text-gray-600 mb-6">¿Estás seguro de que deseas eliminar <span className="font-semibold text-gray-800">{deleting?.name}</span>? Esta acción no se puede deshacer.</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteModalOpen(false)} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">Cancelar</button>
          <button onClick={handleDelete} className="flex-1 bg-red-500 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors">Eliminar</button>
        </div>
      </Modal>
    </div>
  );
}
