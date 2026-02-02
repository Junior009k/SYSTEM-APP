import React, { useState, useMemo } from 'react';

export const TableClientes = ({ clientes, populateForm, deleteCliente }) => {
    // 1. Estados para Paginación y Ordenamiento
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });

    // 2. Lógica de Ordenamiento
    const sortedClientes = useMemo(() => {
        let sortableItems = [...clientes];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                const aValue = a[sortConfig.key] || '';
                const bValue = b[sortConfig.key] || '';

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [clientes, sortConfig]);

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // 3. Lógica de Paginación
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = sortedClientes.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(sortedClientes.length / itemsPerPage);

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return '↕️';
        return sortConfig.direction === 'asc' ? '🔼' : '🔽';
    };

    return (
        <div style={styles.container}>
            {/* Controles Superiores */}
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
                <span style={styles.totalBadge}>Total Clientes: {clientes.length}</span>
            </div>

            {/* Tabla Principal */}
            <table style={styles.table} id="clientTable">
                <thead>
                    <tr style={styles.trHead}>
                        <th style={styles.th} onClick={() => requestSort('id')}>ID {getSortIcon('id')}</th>
                        <th style={styles.th} onClick={() => requestSort('nombre_de_cliente')}>Nombre {getSortIcon('nombre_de_cliente')}</th>
                        <th style={styles.th} onClick={() => requestSort('fecha_de_caducidad')}>Caducidad {getSortIcon('fecha_de_caducidad')}</th>
                        <th style={styles.th} onClick={() => requestSort('nueva_fecha_de_caducidad')}>Nueva Cad. {getSortIcon('nueva_fecha_de_caducidad')}</th>
                        <th style={styles.th} onClick={() => requestSort('soporte')}>Soporte {getSortIcon('soporte')}</th>
                        <th style={styles.th} onClick={() => requestSort('prioridad')}>Prioridad {getSortIcon('prioridad')}</th>
                        <th style={styles.th} onClick={() => requestSort('state')}>Estado {getSortIcon('state')}</th>
                        <th style={styles.th}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {currentItems.map((cliente) => (
                        <tr key={cliente.id} style={styles.trBody}>
                            <td style={styles.td}>{cliente.id}</td>
                            <td style={styles.td}>{cliente.nombre_de_cliente}</td>
                            <td style={styles.td}>{cliente.fecha_de_caducidad || 'N/A'}</td>
                            <td style={styles.td}>{cliente.nueva_fecha_de_caducidad || 'N/A'}</td>
                            <td style={styles.td}>{cliente.soporte}</td>
                            <td style={styles.td}>{cliente.prioridad}</td>
                            <td style={styles.td}>{cliente.state || 'N/A'}</td>
                            <td style={styles.td}>
                                <div style={{ display: 'flex', gap: '5px' }}>
                                    <button 
                                        className="edit-btn" 
                                        onClick={() => populateForm(cliente)}
                                        style={{...styles.actionBtn, background: '#007bff'}}
                                    >
                                        Editar
                                    </button>
                                    <button 
                                        className="delete-btn" 
                                        onClick={() => deleteCliente(cliente.id, cliente.nombre_de_cliente)}
                                        style={{...styles.actionBtn, background: '#dc3545'}}
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Controles de Paginación */}
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

// --- Estilos Consistentes ---
const styles = {
    container: { fontFamily: 'sans-serif', padding: '20px' },
    headerControls: { display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'center' },
    selectWrapper: { display: 'flex', alignItems: 'center', gap: '10px' },
    label: { fontWeight: 'bold', fontSize: '14px' },
    select: { padding: '5px 8px', borderRadius: '4px', border: '1px solid #ccc' },
    textMuted: { color: '#666', fontSize: '14px' },
    totalBadge: { background: '#f0f0f0', padding: '4px 10px', borderRadius: '12px', fontSize: '12px' },
    table: { width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' },
    th: { backgroundColor: '#f4f4f4', padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd', cursor: 'pointer', fontSize: '14px' },
    td: { padding: '10px', borderBottom: '1px solid #eee', fontSize: '14px' },
    actionBtn: { padding: '5px 10px', cursor: 'pointer', borderRadius: '4px', border: 'none', color: 'white', fontSize: '12px' },
    paginationContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px', gap: '8px' },
    pageBtn: { padding: '6px 12px', border: '1px solid #007bff', background: 'white', color: '#007bff', borderRadius: '4px', cursor: 'pointer' },
    numBtn: { padding: '6px 10px', border: '1px solid #ddd', background: 'white', borderRadius: '4px', cursor: 'pointer' },
    activePageBtn: { background: '#007bff', color: 'white', borderColor: '#007bff' },
    disabledBtn: { opacity: 0.4, cursor: 'not-allowed' },
    pageNumbers: { display: 'flex', gap: '4px' }
};