import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import TopMarquee from './components/TopMarquee';
import ScrollToTop from './components/ScrollToTop';
import ScrollToTopOnRouteChange from './components/ScrollToTopOnRouteChange';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ProductsPage from './pages/ProductsPage';
import ServicesPage from './pages/ServicesPage';
import RecipesBlogPage from './pages/RecipesBlogPage';
import ContactPage from './pages/ContactPage';
// import ThandaiCakePopup from './components/ThandaiCakePopup';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <ScrollToTopOnRouteChange />
        <TopMarquee />
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/recipes-blog" element={<RecipesBlogPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
        {/* <ThandaiCakePopup /> */}
        <Footer />
        <ScrollToTop />
      </div>
    </Router>
  );
}

export default App;
