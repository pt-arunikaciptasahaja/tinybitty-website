import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./components/home";
import FAQPage from "./components/FAQPage";
import IngredientsPage from "./components/IngredientsPage";
import OurStoryPage from "./components/OurStoryPage";
import NotFound from "./components/NotFound";
import ScrollToTop from "./components/ScrollToTop";
import { AuthProvider } from "./contexts/AuthContext";
import AuthGuard from "./components/admin/AuthGuard";
import AdminLayout from "./components/admin/AdminLayout";

// Lazy-load admin pages so they're not bundled with the public site
const AdminLoginPage = lazy(() => import("./pages/admin/AdminLoginPage"));
const AdminDashboardPage = lazy(() => import("./pages/admin/AdminDashboardPage"));

function App() {
  return (
    <AuthProvider>
      <div className="global-container">
        <ScrollToTop />
        <Suspense fallback={<p>Loading...</p>}>
          <Routes>
            {/* Public storefront routes */}
            <Route path="/" element={<Home />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/ingredients" element={<IngredientsPage />} />
            <Route path="/our-story" element={<OurStoryPage />} />

            {/* Admin routes */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route
              path="/admin"
              element={
                <AuthGuard>
                  <AdminLayout />
                </AuthGuard>
              }
            >
              <Route index element={<AdminDashboardPage />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </div>
    </AuthProvider>
  );
}

export default App;
