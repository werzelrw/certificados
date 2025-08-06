import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { CheckInOut } from './components/CheckInOut';
import { Certificates } from './components/Certificates';
import { Configuration } from './components/Configuration';
import { PWA } from './components/PWA';
import { PWAInstall } from './components/PWAInstall';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/checkin" element={<CheckInOut />} />
          <Route path="/certificates" element={<Certificates />} />
          <Route path="/config" element={<Configuration />} />
          <Route path="/pwa" element={<PWA />} />
        </Routes>
      </Layout>
      <PWAInstall />
    </Router>
  );
}

export default App;