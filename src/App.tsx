import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { DefaultProviders } from "./components/providers/default.tsx";
import { useEffect } from "react";

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}
import Index from "./pages/Index.tsx";
import ShopPage from "./pages/shop/page.tsx";
import ProductPage from "./pages/product/page.tsx";
import CartPage from "./pages/cart/page.tsx";
import CheckoutPage from "./pages/checkout/page.tsx";
import OrderConfirmPage from "./pages/order-confirm/page.tsx";
import AdminPage from "./pages/admin/page.tsx";
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
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </DefaultProviders>
  );
}
