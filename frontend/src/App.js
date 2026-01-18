import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import Login from './components/Login';
import POS from './components/POS';
import Reports from './components/Reports';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/pos" element={
                        <ProtectedRoute>
                            <POS />
                        </ProtectedRoute>
                    } />
                    <Route path="/reports" element={
                        <ProtectedRoute>
                            <Reports />
                        </ProtectedRoute>
                    } />
                    <Route path="/" element={<Navigate to="/login" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;