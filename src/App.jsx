import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Itens from './pages/Itens';
import Categorias from './pages/Categorias';
import AlterarSenha from './pages/AlterarSenha';
import Login from './pages/Login';
import './App.css';

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div>Carregando...</div>;
    return user ? children : <Navigate to="/login" />;
};

const Layout = ({ children }) => (
    <div className="app-container">
        <Sidebar />
        <main className="main-content">
            {children}
        </main>
    </div>
);

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
                    <Route path="/itens" element={<PrivateRoute><Layout><Itens /></Layout></PrivateRoute>} />
                    <Route path="/categorias" element={<PrivateRoute><Layout><Categorias /></Layout></PrivateRoute>} />
                    <Route path="/alterar-senha" element={<PrivateRoute><Layout><AlterarSenha /></Layout></PrivateRoute>} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
