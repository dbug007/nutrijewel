import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import ServicesPage from './pages/ServicesPage';
import RecipesBlogPage from './pages/RecipesBlogPage';
import ContactPage from './pages/ContactPage';
// Birthday "Spin & Win" campaign — disabled. Un-comment to re-enable the wheel route.
// import SpinWheelPage from './pages/SpinWheelPage';
// import { CAMPAIGN_LIVE } from './data/birthdayOffers';
// import ThandaiCakePopup from './components/ThandaiCakePopup';
import './App.css';

function App() {
  return (
    <StoreProvider>
    <Router>
      <div className="App">
        <SmoothScroll />
        <ScrollToTopOnRouteChange />
        <TopMarquee />
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:slug" element={<ProductDetailPage />} />
          <Route path="/hampers" element={<HampersPage />} />
          {/* Occasion slug only preselects an occasion — same page, deep-linkable. */}
          <Route path="/hampers/:occasionSlug" element={<HampersPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/recipes-blog" element={<RecipesBlogPage />} />
          <Route path="/contact" element={<ContactPage />} />
          {/* Birthday "Spin & Win" campaign — disabled. Old campaign links redirect home. */}
          {/* Re-enable: un-comment the SpinWheelPage + CAMPAIGN_LIVE imports above and restore:
              <Route path="/spin" element={CAMPAIGN_LIVE ? <SpinWheelPage /> : <Navigate to="/" replace />} /> */}
          <Route path="/birthday" element={<Navigate to="/" replace />} />
          <Route path="/spin" element={<Navigate to="/" replace />} />
        </Routes>
        {/* <ThandaiCakePopup /> */}
        <Footer />
        <ScrollToTop />
        <CartDrawer />
        <WishlistDrawer />
        <StoreToast />
      </div>
    </Router>
    </StoreProvider>
  );
}

export default App;
