import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function TestComponent() {
  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <h1>NutriJewel Test Page</h1>
      <p>If you can see this, React is working!</p>
      <p>Current path: {window.location.pathname}</p>
      <p>Full URL: {window.location.href}</p>
    </div>
  );
}

function TestApp() {
  return (
    <Router basename="/nutrijewel">
      <div className="App">
        <Routes>
          <Route path="/" element={<TestComponent />} />
        </Routes>
      </div>
    </Router>
  );
}

export default TestApp;
