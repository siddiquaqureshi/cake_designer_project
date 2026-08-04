import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CakeProvider } from "./context/CakeContext";
import Navbar from "./components/Navbar";
import GlobalSvgDefs from "./components/GlobalSvgDefs";
import Home from "./pages/Home";
import Decorate from "./pages/Decorate";
import OrderPage from "./pages/OrderPage";
import OrderSuccess from "./pages/OrderSuccess";
import OrderCancel from "./pages/OrderCancel";
import BakerDashboard from "./pages/BakerDashboard";

export default function App() {
  return (
    <AuthProvider>
      <CakeProvider>
        <div className="min-h-screen flex flex-col">
          <GlobalSvgDefs />
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/decorate" element={<Navigate to="/decorate/shape" replace />} />
              <Route path="/decorate/:step" element={<Decorate />} />
              <Route path="/order" element={<OrderPage />} />
              <Route path="/order/success" element={<OrderSuccess />} />
              <Route path="/order/cancel" element={<OrderCancel />} />
              <Route path="/admin" element={<BakerDashboard />} />
              <Route path="/baker" element={<BakerDashboard />} />
              <Route path="/admin/orders" element={<BakerDashboard />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <footer className="text-center text-xs text-ink-soft py-6">
            Made with 🩷 for your next celebration.
          </footer>
        </div>
      </CakeProvider>
    </AuthProvider>
  );
}
