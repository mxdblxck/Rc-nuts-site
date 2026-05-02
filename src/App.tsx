import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { DefaultProviders } from "./components/providers/default.tsx";
import { useEffect, useState, useCallback } from "react";

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

// Admin auth check component
function AdminProtected({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const location = window.location;

  useEffect(() => {
    // Check both localStorage and sessionStorage
    const localSession = localStorage.getItem("admin_session");
    const sessionSession = sessionStorage.getItem("admin_session");
    
    if (localSession || sessionSession) {
      try {
        const session = JSON.parse(localSession || sessionSession || "{}");
        if (session.username && session.loginTime) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch {
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
    }
  }, [location.pathname]);

  if (isAuthenticated === null) {
    return null; // Loading
  }

  if (!isAuthenticated) {
    window.location.href = "/admin/login";
    return null;
  }

  return <>{children}</>;
}

import Index from "./pages/Index.tsx";
import ShopPage from "./pages/shop/page.tsx";
import ProductPage from "./pages/product/page.tsx";
import CartPage from "./pages/cart/page.tsx";
import CheckoutPage from "./pages/checkout/page.tsx";
import OrderConfirmPage from "./pages/order-confirm/page.tsx";
import AdminPage from "./pages/admin/page.tsx";
import AdminLoginPage from "./pages/admin/login/page.tsx";
import AdminSettingsPage from "./pages/admin/settings/page.tsx";
import AboutPage from "./pages/about/page.tsx";
import PacksPage from "./pages/packs/page.tsx";
import AuthCallback from "./pages/auth/Callback.tsx";
import NotFound from "./pages/NotFound.tsx";

export default function App() {
  return (
    <DefaultProviders>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/packs" element={<PacksPage />} />
          <Route path="/product/:slug" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-confirm/:orderId" element={<OrderConfirmPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/settings" element={
            <AdminProtected>
              <AdminSettingsPage />
            </AdminProtected>
          } />
          <Route path="/admin" element={
            <AdminProtected>
              <AdminPage />
            </AdminProtected>
          } />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </DefaultProviders>
  );
}
