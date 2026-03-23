import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Line } from 'react-chartjs-2';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
    Chart as ChartJS, 
    CategoryScale, 
    LinearScale, 
    PointElement, 
    LineElement, 
    Title, 
    Tooltip, 
    Legend,
    Filler
} from 'chart.js';
import { Package, TrendingUp, TrendingDown, AlertCircle, FileText, Download } from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [chartData, setChartData] = useState(null);
    const [rawMovements, setRawMovements] = useState({ entradas: [], saidas: [] });
    const [dates, setDates] = useState({
        inicio: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
        fim: format(new Date(), 'yyyy-MM-dd')
    });
    
    // Estados para o Modal de Relatório PDF
    const [showReportModal, setShowReportModal] = useState(false);
    const [itens, setItens] = useState([]);
    const [reportFilter, setReportFilter] = useState({
        item_id: 'todos',
        tipo: 'todos'
    });

    useEffect(() => {
        fetchStats();
        fetchChartData();
        fetchItens();
    }, [dates]);

    const fetchItens = async () => {
        try {
            const response = await api.get('/itens');
            setItens(response.data);
        } catch (error) {
            console.error('Erro ao buscar itens', error);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await api.get('/dashboard');
            setStats(response.data);
        } catch (error) {
            console.error('Erro ao buscar stats', error);
        }
    };

    const fetchChartData = async () => {
        try {
            const response = await api.get(`/grafico?inicio=${dates.inicio}&fim=${dates.fim}`);
            const { entradas, saidas } = response.data;
            setRawMovements({ entradas, saidas });

            // Gerar lista de todos os dias no intervalo selecionado
            const labels = [];
            let current = new Date(dates.inicio + 'T00:00:00');
            const end = new Date(dates.fim + 'T23:59:59');
            
            while (current <= end) {
                labels.push(format(current, 'yyyy-MM-dd'));
                current.setDate(current.getDate() + 1);
            }

            setChartData({
                labels: labels.map(l => format(new Date(l + 'T00:00:00'), 'dd/MM')),
                datasets: [
                    {
                        label: 'Entradas',
                        data: labels.map(l => {
                            // Comparar strings YYYY-MM-DD diretamente
                            const found = entradas.find(e => e.dia === l);
                            return found ? Number(found.total) : 0;
                        }),
                        borderColor: '#e11d48',
                        backgroundColor: 'rgba(225, 29, 72, 0.1)',
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Saídas',
                        data: labels.map(l => {
                            const found = saidas.find(s => s.dia === l);
                            return found ? Number(found.total) : 0;
                        }),
                        borderColor: '#64748b',
                        backgroundColor: 'rgba(100, 116, 139, 0.1)',
                        fill: true,
                        tension: 0.4
                    }
                ]
            });
        } catch (error) {
            console.error('Erro ao buscar dados do gráfico', error);
        }
    };

    const exportToPDF = async () => {
        try {
            console.log('Filtros selecionados:', reportFilter);
            
            const response = await api.get(`/relatorio-detalhado?item_id=${reportFilter.item_id}&tipo=${reportFilter.tipo}`);
            const reportData = response.data;

            console.log('Dados recebidos do servidor:', reportData);

            if (!reportData || reportData.length === 0) {
                alert('Não há registros para os filtros selecionados');
                return;
            }

            const doc = new jsPDF();
            const dateStr = format(new Date(), 'dd/MM/yyyy HH:mm');
            
            doc.setFontSize(18);
            doc.setTextColor(225, 29, 72); 
            doc.text('Estoque Fácil - Relatório Detalhado', 14, 20);
            
            doc.setFontSize(10);
            doc.setTextColor(100, 116, 139);
            doc.text(`Gerado em: ${dateStr}`, 14, 28);

            doc.setFontSize(14);
            doc.setTextColor(30, 41, 59);
            doc.text('Histórico de Movimentações', 14, 40);

            const tableData = reportData.map(m => {
                let dataFormatada = '-';
                try {
                    if (m.data) {
                        dataFormatada = format(new Date(m.data), 'dd/MM/yyyy HH:mm');
                    }
                } catch (e) {
                    console.error('Erro ao formatar data:', m.data);
                }

                return [
                    dataFormatada,
                    m.item_nome || 'N/A',
                    m.tipo === 'entrada' ? 'Entrada' : 'Saída',
                    m.quantidade || 0,
                    m.observacao || '-'
                ];
            });

            autoTable(doc, {
                startY: 45,
                head: [['Data/Hora', 'Item', 'Tipo', 'Qtd', 'Observação']],
                body: tableData,
                theme: 'striped',
                headStyles: { fillColor: [225, 29, 72] },
                styles: { fontSize: 9 }
            });

            const fileName = `Relatorio_Estoque_${format(new Date(), 'ddMMyyyy_HHmm')}.pdf`;
            doc.save(fileName);
            setShowReportModal(false); 
        } catch (error) {
            console.error('Erro completo na exportação PDF:', error);
            alert('Erro ao gerar PDF: ' + (error.response?.data?.message || error.message));
        }
    };

    const exportPeriodoPDF = async () => {
        try {
            const doc = new jsPDF();
            const dateStr = format(new Date(), 'dd/MM/yyyy HH:mm');
            
            doc.setFontSize(18);
            doc.setTextColor(225, 29, 72);
            doc.text('Estoque Fácil - Fluxo de Período', 14, 20);
            
            doc.setFontSize(10);
            doc.setTextColor(100, 116, 139);
            doc.text(`Gerado em: ${dateStr}`, 14, 28);

            const { entradas, saidas } = rawMovements;
            if (entradas.length === 0 && saidas.length === 0) {
                alert('Não há movimentações no período selecionado');
                return;
            }

            doc.setFontSize(14);
            doc.setTextColor(30, 41, 59);
            doc.text(`Movimentações: ${format(new Date(dates.inicio + 'T12:00:00'), 'dd/MM/yyyy')} até ${format(new Date(dates.fim + 'T12:00:00'), 'dd/MM/yyyy')}`, 14, 40);

            const movs = [
                ...entradas.map(e => ({ Data: e.dia, Tipo: 'Entrada', Quantidade: e.total })),
                ...saidas.map(s => ({ Data: s.dia, Tipo: 'Saída', Quantidade: s.total }))
            ].sort((a, b) => new Date(a.Data) - new Date(b.Data));

            const tableData = movs.map(m => [
                format(new Date(m.Data + 'T12:00:00'), 'dd/MM/yyyy'),
                m.Tipo,
                m.Quantidade
            ]);

            autoTable(doc, {
                startY: 45,
                head: [['Data', 'Tipo de Operação', 'Quantidade Total']],
                body: tableData,
                theme: 'grid',
                headStyles: { fillColor: [30, 41, 59] },
                styles: { fontSize: 10 }
            });

            doc.save(`Movimentacoes_${dates.inicio}_a_${dates.fim}.pdf`);
        } catch (error) {
            console.error('Erro na exportação PDF:', error);
            alert('Erro ao gerar PDF');
        }
    };

    if (!stats) return <div style={{ color: 'white', padding: '2rem' }}>Carregando dados...</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Dashboard</h1>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn btn-primary" onClick={() => setShowReportModal(true)}>
                        <FileText size={18} /> Relatório PDF
                    </button>
                    <button className="btn" style={{ backgroundColor: '#1e293b', color: 'white', border: '1px solid #334155' }} onClick={exportPeriodoPDF}>
                        <Download size={18} /> Exportar PDF Período
                    </button>
                </div>
            </div>

            {/* Modal de Filtro do Relatório */}
            {showReportModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div className="card" style={{ width: '90%', maxWidth: '400px' }}>
                        <h3 style={{ color: 'white' }}>Configurar Relatório PDF</h3>
                        <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.5rem' }}>Escolha os filtros para o histórico detalhado.</p>
                        
                        <div style={{ marginTop: '1.5rem' }}>
                            <label style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Selecionar Item</label>
                            <select 
                                value={reportFilter.item_id} 
                                onChange={e => setReportFilter({ ...reportFilter, item_id: e.target.value })}
                            >
                                <option value="todos">Todos os Itens</option>
                                {itens.map(item => (
                                    <option key={item.id} value={item.id}>{item.nome}</option>
                                ))}
                            </select>

                            <label style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '1rem', display: 'block' }}>Tipo de Movimentação</label>
                            <select 
                                value={reportFilter.tipo} 
                                onChange={e => setReportFilter({ ...reportFilter, tipo: e.target.value })}
                            >
                                <option value="todos">Entradas e Saídas</option>
                                <option value="entrada">Apenas Entradas</option>
                                <option value="saida">Apenas Saídas</option>
                            </select>

                            <div style={{ display: 'flex', gap: '10px', marginTop: '2rem' }}>
                                <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => setShowReportModal(false)}>Cancelar</button>
                                <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => exportToPDF()}>Gerar PDF</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="dashboard-grid">
                <div className="card">
                    <div className="card-title">Total de Produtos</div>
                    <div className="card-value">
                        <Package size={24} color="#e11d48" /> {stats.totalProdutos}
                    </div>
                </div>
                <div className="card">
                    <div className="card-title">Itens em Estoque</div>
                    <div className="card-value">{stats.estoqueTotal}</div>
                </div>
                <div className="card">
                    <div className="card-title">Entradas (Total)</div>
                    <div className="card-value">
                        <TrendingUp size={24} color="#22c55e" /> {stats.totalEntradas}
                    </div>
                </div>
                <div className="card">
                    <div className="card-title">Saídas (Total)</div>
                    <div className="card-value">
                        <TrendingDown size={24} color="#64748b" /> {stats.totalSaidas}
                    </div>
                </div>
                <div className="card" style={{ borderLeft: '4px solid #e11d48' }}>
                    <div className="card-title">Itens Críticos</div>
                    <div className="card-value" style={{ color: '#e11d48' }}>
                        <AlertCircle size={24} /> {stats.itensCriticos}
                    </div>
                </div>
            </div>

            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h3 style={{ color: 'white' }}>Fluxo de Movimentação</h3>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>De:</span>
                            <input 
                                type="date" 
                                value={dates.inicio} 
                                onChange={e => setDates({ ...dates, inicio: e.target.value })}
                                style={{ width: 'auto', marginBottom: 0, padding: '0.5rem' }}
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Até:</span>
                            <input 
                                type="date" 
                                value={dates.fim} 
                                onChange={e => setDates({ ...dates, fim: e.target.value })}
                                style={{ width: 'auto', marginBottom: 0, padding: '0.5rem' }}
                            />
                        </div>
                    </div>
                </div>
                
                <div style={{ height: '350px', width: '100%' }}>
                    {chartData ? (
                        <Line 
                            data={chartData} 
                            options={{ 
                                maintainAspectRatio: false,
                                plugins: { 
                                    legend: { 
                                        position: 'top',
                                        labels: { color: '#94a3b8', font: { weight: '600', size: 12 }, usePointStyle: true, padding: 20 } 
                                    },
                                    tooltip: {
                                        backgroundColor: '#1e293b',
                                        titleColor: '#f8fafc',
                                        bodyColor: '#f8fafc',
                                        borderColor: '#334155',
                                        borderWidth: 1,
                                        padding: 12,
                                        displayColors: true
                                    }
                                },
                                scales: {
                                    y: { 
                                        beginAtZero: true,
                                        ticks: { color: '#94a3b8', stepSize: 1 }, 
                                        grid: { color: 'rgba(51, 65, 85, 0.5)', drawBorder: false } 
                                    },
                                    x: { 
                                        ticks: { color: '#94a3b8' }, 
                                        grid: { display: false } 
                                    }
                                },
                                interaction: {
                                    intersect: false,
                                    mode: 'index'
                                }
                            }} 
                        />
                    ) : (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#94a3b8' }}>
                            Gerando gráfico...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
