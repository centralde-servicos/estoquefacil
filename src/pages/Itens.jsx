import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Trash2, Plus, Edit, ArrowUpRight, ArrowDownRight, AlertTriangle } from 'lucide-react';

const Itens = () => {
    const [itens, setItens] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [modal, setModal] = useState({ show: false, type: 'add', item: null });
    const [movementModal, setMovementModal] = useState({ show: false, type: 'entrada', item: null });
    const [formData, setFormData] = useState({ nome: '', minimo: 0, categoria_id: '' });
    const [movementData, setMovementData] = useState({ quantidade: 1, observacao: '' });

    useEffect(() => {
        fetchItens();
        fetchCategorias();
    }, []);

    const fetchItens = async () => {
        try {
            const response = await api.get('/itens');
            setItens(response.data);
        } catch (error) {
            console.error('Erro ao buscar itens', error);
        }
    };

    const fetchCategorias = async () => {
        try {
            const response = await api.get('/categorias');
            setCategorias(response.data);
        } catch (error) {
            console.error('Erro ao buscar categorias', error);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (modal.type === 'add') {
                await api.post('/itens', { ...formData, quantidade: 0 });
            } else {
                await api.put(`/itens/${modal.item.id}`, formData);
            }
            setModal({ show: false, type: 'add', item: null });
            fetchItens();
        } catch (error) {
            alert('Erro ao salvar item');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Excluir item permanentemente?')) return;
        try {
            await api.delete(`/itens/${id}`);
            fetchItens();
        } catch (error) {
            alert('Erro ao excluir item');
        }
    };

    const handleMovement = async (e) => {
        e.preventDefault();
        try {
            const endpoint = movementModal.type === 'entrada' ? '/entrada' : '/saida';
            await api.post(endpoint, { 
                item_id: movementModal.item.id, 
                quantidade: movementData.quantidade, 
                observacao: movementData.observacao 
            });
            setMovementModal({ show: false, type: 'entrada', item: null });
            setMovementData({ quantidade: 1, observacao: '' });
            fetchItens();
        } catch (error) {
            alert(error.response?.data?.message || 'Erro ao processar movimentação');
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Estoque</h1>
                <button className="btn btn-primary" onClick={() => {
                    setFormData({ nome: '', minimo: 0, categoria_id: categorias[0]?.id || '' });
                    setModal({ show: true, type: 'add', item: null });
                }} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Plus size={20} /> Novo Item
                </button>
            </div>

            <div className="card">
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Categoria</th>
                                <th>Qtd</th>
                                <th>Mínimo</th>
                                <th style={{ textAlign: 'center' }}>Status</th>
                                <th style={{ textAlign: 'right' }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {itens.map(item => (
                                <tr key={item.id}>
                                    <td style={{ fontWeight: '600' }}>{item.nome}</td>
                                    <td>{item.categoria_nome || 'S/ Categoria'}</td>
                                    <td>{item.quantidade}</td>
                                    <td>{item.minimo}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        {item.quantidade <= item.minimo ? (
                                            <span className="badge badge-danger" title="Estoque Baixo" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                                <AlertTriangle size={14} /> Crítico
                                            </span>
                                        ) : (
                                            <span className="badge" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>Normal</span>
                                        )}
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                            <button className="btn" title="Entrada" style={{ backgroundColor: '#22c55e', color: 'white', padding: '8px' }} 
                                                    onClick={() => setMovementModal({ show: true, type: 'entrada', item })}>
                                                <ArrowUpRight size={18} />
                                            </button>
                                            <button className="btn" title="Saída" style={{ backgroundColor: '#ef4444', color: 'white', padding: '8px' }}
                                                    onClick={() => setMovementModal({ show: true, type: 'saida', item })}>
                                                <ArrowDownRight size={18} />
                                            </button>
                                            <button className="btn" title="Editar" style={{ backgroundColor: '#3b82f6', color: 'white', padding: '8px' }}
                                                    onClick={() => {
                                                        setFormData({ nome: item.nome, minimo: item.minimo, categoria_id: item.categoria_id });
                                                        setModal({ show: true, type: 'edit', item });
                                                    }}>
                                                <Edit size={18} />
                                            </button>
                                            <button className="btn btn-danger" title="Excluir" style={{ padding: '8px' }} onClick={() => handleDelete(item.id)}>
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de Item */}
            {modal.show && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div className="card" style={{ width: '90%', maxWidth: '400px' }}>
                        <h3>{modal.type === 'add' ? 'Adicionar Novo Item' : 'Editar Item'}</h3>
                        <form onSubmit={handleSave} style={{ marginTop: '1.5rem' }}>
                            <label>Nome do Item</label>
                            <input type="text" value={formData.nome} onChange={e => setFormData({ ...formData, nome: e.target.value })} required />
                            
                            <label>Categoria</label>
                            <select value={formData.categoria_id} onChange={e => setFormData({ ...formData, categoria_id: e.target.value })} required>
                                <option value="">Selecione...</option>
                                {categorias.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.nome}</option>
                                ))}
                            </select>

                            <label>Quantidade Mínima</label>
                            <input type="number" value={formData.minimo} onChange={e => setFormData({ ...formData, minimo: e.target.value })} required />

                            <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                                <button type="button" className="btn btn-danger" style={{ flex: 1 }} onClick={() => setModal({ ...modal, show: false })}>Cancelar</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Salvar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Movimentação */}
            {movementModal.show && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div className="card" style={{ width: '90%', maxWidth: '400px' }}>
                        <h3>{movementModal.type === 'entrada' ? 'Entrada de Estoque' : 'Saída de Estoque'}</h3>
                        <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.5rem' }}>Item: {movementModal.item.nome}</p>
                        
                        <form onSubmit={handleMovement} style={{ marginTop: '1.5rem' }}>
                            <label>Quantidade</label>
                            <input type="number" min="1" value={movementData.quantidade} onChange={e => setMovementData({ ...movementData, quantidade: e.target.value })} required />

                            <label>Observação (Opcional)</label>
                            <textarea value={movementData.observacao} onChange={e => setMovementData({ ...movementData, observacao: e.target.value })} rows="3"></textarea>

                            <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                                <button type="button" className="btn btn-danger" style={{ flex: 1 }} onClick={() => setMovementModal({ ...movementModal, show: false })}>Cancelar</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Confirmar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Itens;
