import React, { useState, useMemo } from 'react';

export const TableDashboard = ({ clients, populateForm, deleteCliente }) => {
    // 1. Estados para Paginación y Ordenamiento
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [sortConfig, setSortConfig] = useState({ key: 'daysLeft', direction: 'asc' });

    // 2. Lógica de Ordenamiento
    const sortedClients = useMemo(() => {
        let sortableItems = [...clients];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                let aValue = a[sortConfig.key] || '';
                let bValue = b[sortConfig.key] || '';

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [clients, sortConfig]);

    // 3. Lógica de Paginación
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = sortedClients.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(sortedClients.length / itemsPerPage);

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return '↕️';
        return sortConfig.direction === 'asc' ? '🔼' : '🔽';
    };

    return (
        <div style={styles.container}>
            {/* Controles Superiores */}
            <div style={styles.headerControls}>
                <div style={styles.selectWrapper}>
                    <label style={styles.label}>Ver</label>
                    <select 
                        style={styles.select}
                        value={itemsPerPage} 
                        onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                    >
                        {[5, 10, 20, 50, 100].map(val => <option key={val} value={val}>{val}</option>)}
                    </select>
                    <span style={styles.textMuted}>clientes por página</span>
                </div>
                <div style={styles.totalBadge}>Total Clientes: {clients.length}</div>
            </div>

            <div className="table-container" style={styles.tableWrapper}>
                <table className="client-table" style={styles.table}>
                    <thead>
                        <tr>
                            <th style={{...styles.th, width: '5%'}} onClick={() => requestSort('id')}>ID {getSortIcon('id')}</th>
                            <th style={{...styles.th, width: '18%'}} onClick={() => requestSort('client')}>Cliente {getSortIcon('client')}</th>
                            <th style={{...styles.th, width: '10%'}} onClick={() => requestSort('statusText')}>Estado {getSortIcon('statusText')}</th>
                            <th style={{...styles.th, width: '12%'}} onClick={() => requestSort('orderState')}>Pedido {getSortIcon('orderState')}</th>
                            <th style={{...styles.th, width: '15%'}}>Caducidad Actual</th>
                            <th style={{...styles.th, width: '15%'}}>Pendiente</th>
                            <th style={{...styles.th, width: '10%'}} onClick={() => requestSort('support')}>Soporte</th>
                            <th style={{...styles.th, width: '5%'}} onClick={() => requestSort('priority')}>Pri.</th>
                            <th style={{...styles.th, width: '10%'}} onClick={() => requestSort('daysLeft')}>Días {getSortIcon('daysLeft')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.map(client => {
                            // Lógica visual original mantenida
                            const dateDisplay = client.daysLeft < 0
                                ? <span style={{ color: '#ef4444', fontWeight: 600 }}>{client.expirationDate || 'N/A'}</span>
                                : client.expirationDate || 'N/A';

                            const newDateDisplay = client.newExpirationDate
                                ? <span style={{ color: '#f59e0b', fontWeight: 600 }}>{client.newExpirationDate}</span>
                                : <span style={{ color: '#9ca3af' }}>Pendiente</span>;

                            let daysDisplay;
                            if (client.statusText === 'Inactivo' || client.statusText === 'Pendiente') {
                                daysDisplay = <span style={{ color: '#9ca3af' }}>N/A</span>;
                            } else if (client.daysLeft < 0) {
                                daysDisplay = <span style={{ fontWeight: 700, color: '#ef4444', fontSize: '0.75rem' }}>{Math.abs(client.daysLeft)} DÍAS CADUCADO</span>;
                            } else if (client.daysLeft === 0) {
                                daysDisplay = <span style={{ fontWeight: 700, color: '#ef4444', fontSize: '0.75rem' }}>VENCE HOY</span>;
                            } else {
                                daysDisplay = <span style={{ fontWeight: 500, color: '#4B5563' }}>{client.daysLeft} días</span>;
                            }

                            const statusClass = `status-badge status-${(client.statusText || '').toLowerCase().replace(/\s/g, '')}`;
                            const orderStateDisplay = (client.orderState || 'N/A').toUpperCase();

                            return (
                                <tr key={client.id} style={styles.tr}>
                                    <td style={styles.td}>{client.id}</td>
                                    <td style={styles.td}><strong>{client.client}</strong></td>
                                    <td style={styles.td}><span className={statusClass}>{client.statusText}</span></td>
                                    <td style={styles.td}>
                                        <span className={`order-badge order-${(client.orderState || 'vacio').toLowerCase()}`}>
                                            {orderStateDisplay}
                                        </span>
                                    </td>
                                    <td style={styles.td}>{dateDisplay}</td>
                                    <td style={styles.td}>{newDateDisplay}</td>
                                    <td style={styles.td}>{client.support || 'N/A'}</td>
                                    <td style={styles.td}>{client.priority || '—'}</td>
                                    <td style={styles.td}>{daysDisplay}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Paginación */}
            <div style={styles.paginationContainer}>
                <button 
                    style={{...styles.pageBtn, ...(currentPage === 1 ? styles.disabledBtn : {})}}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                >
                    &laquo; Anterior
                </button>
                
                <div style={styles.pageNumbers}>
                    {Array.from({ length: totalPages }, (_, i) => (
                        <button 
                            key={i + 1} 
                            onClick={() => setCurrentPage(i + 1)}
                            style={{
                                ...styles.numBtn,
                                ...(currentPage === i + 1 ? styles.activePageBtn : {})
                            }}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>

                <button 
                    style={{...styles.pageBtn, ...(currentPage === totalPages ? styles.disabledBtn : {})}}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages || totalPages === 0}
                >
                    Siguiente &raquo;
                </button>
            </div>
        </div>
    );
};

const styles = {
    container: { padding: '15px', background: '#fff', borderRadius: '8px' },
    headerControls: { display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'center' },
    selectWrapper: { display: 'flex', alignItems: 'center', gap: '8px' },
    label: { fontWeight: '600', fontSize: '14px', color: '#374151' },
    select: { padding: '4px 8px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' },
    textMuted: { color: '#6b7280', fontSize: '13px' },
    totalBadge: { background: '#f3f4f6', padding: '5px 12px', borderRadius: '15px', fontSize: '12px', fontWeight: 'bold', color: '#374151' },
    tableWrapper: { overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: '8px' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
    th: { backgroundColor: '#f9fafb', padding: '12px 10px', textAlign: 'left', borderBottom: '2px solid #e5e7eb', cursor: 'pointer', userSelect: 'none' },
    td: { padding: '12px 10px', borderBottom: '1px solid #f3f4f6' },
    tr: { transition: 'background-color 0.2s' },
    paginationContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px', gap: '8px' },
    pageBtn: { padding: '6px 12px', border: '1px solid #3b82f6', background: 'white', color: '#3b82f6', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' },
    numBtn: { padding: '6px 12px', border: '1px solid #e5e7eb', background: 'white', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' },
    activePageBtn: { background: '#3b82f6', color: 'white', borderColor: '#3b82f6' },
    disabledBtn: { opacity: 0.4, cursor: 'not-allowed', borderColor: '#d1d5db', color: '#9ca3af' },
    pageNumbers: { display: 'flex', gap: '4px' }
};