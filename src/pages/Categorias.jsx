import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Trash2, Plus } from 'lucide-react';

const Categorias = () => {
    const [categorias, setCategorias] = useState([]);
    const [novaCategoria, setNovaCategoria] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchCategorias();
    }, []);

    const fetchCategorias = async () => {
        try {
            const response = await api.get('/categorias');
            setCategorias(response.data);
        } catch (error) {
            console.error('Erro ao buscar categorias', error);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!novaCategoria.trim()) return;
        setLoading(true);
        try {
            await api.post('/categorias', { nome: novaCategoria });
            setNovaCategoria('');
            fetchCategorias();
        } catch (error) {
            console.error('Erro ao adicionar categoria', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Tem certeza que deseja excluir esta categoria?')) return;
        try {
            await api.delete(`/categorias/${id}`);
            fetchCategorias();
        } catch (error) {
            alert('Erro ao excluir: verifique se há itens nesta categoria.');
        }
    };

    return (
        <div>
            <h1>Categorias</h1>

            <div className="card" style={{ maxWidth: '600px', marginTop: '2rem' }}>
                <form onSubmit={handleAdd} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <input 
                        type="text" 
                        placeholder="Nome da nova categoria" 
                        value={novaCategoria} 
                        onChange={e => setNovaCategoria(e.target.value)}
                        required
                        style={{ marginBottom: 0 }}
                    />
                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Plus size={20} /> Adicionar
                    </button>
                </form>

                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th style={{ textAlign: 'right' }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categorias.map(cat => (
                                <tr key={cat.id}>
                                    <td>{cat.nome}</td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button onClick={() => handleDelete(cat.id)} className="btn btn-danger" style={{ padding: '0.5rem' }}>
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Categorias;
