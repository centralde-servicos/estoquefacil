import React, { useState } from 'react';
import api from '../services/api';
import { Key, Eye, EyeOff } from 'lucide-react';

const AlterarSenha = () => {
    const [senhaAtual, setSenhaAtual] = useState('');
    const [novaSenha, setNovaSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [showSenha, setShowSenha] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (novaSenha !== confirmarSenha) {
            return setMessage({ text: 'As senhas não coincidem', type: 'error' });
        }
        setLoading(true);
        try {
            await api.post('/alterar-senha', { senhaAtual, novaSenha });
            setMessage({ text: 'Senha alterada com sucesso!', type: 'success' });
            setSenhaAtual('');
            setNovaSenha('');
            setConfirmarSenha('');
        } catch (error) {
            setMessage({ text: error.response?.data?.message || 'Erro ao alterar senha', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>Alterar Senha</h1>

            <div className="card" style={{ maxWidth: '400px', marginTop: '2rem' }}>
                {message.text && (
                    <div className={`badge ${message.type === 'error' ? 'badge-danger' : 'badge-success'}`} 
                         style={{ display: 'block', marginBottom: '1rem', textAlign: 'center', backgroundColor: message.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : '' }}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleUpdate}>
                    <label>Senha Atual</label>
                    <div style={{ position: 'relative' }}>
                        <input type={showSenha ? "text" : "password"} value={senhaAtual} onChange={e => setSenhaAtual(e.target.value)} required />
                    </div>

                    <label>Nova Senha</label>
                    <div style={{ position: 'relative' }}>
                        <input type={showSenha ? "text" : "password"} value={novaSenha} onChange={e => setNovaSenha(e.target.value)} required minLength="6" />
                    </div>

                    <label>Confirmar Nova Senha</label>
                    <div style={{ position: 'relative' }}>
                        <input type={showSenha ? "text" : "password"} value={confirmarSenha} onChange={e => setConfirmarSenha(e.target.value)} required minLength="6" />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                        <button type="button" onClick={() => setShowSenha(!showSenha)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            {showSenha ? <EyeOff size={18} /> : <Eye size={18} />} {showSenha ? 'Ocultar' : 'Mostrar'} Senha
                        </button>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }} disabled={loading}>
                        <Key size={18} /> {loading ? 'Atualizando...' : 'Atualizar Senha'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AlterarSenha;
