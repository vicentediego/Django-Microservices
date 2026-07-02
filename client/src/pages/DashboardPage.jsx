import { useGetProductsQuery } from "../store/api/inventoryApi";
import { useGetSalesQuery } from "../store/api/salesApi";
import { useGetExpensesQuery } from "../store/api/expensesApi";

function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-500">{title}</span>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { data: products, isLoading: loadingProducts } = useGetProductsQuery();
  const { data: sales, isLoading: loadingSales } = useGetSalesQuery();
  const { data: expenses, isLoading: loadingExpenses } = useGetExpensesQuery();

  const isLoading = loadingProducts || loadingSales || loadingExpenses;

  const totalSales = sales?.reduce((sum, s) => sum + Number(s.total), 0) || 0;
  const totalExpenses = expenses?.reduce((sum, e) => sum + Number(e.total), 0) || 0;
  const balance = totalSales - totalExpenses;

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <svg className="animate-spin h-8 w-8 text-primary" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

      {/* Tarjetas resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Ventas"
          value={`$${totalSales.toFixed(2)}`}
          color="bg-green-100"
          icon={<svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
        />
        <StatCard
          title="Total Gastos"
          value={`$${totalExpenses.toFixed(2)}`}
          color="bg-red-100"
          icon={<svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>}
        />
        <StatCard
          title="Balance"
          value={`$${balance.toFixed(2)}`}
          color={balance >= 0 ? "bg-primary-light" : "bg-red-100"}
          icon={<svg className={`w-5 h-5 ${balance >= 0 ? "text-primary" : "text-red-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard
          title="Productos"
          value={products?.length || 0}
          color="bg-blue-100"
          icon={<svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock de productos */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Stock de Productos</h2>
          {!products?.length ? (
            <p className="text-gray-400 text-sm text-center py-4">No hay productos</p>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {products.map((p) => (
                <div key={p.id} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 truncate">{p.name}</span>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <div className="w-24 bg-gray-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${p.stock <= p.min_stock ? "bg-red-500" : "bg-primary"}`}
                        style={{ width: `${Math.min(100, (p.stock / Math.max(p.min_stock * 3, 1)) * 100)}%` }}
                      />
                    </div>
                    <span className={`text-sm font-medium w-10 text-right ${p.stock <= p.min_stock ? "text-red-500" : "text-gray-700"}`}>
                      {p.stock}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Últimas ventas */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Últimas Ventas</h2>
          {!sales?.length ? (
            <p className="text-gray-400 text-sm text-center py-4">No hay ventas</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 text-xs uppercase border-b border-gray-100">
                    <th className="text-left py-2 font-medium">Producto</th>
                    <th className="text-left py-2 font-medium">Cant.</th>
                    <th className="text-right py-2 font-medium">Total</th>
                    <th className="text-right py-2 font-medium">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.slice(-10).reverse().map((s) => (
                    <tr key={s.id} className="border-b border-gray-50">
                      <td className="py-2 text-gray-700">{s.product_name}</td>
                      <td className="py-2 text-gray-600">{s.quantity}</td>
                      <td className="py-2 text-right text-gray-700 font-medium">${Number(s.total).toFixed(2)}</td>
                      <td className="py-2 text-right text-gray-400 text-xs">{s.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Últimos gastos */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Últimos Gastos</h2>
          {!expenses?.length ? (
            <p className="text-gray-400 text-sm text-center py-4">No hay gastos</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 text-xs uppercase border-b border-gray-100">
                    <th className="text-left py-2 font-medium">Nombre</th>
                    <th className="text-left py-2 font-medium">Categoría</th>
                    <th className="text-right py-2 font-medium">Total</th>
                    <th className="text-right py-2 font-medium">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.slice(-10).reverse().map((e) => (
                    <tr key={e.id} className="border-b border-gray-50">
                      <td className="py-2 text-gray-700">{e.name}</td>
                      <td className="py-2 text-gray-600">{e.category?.name || e.category}</td>
                      <td className="py-2 text-right text-red-500 font-medium">${Number(e.total).toFixed(2)}</td>
                      <td className="py-2 text-right text-gray-400 text-xs">{e.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Resumen ventas vs gastos */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Ventas vs Gastos</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Ventas</span>
                <span className="font-medium text-green-600">${totalSales.toFixed(2)}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div
                  className="bg-green-500 h-3 rounded-full transition-all"
                  style={{ width: `${totalSales + totalExpenses > 0 ? (totalSales / (totalSales + totalExpenses)) * 100 : 50}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Gastos</span>
                <span className="font-medium text-red-500">${totalExpenses.toFixed(2)}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div
                  className="bg-red-500 h-3 rounded-full transition-all"
                  style={{ width: `${totalSales + totalExpenses > 0 ? (totalExpenses / (totalSales + totalExpenses)) * 100 : 50}%` }}
                />
              </div>
            </div>
            <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
              <span className="text-sm text-gray-600">Balance</span>
              <span className={`text-lg font-bold ${balance >= 0 ? "text-primary" : "text-red-500"}`}>
                {balance >= 0 ? "+" : ""}${balance.toFixed(2)}
              </span>
            </div>
            <div className="flex gap-4 text-xs text-gray-400">
              <span>Ventas: {sales?.length || 0} registros</span>
              <span>Gastos: {expenses?.length || 0} registros</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
