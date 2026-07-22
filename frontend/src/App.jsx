import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Event from './components/Event';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import ImageGalleryEvent from './components/ImageGalleryEvent';
import Organiser from './components/Organiser';
import Help from './components/Help';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/connexion" element={<Login />} />
        <Route path="/evenement/:id" element={<ImageGalleryEvent />} />
        <Route path="/aide" element={<Help />} /> 


        <Route
          path="/creer-evenement"
          element={
            <ProtectedRoute>
              <Event />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organiser"
          element={
            <ProtectedRoute>
              <Organiser />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;