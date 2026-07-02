import { useState } from "react";
import { Link } from "react-router-dom";
import {
  useGetRawMaterialMovementsQuery,
  useGetRawMaterialsQuery,
  useCreateRawMaterialMovementMutation,
  useUpdateRawMaterialMovementMutation,
  useDeleteRawMaterialMovementMutation,
} from "../../../store/api/rawMaterialsApi";
import DataTable from "../DataTable";
import Modal from "../../ui/Modal";

const emptyForm = {
  raw_material: "",
  quantity: "",
  type_of: "stock_in",
  description: "",
};

export default function RawMaterialMovementsTable() {
  const { data: movements, isLoading, isError } = useGetRawMaterialMovementsQuery();
  const { data: materials } = useGetRawMaterialsQuery();
  const [createMovement, { isLoading: isCreating }] = useCreateRawMaterialMovementMutation();
  const [updateMovement, { isLoading: isUpdating }] = useUpdateRawMaterialMovementMutation();
  const [deleteMovement] = useDeleteRawMaterialMovementMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [alert, setAlert] = useState(null);

  const columns = [
    { key: "id", label: "ID" },
    {
      key: "raw_material",
      label: "Insumo",
      render: (row) => {
        const mat = materials?.find((m) => m.id === row.raw_material);
        return mat?.name || row.raw_material;
      },
    },
    {
      key: "type_of",
      label: "Tipo",
      render: (row) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          row.type_of === "stock_in" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}>
          {row.type_of === "stock_in" ? "Entrada" : "Salida"}
        </span>
      ),
    },
    { key: "quantity", label: "Cantidad" },
    { key: "description", label: "Descripción" },
    { key: "date", label: "Fecha" },
    { key: "time", label: "Hora" },
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setAlert(null);
  };

  const openEdit = (movement) => {
    setEditing(movement);
    setForm({
      raw_material: movement.raw_material,
      quantity: movement.quantity,
      type_of: movement.type_of,
      description: movement.description,
    });
    setAlert(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);

    if (!form.raw_material) { setAlert("Selecciona un insumo"); return; }
    if (!form.quantity || Number(form.quantity) <= 0) { setAlert("La cantidad debe ser mayor a 0"); return; }

    const payload = {
      ...form,
      raw_material: Number(form.raw_material),
      quantity: Number(form.quantity),
    };

    try {
      if (editing) {
        await updateMovement({ id: editing.id, ...payload }).unwrap();
      } else {
        await createMovement(payload).unwrap();
      }
      setModalOpen(false);
      setEditing(null);
      setForm(emptyForm);
    } catch (err) {
      const msg = err.data;
      if (typeof msg === "object") {
        const first = Object.values(msg)[0];
        setAlert(Array.isArray(first) ? first[0] : String(first));
      } else {
        setAlert("Error al guardar movimiento");
      }
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMovement(deleting.id).unwrap();
      setDeleteModalOpen(false);
      setDeleting(null);
    } catch (err) {
      const msg = err.data;
      if (typeof msg === "object") {
        const first = Object.values(msg)[0];
        setAlert(Array.isArray(first) ? first[0] : String(first));
      } else {
        setAlert("Error al eliminar movimiento");
      }
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/inventory/raw-materials" className="text-primary hover:underline text-sm">Materias Primas</Link>
            <span className="text-gray-400 text-sm">/</span>
            <span className="text-gray-500 text-sm">Movimientos</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Movimientos de Insumos</h1>
          <p className="text-gray-500 text-sm mt-1">Entradas y salidas de insumos</p>
        </div>
        <button
          onClick={() => { setEditing(null); setForm(emptyForm); setAlert(null); setModalOpen(true); }}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Registrar movimiento
        </button>
      </div>

      <DataTable columns={columns} data={movements} isLoading={isLoading} isError={isError} onEdit={openEdit} onDelete={(row) => { setDeleting(row); setDeleteModalOpen(true); }} />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar Movimiento" : "Nuevo Movimiento"}>
        {alert && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
            <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
            <span>{alert}</span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Insumo</label>
            <select name="raw_material" value={form.raw_material} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white">
              <option value="">Seleccionar...</option>
              {materials?.map((m) => (<option key={m.id} value={m.id}>{m.name}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select name="type_of" value={form.type_of} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white">
              <option value="stock_in">Entrada</option>
              <option value="stock_out">Salida</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
            <input type="number" name="quantity" value={form.quantity} onChange={handleChange} min="1" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <input type="text" name="description" value={form.description} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="Motivo del movimiento" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">Cancelar</button>
            <button type="submit" disabled={isCreating || isUpdating} className="flex-1 bg-primary text-white py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {(isCreating || isUpdating) ? (<><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Guardando...</>) : editing ? "Actualizar" : "Registrar"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Eliminar Movimiento">
        <p className="text-gray-600 mb-6">¿Estás seguro de que deseas eliminar este movimiento? El stock del insumo se ajustará automáticamente.</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteModalOpen(false)} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">Cancelar</button>
          <button onClick={handleDelete} className="flex-1 bg-red-500 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors">Eliminar</button>
        </div>
      </Modal>
    </div>
  );
}
