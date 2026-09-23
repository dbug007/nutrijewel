import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import TopMarquee from './components/TopMarquee';
import ScrollToTop from './components/ScrollToTop';
import ScrollToTopOnRouteChange from './components/ScrollToTopOnRouteChange';
import SmoothScroll from './components/SmoothScroll';
import Footer from './components/Footer';
import { StoreProvider } from './store/StoreContext';
import CartDrawer from './components/store/CartDrawer';
import WishlistDrawer from './components/store/WishlistDrawer';
import StoreToast from './components/store/StoreToast';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import HampersPage from './pages/HampersPage';
import { HAMPERS_ENABLED } from './data/hampers';
import ServicesPage from './pages/ServicesPage';
import RecipesBlogPage from './pages/RecipesBlogPage';
import ContactPage from './pages/ContactPage';
import AdminPage from './pages/AdminPage';
// Birthday "Spin & Win" campaign, disabled. Un-comment to re-enable the wheel route.
// import SpinWheelPage from './pages/SpinWheelPage';
// import { CAMPAIGN_LIVE } from './data/birthdayOffers';
// import ThandaiCakePopup from './components/ThandaiCakePopup';
import './App.css';

/* The order desk is a private tool, not a shop page: no marquee, no navbar, no
   footer, no cart drawer. Split out so it can read the current route, which
   needs to happen inside <Router>. */
function AppShell() {
  const isAdmin = useLocation().pathname.startsWith('/admin');
  return (
    <div className="App">
      {!isAdmin && <SmoothScroll />}
      <ScrollToTopOnRouteChange />
      {!isAdmin && <TopMarquee />}
      {!isAdmin && <Navbar />}
      <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:slug" element={<ProductDetailPage />} />
          {/* Gifting sits behind HAMPERS_ENABLED in src/data/hampers.data.js. While
              it is off, old hamper links land on the shop rather than nothing. */}
          {HAMPERS_ENABLED ? (
            <>
              <Route path="/hampers" element={<HampersPage />} />
              {/* Occasion slug only preselects an occasion, same page, deep-linkable. */}
              <Route path="/hampers/:occasionSlug" element={<HampersPage />} />
            </>
          ) : (
            <>
              <Route path="/hampers" element={<Navigate to="/products" replace />} />
              <Route path="/hampers/:occasionSlug" element={<Navigate to="/products" replace />} />
            </>
          )}
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/recipes-blog" element={<RecipesBlogPage />} />
          <Route path="/contact" element={<ContactPage />} />
          {/* Order desk. Private: excluded from the sitemap, disallowed in
              robots.txt, and the API behind it refuses without a token. Put
              Cloudflare Access in front of /admin and /api/admin/* as well. */}
          <Route path="/admin" element={<AdminPage />} />
          {/* Birthday "Spin & Win" campaign disabled. Old campaign links redirect home. */}
          {/* Re-enable: un-comment the SpinWheelPage + CAMPAIGN_LIVE imports above and restore:
              <Route path="/spin" element={CAMPAIGN_LIVE ? <SpinWheelPage /> : <Navigate to="/" replace />} /> */}
          <Route path="/birthday" element={<Navigate to="/" replace />} />
          <Route path="/spin" element={<Navigate to="/" replace />} />
        </Routes>
      {!isAdmin && (
        <>
          <Footer />
          <ScrollToTop />
          <CartDrawer />
          <WishlistDrawer />
          <StoreToast />
        </>
      )}
    </div>
  );
}

function App() {
  return (
    <StoreProvider>
      <Router>
        <AppShell />
      </Router>
    </StoreProvider>
  );
}

export default App;
