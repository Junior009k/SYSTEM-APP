import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../Service/Database/Supabase'; 
import Chart from 'chart.js/auto'; 
import { TableDashboard } from '../../../Components/TableDashboard';

const DASHBOARD_STYLES = `
    /* Variables y Paleta de Colores (Moderno y Corporativo) */
    :root {
        --color-corporate-blue: #1E40AF;
        --color-primary-bg: #F0F4F8; 
        --color-card-bg: #FFFFFF;
        --color-focus-ring-blue: #3B82F6;
        --color-text-dark: #1F2937;
        --color-text-medium: #6B7280;

        /* Colores de Estado (Semáforo) */
        --status-red: #DC2626;
        --status-yellow: #F59E0B;
        --status-green: #10B981;
        --status-gray: #6B7280;
        --status-pending: #4F46E5; 
        
        /* Colores de Estado de Pedido */
        --order-pedido: #3B82F6;    
        --order-enviado: #059669;   
        --order-pendiente: #F59E0B; 
        --order-listo: #10B981;     
    }

    .dashboard-wrapper-style { /* Clase genérica para aplicar fuentes si es necesario */
        font-family: 'Inter', sans-serif;
        color: var(--color-text-dark);
        min-height: 100%;
        width: 100%;
    }


    .container {
        max-width: 1380px;
        margin: 0 auto;
        padding: 1rem;
    }

    @media (min-width: 768px) {
        .container {
            padding: 2rem;
        }
    }

    /* Encabezado */
    .header {
        background-color: var(--color-card-bg);
        border-bottom: 1px solid #E5E7EB;
        box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); 
        position: sticky;
        top: 0;
        z-index: 10;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 2rem;
    }

    .header h1 {
        font-size: 1.875rem;
        font-weight: 800;
        color: var(--color-corporate-blue);
        margin: 0;
    }

    .user-info {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .logout-button {
        background-color: var(--status-red);
        color: white;
        border: none;
        padding: 8px 12px;
        border-radius: 6px;
        cursor: pointer;
        transition: background-color 0.2s;
    }
    .logout-button:hover {
        background-color: #C53030;
    }

    /* Secciones del Dashboard */
    .dashboard-title {
        font-size: 2.25rem; 
        font-weight: 700;
        color: #1a202c;
        margin-bottom: 2.5rem;
        margin-top: 1rem;
    }

    /* Panel de Visualización (Métricas + Gráfico) */
    .viz-panel {
        display: grid;
        grid-template-columns: 1fr;
        gap: 2rem; 
        margin-bottom: 3rem;
    }

    @media (min-width: 1024px) {
        .viz-panel {
            grid-template-columns: 3fr 1.5fr;
        }
    }

    .card {
        background-color: var(--color-card-bg);
        padding: 2rem;
        border-radius: 1rem; 
        box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.1); 
        border: none; 
    }

    .card h3 {
        font-size: 1.5rem; 
        font-weight: 700; 
        border-bottom: 2px solid #F3F4F6;
        padding-bottom: 0.75rem;
        margin-bottom: 1.5rem;
        color: #374151;
    }
    
    /* Contenedor de Métricas */
    #summary-metrics {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1.5rem;
    }

    @media (min-width: 640px) {
        #summary-metrics {
            grid-template-columns: repeat(3, 1fr);
        }
    }
    
    @media (min-width: 1280px) {
        #summary-metrics {
            grid-template-columns: repeat(5, 1fr);
        }
    }

    /* Tarjeta de Resumen (Métrica Individual) */
    .summary-card {
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        cursor: pointer;
        display: flex;
        align-items: center;
        padding: 1.25rem;
        border-radius: 0.75rem;
        border-left: 5px solid var(--ring-color);
    }
    .summary-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
        background-color: #F9FAFB;
    }

    .metric-icon-wrapper {
        padding: 0.75rem;
        border-radius: 50%; 
        background-color: #EBF4FF; 
        margin-right: 1rem;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .metric-info p:first-child {
        font-size: 0.875rem; 
        margin: 0;
    }

    .metric-info p:last-child {
        font-size: 1.875rem; 
        font-weight: 900; 
        margin: 0;
    }
    
    /* Contenedor del Gráfico - ALTURA FIJA PARA CHART.JS */
    .chart-wrapper {
        position: relative; 
        height: 350px; 
        width: 100%;
    }

    /* Lista de Próximas Caducidades (Alerta) */
    .near-expiry-alert {
        background-color: #FEF2F2; 
        border: 1px solid #FCA5A5; 
    }

    .alert-critical {
        background-color: #FEE2E2; 
        border-color: #EF4444; 
        color: #991B1B; 
    }

    .alert-warning {
        background-color: #FFFBEB; 
        border-color: #F59E0B; 
        color: #92400E; 
    }

    .near-expiry-item {
        padding: 1rem;
        border-radius: 0.5rem;
        border-left: 4px solid;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .near-expiry-details {
        display: flex;
        gap: 1rem;
        align-items: center;
    }

    /* Tabla de Clientes */
    .client-table {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
    }
    
    .table-container {
        overflow-x: auto;
    }

    .client-table th, .client-table td {
        padding: 0.75rem 1rem;
        text-align: left;
        border-bottom: 1px solid #E5E7EB;
    }
    .client-table th {
        font-size: 0.8rem;
        letter-spacing: 0.08em; 
        text-transform: uppercase;
        background-color: #F9FAFB;
        color: #4B5563;
    }

    /* Estilos de Estado en la Tabla (Vigencia) */
    .status-badge {
        font-size: 0.75rem;
        font-weight: 700; 
        padding: 0.3rem 0.6rem;
        border-radius: 9999px;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        display: inline-block;
        min-width: 70px;
        text-align: center;
    }

    .status-vigente { background-color: #D1FAE5; color: #065F46; } 
    .status-proximo { background-color: #FEF3C7; color: #92400E; } 
    .status-caducado { background-color: #FEE2E2; color: #991B1B; } 
    .status-inactivo { background-color: #E5E7EB; color: #374151; } 
    .status-pendiente { background-color: #C7D2FE; color: var(--status-pending); } 
    
    /* --- ESTILOS PARA ESTADO DE PEDIDO --- */
    .order-badge {
        font-size: 0.7rem;
        font-weight: 600; 
        padding: 0.2rem 0.5rem;
        border-radius: 9999px; 
        text-transform: uppercase;
        display: inline-block;
        min-width: 70px;
        text-align: center;
    }

    .order-pedido { background-color: #DBEAFE; color: var(--order-pedido); }
    .order-enviado { background-color: #D1FAE5; color: var(--order-enviado); }
    .order-pendiente { background-color: #FEF3C7; color: var(--order-pendiente); }
    .order-listo { background-color: #D1FAE5; color: var(--order-listo); }
    .order-vacio { background-color: #E5E7EB; color: var(--color-text-medium); }

    /* Estilos de Filtros */
    .filters-panel h2 {
        font-size: 1.5rem;
        margin-bottom: 1rem;
    }
    .filters-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        align-items: flex-end;
    }
    .filter-group {
        display: flex;
        flex-direction: column;
    }
    .filter-group label {
        margin-bottom: 0.5rem;
        font-weight: 600;
        font-size: 0.875rem;
    }
    .filter-group input, .filter-group select {
        padding: 0.75rem;
        border: 1px solid #D1D5DB;
        border-radius: 0.5rem;
        font-size: 1rem;
    }
    .clear-button {
        background-color: #9CA3AF;
        color: white;
        border: none;
        padding: 0.875rem;
        border-radius: 0.5rem;
        cursor: pointer;
        transition: background-color 0.2s;
    }
    .clear-button:hover {
        background-color: #6B7280;
    }
`;

// Paleta de colores para el gráfico (Barra)
const CHART_COLORS = {
    'Vigente': 'var(--status-green)',
    'Proximo': 'var(--status-yellow)',
    'Caducado': 'var(--status-red)',
    'Inactivo': 'var(--status-gray)',
    'Pendiente': 'var(--status-pending)',
};
const CHART_COLORS_LIGHT = {
    'Vigente': '#34D399',
    'Proximo': '#FCD34D',
    'Caducado': '#F87171',
    'Inactivo': '#D1D5DB',
    'Pendiente': '#A5B4FC',
};


const DashboardPages = () => {
    // --- Referencias y Estados ---
    const chartRef = useRef(null);
    const chartInstance = useRef(null);
    const [allClients, setAllClients] = useState([]);
    const [filteredClients, setFilteredClients] = useState([]);
    const [dataLoading, setDataLoading] = useState(true);

    const [filters, setFilters] = useState({
        client: '',
        status: '',
        orderState: ''
    });


    // Función pura para procesar los datos brutos
    const processClientData = useCallback((clients) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return clients.map(client => {
            const docId = client.id;
            const expirationDate = client.fecha_de_caducidad ? new Date(client.fecha_de_caducidad) : null;

            let daysLeft = 9999;
            let statusText = 'Inactivo';

            if (expirationDate) {
                expirationDate.setHours(0, 0, 0, 0);
                const diffTime = expirationDate.getTime() - today.getTime();
                daysLeft = Math.round(diffTime / (1000 * 60 * 60 * 24));

                if (daysLeft < 0) {
                    statusText = 'Caducado';
                } else if (daysLeft <= 10) {
                    statusText = 'Proximo';
                } else {
                    statusText = 'Vigente';
                }
            } else if (client.nueva_fecha_de_caducidad) {
                statusText = 'Pendiente';
                daysLeft = 9999;
            } else {
                statusText = 'Inactivo';
                daysLeft = 9999;
            }

            const orderState = client.state ? client.state.toLowerCase() : '';

            return {
                id: docId,
                client: client.nombre_de_cliente,
                support: client.soporte,
                priority: client.prioridad,
                expirationDate: client.fecha_de_caducidad,
                newExpirationDate: client.nueva_fecha_de_caducidad,
                daysLeft: daysLeft,
                statusText: statusText,
                orderState: orderState
            };
        }).sort((a, b) => {
            // Lógica de ordenación para el dashboard (caducados, próximos, luego días restantes)
            if (a.statusText === 'Caducado' && b.statusText !== 'Caducado') return -1;
            if (b.statusText === 'Caducado' && a.statusText !== 'Caducado') return 1;
            if (a.statusText === 'Proximo' && b.statusText !== 'Proximo' && b.statusText !== 'Caducado') return -1;
            if (b.statusText === 'Proximo' && a.statusText !== 'Proximo' && a.statusText !== 'Caducado') return 1;
            return a.daysLeft - b.daysLeft;
        });
    }, []);

    const loadClientData = useCallback(async () => {
        setDataLoading(true);

        const { data, error } = await supabase
            .from('clientes')
            .select('id, nombre_de_cliente, fecha_de_caducidad, nueva_fecha_de_caducidad, soporte, prioridad, state');

        if (error) {
            console.error("Error fetching from Supabase:", error.message);
            setAllClients([]);
        } else if (data && data.length > 0) {
            const processed = processClientData(data);
            setAllClients(processed);
        } else {
            setAllClients([]);
        }
        setDataLoading(false);
    }, [processClientData]);

    useEffect(() => {
          loadClientData();
     }, [loadClientData]);


    // --- Lógica de Filtros y Actualización del Dashboard ---

    const handleFilterChange = (e) => {
        setFilters(prev => ({ ...prev, [e.target.id.replace('filter', '').toLowerCase()]: e.target.value }));
    };

    const clearFilters = () => {
        setFilters({ client: '', status: '', orderState: '' });
    };

    // Aplicar filtros cada vez que cambian 'allClients' o 'filters'
    useEffect(() => {
        const { client: filterClient, status: filterStatus, orderState: filterOrderState } = filters;

        const filtered = allClients.filter(client => {
            const clientMatch = !filterClient || client.client.toLowerCase().includes(filterClient.toLowerCase()) || String(client.id).includes(filterClient);

            let statusMatch;
            if (filterStatus === 'Inactivo') {
                statusMatch = client.statusText === 'Inactivo' || client.statusText === 'Pendiente';
            } else {
                statusMatch = !filterStatus || client.statusText === filterStatus;
            }

            const orderStateMatch = !filterOrderState || client.orderState === filterOrderState.toLowerCase();

            return clientMatch && statusMatch && orderStateMatch;
        });

        setFilteredClients(filtered);
    }, [allClients, filters]);


    // --- Renderizado y Lógica del Gráfico (useEffect) ---

    const renderStatusChart = useCallback((clients) => {
        const counts = clients.reduce((acc, client) => {
            const status = client.statusText;
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});

        const chartLabels = ['Vigente', 'Proximo', 'Caducado', 'Pendiente', 'Inactivo'];
        const chartData = chartLabels.map(label => counts[label] || 0);
        const backgroundColors = chartLabels.map(label => CHART_COLORS[label] || '#9CA3AF');
        const borderColors = chartLabels.map(label => CHART_COLORS_LIGHT[label] || '#9CA3AF');

        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        const ctx = chartRef.current.getContext('2d');
        if (!ctx) return;

        chartInstance.current = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: chartLabels,
                datasets: [{
                    label: 'Número de Clientes',
                    data: chartData,
                    backgroundColor: backgroundColors,
                    borderColor: borderColors,
                    borderWidth: 1.5,
                    borderRadius: 4,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    title: { display: true, text: 'Clientes por Estado', font: { size: 16 } },
                },
                scales: {
                    y: { beginAtZero: true, precision: 0, title: { display: true, text: 'Conteo' } },
                    x: { grid: { display: false } }
                }
            }
        });
    }, []);

    // Actualizar el gráfico cada vez que cambian los clientes filtrados
    useEffect(() => {
        if (chartRef.current && filteredClients.length > 0) {
            renderStatusChart(filteredClients);
        } else if (chartInstance.current) {
            chartInstance.current.destroy();
            chartInstance.current = null;
        }
    }, [filteredClients, renderStatusChart]);


    // --- Funciones de Renderizado (JSX Helpers) ---

    const renderMetrics = (clients) => {
        const vigentes = clients.filter(c => c.statusText === 'Vigente').length;
        const proximos = clients.filter(c => c.statusText === 'Proximo').length;
        const caducados = clients.filter(c => c.statusText === 'Caducado').length;
        const pendientes = clients.filter(c => c.statusText === 'Pendiente').length;
        const inactivos = clients.filter(c => c.statusText === 'Inactivo').length;

        const metrics = [
            { title: 'Total Cartera', value: clients.length, icon: 'Total', color: 'var(--color-corporate-blue)', ringColor: 'var(--color-corporate-blue)' },
            { title: 'Vigentes', value: vigentes, icon: 'Vigentes', color: 'var(--status-green)', ringColor: 'var(--status-green)' },
            { title: 'Próximos (10D)', value: proximos, icon: 'Próximos', color: 'var(--status-yellow)', ringColor: 'var(--status-yellow)' },
            { title: 'Caducados', value: caducados, icon: 'Caducados', color: 'var(--status-red)', ringColor: 'var(--status-red)' },
            { title: 'Pendientes/Inactivos', value: pendientes + inactivos, icon: 'Inactivos', color: 'var(--status-gray)', ringColor: 'var(--status-gray)' },
        ];

        // Función que retorna el SVG (adaptada de tu código original)
        const getMetricIconSVG = (name, color) => {
            let svgPath = '';
            switch (name) {
                case 'Total': svgPath = '<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M17 11h4"/><path d="M19 9v4"/>'; break;
                case 'Vigentes': svgPath = '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14 9 11"/>'; break;
                case 'Próximos': svgPath = '<path d="m21.73 18-9-15a.4.4 0 0 0-.27-.14.4.4 0 0 0-.27.14l-9 15a.5.5 0 0 0 .44.75h18.15a.5.5 0 0 0 .44-.75z"/><line x1="12" x2="12" y1="9" y2="12"/><line x1="12" x2="12.01" y1="15" y2="15"/>'; break;
                case 'Caducados': svgPath = '<circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>'; break;
                case 'Inactivos': svgPath = '<circle cx="12" cy="12" r="10"/><path d="M8 12h8"/>'; break;
                default: svgPath = '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>';
            }
            return (
                <svg className="svg-icon" style={{ color: color, stroke: color, width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" strokeWidth="2">
                    <g dangerouslySetInnerHTML={{ __html: svgPath }} />
                </svg>
            );
        };

        return (
            <div id="summary-metrics">
                {metrics.map(metric => (
                    <div className="summary-card" key={metric.title} style={{ '--ring-color': metric.ringColor }}>
                        <div className="metric-icon-wrapper" style={{ backgroundColor: `${metric.ringColor}10` }}>
                            {getMetricIconSVG(metric.icon, metric.color)}
                        </div>
                        <div className="metric-info">
                            <p>{metric.title}</p>
                            <p>{metric.value}</p>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderNearExpiryList = (clients) => {
        // Incluye Próximos (<=10 días) y Caducados
        const nearExpiry = clients
                            .filter(c => c.statusText === 'Proximo' || c.statusText === 'Caducado')
                            .slice(0, 10);

        if (nearExpiry.length === 0) {
            return (
                <p id="no-near-expiry" style={{ color: 'var(--status-green)', fontStyle: 'italic', fontSize: '0.875rem' }}>
                    🎉 ¡Excelente! No hay contratos en riesgo inminente (menos de 10 días).
                </p>
            );
        }

        return nearExpiry.map(client => {
            const isCritical = client.statusText === 'Caducado' || client.daysLeft <= 30;
            const alertClass = isCritical ? 'alert-critical' : 'alert-warning';
            const daysLabel = client.daysLeft < 0
                ? `${Math.abs(client.daysLeft)} DÍAS CADUCADO`
                : `${client.daysLeft} días restantes`;

            return (
                <div key={client.id} className={`near-expiry-item ${alertClass}`} style={{ borderLeftColor: isCritical ? 'var(--status-red)' : 'var(--status-yellow)' }}>
                    <span style={{ fontWeight: 700, color: isCritical ? '#991B1B' : '#92400E' }}>{client.client} (ID: {client.id})</span>
                    <div className="near-expiry-details">
                        <span style={{ fontSize: '0.8rem', color: isCritical ? '#DC2626' : '#F59E0B' }}>
                            Vence: <span style={{ fontWeight: 600 }}>{client.expirationDate || 'N/A'}</span>
                        </span>
                        <span style={{
                            backgroundColor: isCritical ? '#FEE2E2' : '#FFFBEB',
                            color: isCritical ? '#991B1B' : '#92400E',
                            fontSize: '0.65rem', padding: '0.2rem 0.6rem', borderRadius: '4px',
                        }}>
                            {daysLabel}
                        </span>
                    </div>
                </div>
            );
        });
    };

    const renderClientList = (clients) => {
        if (clients.length === 0 && !dataLoading) {
            return (
                <p id="no-results" style={{ padding: '1rem', fontStyle: 'italic' }}>
                    No se encontraron clientes que coincidan con los filtros.
                </p>
            );
        }

        return (<TableDashboard clients={clients}/>);
    };



    // --- Componente de Dashboard Principal (Logged-in UI) ---

    return (
        <div className="dashboard-wrapper-style">
            {/* INCLUSIÓN DE ESTILOS - Ahora solo inyecta selectores específicos */}
            <style dangerouslySetInnerHTML={{ __html: DASHBOARD_STYLES }} />


            <div className="container">

                <h2 className="dashboard-title">Vista de Vigilancia de Caducidades</h2>

                {dataLoading ? (
                    <div style={{ padding: '50px', textAlign: 'center' }}>
                        <h2>Cargando datos del dashboard...</h2>
                    </div>
                ) : (
                    <>
                        <div className="viz-panel">

                            <div id="summary-metrics-container" className="card">
                                <h3>Resumen Ejecutivo de la Cartera</h3>
                                {renderMetrics(filteredClients)}
                            </div>

                            <div className="card chart-container">
                                <h3>Distribución de Riesgo por Estado</h3>
                                <div className="chart-wrapper">
                                    <canvas id="statusChart" ref={chartRef}></canvas>
                                </div>
                                <p className="chart-caption">Conteo de clientes activos según su estado de vigencia.</p>
                            </div>
                        </div>

                        <div id="near-expiry-alert-container" className="near-expiry-alert card" style={{ marginBottom: '2rem' }}>
                            <h3>
                                <svg className="svg-icon" style={{ color: 'var(--status-red)', stroke: 'var(--status-red)', width: '24px', height: '24px', marginRight: '0.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10.29 3a1.4 1.4 0 0 0-1.875 0l-.823.754a1.4 1.4 0 0 1-1.233.364l-1.071-.161a1.4 1.4 0 0 0-1.464.76l-.423.846a1.4 1.4 0 0 1-.778 1.49l-.803.435a1.4 1.4 0 0 0-.584 1.458l.19.988a1.4 1.4 0 0 1-.09 1.25l-.756.84a1.4 1.4 0 0 0 0 1.874l.756.84a1.4 1.4 0 0 1 .09 1.25l-.19.988a1.4 1.4 0 0 0 .584 1.458l.803.435a1.4 1.4 0 0 1 .778 1.49l.423.846a1.4 1.4 0 0 0 1.464.76l1.071-.161a1.4 1.4 0 0 1 1.233.364l.823.754a1.4 1.4 0 0 0 1.875 0l.823-.754a1.4 1.4 0 0 1 1.233-.364l1.071.161a1.4 1.4 0 0 0 1.464-.76l.423-.846a1.4 1.4 0 0 1 .778-1.49l.803-.435a1.4 1.4 0 0 0 .584-1.458l-.19-.988a1.4 1.4 0 0 1 .09-1.25l.756-.84a1.4 1.4 0 0 0 0-1.874l-.756-.84a1.4 1.4 0 0 1-.09-1.25l.19-.988a1.4 1.4 0 0 0-.584-1.458l-.803-.435a1.4 1.4 0 0 1-.778-1.49l-.423-.846a1.4 1.4 0 0 0-1.464-.76l-1.071.161a1.4 1.4 0 0 1-1.233-.364l-.823-.754zM12 17a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0-4a1 1 0 0 0 0-2V9a1 1 0 0 0 0-2v2z"/></svg>
                                ALERTA CRÍTICA: Contratos en Riesgo (10 días o menos)
                            </h3>
                            <div id="near-expiry-container" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {renderNearExpiryList(filteredClients)}
                            </div>
                        </div>

                        <div className="card filters-panel">
                            <h2>Herramientas de Segmentación</h2>
                            <div className="filters-grid">

                                <div className="filter-group">
                                    <label htmlFor="filterClient">Cliente/ID</label>
                                    <input type="text" id="filterClient" value={filters.client} onChange={handleFilterChange} placeholder="Buscar por Nombre..." />
                                </div>

                                <div className="filter-group">
                                    <label htmlFor="filterStatus">Estado Vigencia</label>
                                    <select id="filterStatus" value={filters.status} onChange={handleFilterChange}>
                                        <option value="">Todos los Estados</option>
                                        <option value="Vigente">Vigente</option>
                                        <option value="Proximo">Próximo</option>
                                        <option value="Caducado">Caducado</option>
                                        <option value="Inactivo">Inactivo/Pendiente</option>
                                    </select>
                                </div>

                                <div className="filter-group">
                                    <label htmlFor="filterOrderState">Estado Pedido</label>
                                    <select id="filterOrderState" value={filters.orderState} onChange={handleFilterChange}>
                                        <option value="">Todos los Pedidos</option>
                                        <option value="pedido">Pedido</option>
                                        <option value="enviado">Enviado</option>
                                        <option value="pendiente">Pendiente</option>
                                        <option value="listo">Listo</option>
                                    </select>
                                </div>
                                <div className="filter-group">
                                    <button onClick={clearFilters} className="clear-button">
                                        Limpiar Filtros
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="card" style={{ marginTop: '2rem' }}>
                            <h2 className="text-xl font-semibold text-gray-700 mb-6">Listado Detallado de Contratos</h2>
                            {renderClientList(filteredClients)}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default DashboardPages;