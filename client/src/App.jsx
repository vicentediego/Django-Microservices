import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import Layout from "./components/layout/Layout";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/products/ProductsPage";
import ProductMovementsPage from "./pages/products/ProductMovementsPage";
import RawMaterialsPage from "./pages/raw-materials/RawMaterialsPage";
import RawMaterialMovementsPage from "./pages/raw-materials/RawMaterialMovementsPage";
import SalesPage from "./pages/sales/SalesPage";
import ExpensesPage from "./pages/expenses/ExpensesPage";
import ReportsPage from "./pages/reports/ReportsPage";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/inventory/products" element={<ProductsPage />} />
                    <Route path="/inventory/products/movements" element={<ProductMovementsPage />} />
                    <Route path="/inventory/raw-materials" element={<RawMaterialsPage />} />
                    <Route path="/inventory/raw-materials/movements" element={<RawMaterialMovementsPage />} />
                    <Route path="/sales" element={<SalesPage />} />
                    <Route path="/expenses" element={<ExpensesPage />} />
                    <Route path="/reports" element={<ReportsPage />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
