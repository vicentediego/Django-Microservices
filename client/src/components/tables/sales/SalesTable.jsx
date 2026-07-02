import { useState } from "react";
import {
  useGetSalesQuery,
  useCreateSaleMutation,
  useUpdateSaleMutation,
  useDeleteSaleMutation,
} from "../../../store/api/salesApi";
import { useGetProductsQuery } from "../../../store/api/inventoryApi";
import DataTable from "../DataTable";
import Modal from "../../ui/Modal";

const emptyForm = {
  product_id: "",
  quantity: "",
  description: "",
};

export default function SalesTable() {
  const { data: sales, isLoading, isError } = useGetSalesQuery();
  const { data: products } = useGetProductsQuery();
  const [createSale, { isLoading: isCreating }] = useCreateSaleMutation();
  const [updateSale, { isLoading: isUpdating }] = useUpdateSaleMutation();
  const [deleteSale] = useDeleteSaleMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [alert, setAlert] = useState(null);

  const columns = [
    { key: "id", label: "ID" },
    { key: "product_name", label: "Producto" },
    { key: "quantity", label: "Cantidad" },
    { key: "description", label: "Descripción" },
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
    { key: "time", label: "Hora" },
  ];

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setAlert(null);
    setModalOpen(true);
  };

  const openEdit = (sale) => {
    setEditing(sale);
    setForm({
      product_id: sale.product_id,
      quantity: sale.quantity,
      description: sale.description,
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

    if (!editing && !form.product_id) {
      setAlert("Selecciona un producto");
      return;
    }
    if (!form.quantity || Number(form.quantity) <= 0) {
      setAlert("La cantidad debe ser mayor a 0");
      return;
    }

    try {
      if (editing) {
        await updateSale({
          id: editing.id,
          quantity: Number(form.quantity),
          description: form.description,
        }).unwrap();
      } else {
        await createSale({
          product_id: Number(form.product_id),
          quantity: Number(form.quantity),
          description: form.description || "venta",
        }).unwrap();
      }
      setModalOpen(false);
    } catch (err) {
      const msg = err.data;
      if (typeof msg === "object") {
        const val = msg.error || Object.values(msg)[0];
        setAlert(Array.isArray(val) ? val[0] : String(val));
      } else {
        setAlert("Error al guardar venta");
      }
    }
  };

  const handleDelete = async () => {
    try {
      await deleteSale(deleting.id).unwrap();
      setDeleteModalOpen(false);
      setDeleting(null);
    } catch (err) {
      const msg = err.data;
      if (typeof msg === "object") {
        const val = msg.error || Object.values(msg)[0];
        setAlert(Array.isArray(val) ? val[0] : String(val));
      } else {
        setAlert("Error al eliminar venta");
      }
    }
  };

  const isSaving = isCreating || isUpdating;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Ventas</h1>
          <p className="text-gray-500 text-sm mt-1">Gestión de ventas</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva venta
        </button>
      </div>

      <DataTable
        columns={columns}
        data={sales}
        isLoading={isLoading}
        isError={isError}
        onEdit={openEdit}
        onDelete={(row) => { setDeleting(row); setDeleteModalOpen(true); }}
      />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar Venta" : "Nueva Venta"}>
        {alert && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
            <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
            <span>{alert}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!editing && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Producto</label>
              <select name="product_id" value={form.product_id} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white">
                <option value="">Seleccionar...</option>
                {products?.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} — Stock: {p.stock}</option>
                ))}
              </select>
            </div>
          )}
          {editing && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Producto</label>
              <input type="text" value={editing.product_name} disabled className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500" />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
            <input type="number" name="quantity" value={form.quantity} onChange={handleChange} min="1" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <input type="text" name="description" value={form.description} onChange={handleChange} placeholder="Descripción de la venta" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">Cancelar</button>
            <button type="submit" disabled={isSaving} className="flex-1 bg-primary text-white py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {isSaving ? (<><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Guardando...</>) : editing ? "Actualizar" : "Crear"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Eliminar Venta">
        <p className="text-gray-600 mb-6">
          ¿Estás seguro de que deseas eliminar la venta <span className="font-semibold text-gray-800">#{deleting?.id}</span>?
          El stock del producto se devolverá automáticamente.
        </p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteModalOpen(false)} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">Cancelar</button>
          <button onClick={handleDelete} className="flex-1 bg-red-500 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors">Eliminar</button>
        </div>
      </Modal>
    </div>
  );
}
