import React, { useState, useMemo } from 'react';

export const TableCaducidades = ({ clients, populateForm, crudLoading }) => {
    // Estados para paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Estado para ordenamiento
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });

    // --- Lógica de Ordenamiento ---
    const sortedClients = useMemo(() => {
        let sortableItems = [...clients];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                const aValue = a[sortConfig.key] || '';
                const bValue = b[sortConfig.key] || '';

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [clients, sortConfig]);

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // --- Lógica de Paginación ---
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = sortedClients.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(sortedClients.length / itemsPerPage);

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return '↕️';
        return sortConfig.direction === 'asc' ? '🔼' : '🔽';
    };

    return (
        <div style={styles.container}>
            {/* Header: Selector de cantidad */}
            <div style={styles.headerControls}>
                <div style={styles.selectWrapper}>
                    <label style={styles.label}>Mostrar</label>
                    <select 
                        style={styles.select}
                        value={itemsPerPage} 
                        onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                    >
                        {[5, 10, 20, 50].map(val => <option key={val} value={val}>{val}</option>)}
                    </select>
                    <span style={styles.textMuted}>registros</span>
                </div>
                <span style={styles.totalBadge}>Total: {clients.length}</span>
            </div>

            {/* Tabla */}
            <table style={styles.table} id="clientTable">
                <thead>
                    <tr style={styles.trHead}>
                        <th style={styles.th} onClick={() => requestSort('id')}>ID {getSortIcon('id')}</th>
                        <th style={styles.th} onClick={() => requestSort('nombre_de_cliente')}>Nombre {getSortIcon('nombre_de_cliente')}</th>
                        <th style={styles.th} onClick={() => requestSort('fecha_de_caducidad')}>Caducidad {getSortIcon('fecha_de_caducidad')}</th>
                        <th style={styles.th} onClick={() => requestSort('nueva_fecha_de_caducidad')}>Nueva Cad. {getSortIcon('nueva_fecha_de_caducidad')}</th>
                        <th style={styles.th} onClick={() => requestSort('soporte')}>Soporte {getSortIcon('soporte')}</th>
                        <th style={styles.th} onClick={() => requestSort('prioridad')}>Prioridad {getSortIcon('prioridad')}</th>
                        <th style={styles.th}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {currentItems.map(cliente => (
                        <tr key={cliente.id} style={styles.trBody}>
                            <td style={styles.td}>{cliente.id}</td>
                            <td style={styles.td}>{cliente.nombre_de_cliente || 'N/A'}</td>
                            <td style={styles.td}>{cliente.fecha_de_caducidad || 'N/A'}</td>
                            <td style={styles.td}>{cliente.nueva_fecha_de_caducidad || 'N/A'}</td>
                            <td style={styles.td}>{cliente.soporte || 'N/A'}</td>
                            <td style={styles.td}>{cliente.prioridad || 'N/A'}</td>
                            <td style={styles.td}>
                                <button 
                                    className="edit-btn" 
                                    onClick={() => populateForm(cliente)}
                                    disabled={crudLoading}
                                    style={styles.actionBtn}
                                >
                                    Actualizar
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Footer: Paginación */}
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

// --- Objeto de Estilos ---
const styles = {
    container: { fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', padding: '20px' },
    headerControls: { display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'center' },
    selectWrapper: { display: 'flex', alignItems: 'center', gap: '10px' },
    label: { fontWeight: '600', fontSize: '14px' },
    select: { padding: '6px 10px', borderRadius: '6px', border: '1px solid #ccc', cursor: 'pointer' },
    textMuted: { color: '#666', fontSize: '14px' },
    totalBadge: { background: '#e9ecef', padding: '5px 12px', borderRadius: '15px', fontSize: '12px', fontWeight: 'bold' },
    table: { width: '100%', borderCollapse: 'collapse', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', borderRadius: '8px', overflow: 'hidden' },
    th: { backgroundColor: '#f8f9fa', padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6', cursor: 'pointer', fontSize: '14px', userSelect: 'none' },
    td: { padding: '12px', borderBottom: '1px solid #eee', fontSize: '14px' },
    trBody: { transition: 'background 0.2s' },
    actionBtn: { padding: '6px 12px', cursor: 'pointer', borderRadius: '4px', border: 'none', background: '#007bff', color: 'white' },
    paginationContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px', gap: '10px' },
    pageBtn: { padding: '8px 16px', border: '1px solid #007bff', background: 'white', color: '#007bff', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
    numBtn: { padding: '8px 12px', border: '1px solid #ddd', background: 'white', borderRadius: '4px', cursor: 'pointer' },
    activePageBtn: { background: '#007bff', color: 'white', borderColor: '#007bff' },
    disabledBtn: { opacity: 0.5, cursor: 'not-allowed', borderColor: '#ccc', color: '#666' },
    pageNumbers: { display: 'flex', gap: '5px' }
};