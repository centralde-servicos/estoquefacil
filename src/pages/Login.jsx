import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, User } from 'lucide-react';

const Login = () => {
    const [usuario, setUsuario] = useState('');
    const [senha, setSenha] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(usuario, senha);
            navigate('/');
        } catch (err) {
            setError('Usuário ou senha incorretos');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="card login-card">
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <img src="/estoquefacil.png" alt="Logo" style={{ maxWidth: '180px' }} />
                    <h2 style={{ marginTop: '1rem', color: '#f8fafc' }}>Painel Administrativo</h2>
                </div>

                {error && <div className="badge badge-danger" style={{ display: 'block', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={{ position: 'relative' }}>
                        <User size={18} style={{ position: 'absolute', top: '15px', left: '10px', color: '#94a3b8' }} />
                        <input 
                            type="text" 
                            placeholder="Usuário" 
                            value={usuario} 
                            onChange={e => setUsuario(e.target.value)}
                            style={{ paddingLeft: '40px' }}
                            required
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Lock size={18} style={{ position: 'absolute', top: '15px', left: '10px', color: '#94a3b8' }} />
                        <input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="Senha" 
                            value={senha} 
                            onChange={e => setSenha(e.target.value)}
                            style={{ paddingLeft: '40px' }}
                            required
                        />
                        <button 
                            type="button" 
                            onClick={() => setShowPassword(!showPassword)}
                            style={{ position: 'absolute', top: '12px', right: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1rem' }} disabled={loading}>
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
