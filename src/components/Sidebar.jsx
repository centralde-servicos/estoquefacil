import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, Tags, LogOut, Key } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { logout } = useAuth();

    return (
        <aside className="sidebar">
            <div className="logo-container">
                <img src="/estoquefacil.png" alt="Estoque Fácil" />
            </div>
            <nav className="nav-links">
                <li className="nav-item">
                    <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} end>
                        <LayoutDashboard size={22} />
                        <span>Dashboard</span>
                    </NavLink>
                </li>
                <li className="nav-item">
                    <NavLink to="/itens" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                        <Package size={22} />
                        <span>Estoque</span>
                    </NavLink>
                </li>
                <li className="nav-item">
                    <NavLink to="/categorias" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                        <Tags size={22} />
                        <span>Categorias</span>
                    </NavLink>
                </li>
                <li className="nav-item">
                    <NavLink to="/alterar-senha" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                        <Key size={22} />
                        <span>Alterar Senha</span>
                    </NavLink>
                </li>
            </nav>
            <div className="nav-item">
                <button onClick={logout} className="nav-link logout-btn" style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer' }}>
                    <LogOut size={22} />
                    <span>Sair</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
