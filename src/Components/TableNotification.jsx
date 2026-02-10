import React, { useState, useMemo } from 'react';

export const TableNotification = ({ clients, populateForm, getMailConfig }) => {
    // 1. Estados para Paginación y Ordenamiento
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });

    // 2. Procesamos los datos para que el ordenamiento sea eficiente
    const processedClients = useMemo(() => {
        return clients.map(cliente => {
            const mailConfig = getMailConfig(cliente.mail);
            const rawEmailDestino = mailConfig.email_destino;
            
            return {
                ...cliente,
                emailDestino: Array.isArray(rawEmailDestino) ? rawEmailDestino.join(', ') : (rawEmailDestino || 'Sin configurar'),
                habilitarNotificacion: mailConfig.habilitar_notificacion === true,
                umbralDias: mailConfig.umbral_dias_notificacion || 90,
                frecuencia: mailConfig.frecuencia_notificacion || 'Diario',
                tienePlantilla: !!mailConfig.plantilla_correo && mailConfig.plantilla_correo.trim() !== ''
            };
        });
    }, [clients, getMailConfig]);

    // 3. Lógica de Ordenamiento
    const sortedClients = useMemo(() => {
        let sortableItems = [...processedClients];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                // Normalización para strings (nombres, emails)
                if (typeof aValue === 'string') aValue = aValue.toLowerCase();
                if (typeof bValue === 'string') bValue = bValue.toLowerCase();

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [processedClients, sortConfig]);

    // 4. Lógica de Paginación
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
                    <tr>
                        <th style={styles.th} onClick={() => requestSort('id')}>ID{getSortIcon('id')}</th>
                        <th style={styles.th} onClick={() => requestSort('nombre_de_cliente')}>Cliente{getSortIcon('nombre_de_cliente')}</th>
                        <th style={styles.th} onClick={() => requestSort('emailDestino')}>Correos {getSortIcon('emailDestino')}</th>
                        <th style={styles.th} onClick={() => requestSort('habilitarNotificacion')}>Notif.{getSortIcon('habilitarNotificacion')}</th>
                        <th style={styles.th} onClick={() => requestSort('umbralDias')}>Umbral{getSortIcon('umbralDias')}</th>
                        <th style={styles.th} onClick={() => requestSort('frecuencia')}>Frecuencia{getSortIcon('frecuencia')}</th>
                        <th style={styles.th}>Plantilla</th>
                        <th style={styles.th}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {currentItems.map(cliente => (
                        <tr key={cliente.id} style={styles.trBody}>
                            <td style={styles.td}>{cliente.id}</td>
                            <td style={styles.td}><strong>{cliente.nombre_de_cliente || 'N/A'}</strong></td>
                            <td style={{...styles.td, fontSize: '0.85rem'}}>{cliente.emailDestino}</td>
                            <td style={styles.td}>
                                <span style={{
                                    ...styles.statusBadge, 
                                    backgroundColor: cliente.habilitarNotificacion ? '#d4edda' : '#f8d7da',
                                    color: cliente.habilitarNotificacion ? '#155724' : '#721c24'
                                }}>
                                    {cliente.habilitarNotificacion ? 'Sí' : 'No'}
                                </span>
                            </td>
                            <td style={styles.td}>{cliente.habilitarNotificacion ? `${cliente.umbralDias} días` : '—'}</td>
                            <td style={styles.td}>{cliente.habilitarNotificacion ? cliente.frecuencia : '—'}</td>
                            <td style={styles.td}>
                                {cliente.tienePlantilla ? '✅ Pers.' : '📄 Est.'}
                            </td>
                            <td style={styles.td}>
                                <button 
                                    style={styles.actionBtn} 
                                    onClick={() => populateForm(cliente)}
                                >
                                    Configurar
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
                    Anterior
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
                    Siguiente
                </button>
            </div>
        </div>
    );
};

// --- Estilos Consistentes ---
const styles = {
    container: { padding: '20px', fontFamily: 'Segoe UI, sans-serif' },
    headerControls: { display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'center' },
    selectWrapper: { display: 'flex', alignItems: 'center', gap: '8px' },
    label: { fontWeight: 'bold', fontSize: '14px' },
    select: { padding: '5px', borderRadius: '4px', border: '1px solid #ccc' },
    textMuted: { color: '#666', fontSize: '13px' },
    totalBadge: { background: '#eee', padding: '4px 10px', borderRadius: '10px', fontSize: '12px' },
    table: { width: '100%', borderCollapse: 'collapse', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
    th: { backgroundColor: '#f8f9fa', padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6', cursor: 'pointer', fontSize: '13px' },
    td: { padding: '10px', borderBottom: '1px solid #eee', fontSize: '13px' },
    trBody: { transition: 'background 0.2s' },
    statusBadge: { padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' },
    actionBtn: { padding: '6px 12px', cursor: 'pointer', borderRadius: '4px', border: 'none', background: '#007bff', color: 'white', fontWeight: 'bold' },
    paginationContainer: { display: 'flex', justifyContent: 'center', marginTop: '20px', gap: '8px' },
    pageBtn: { padding: '6px 12px', border: '1px solid #007bff', background: 'white', color: '#007bff', borderRadius: '4px', cursor: 'pointer' },
    numBtn: { padding: '6px 10px', border: '1px solid #ddd', background: 'white', borderRadius: '4px', cursor: 'pointer' },
    activePageBtn: { background: '#007bff', color: 'white', borderColor: '#007bff' },
    disabledBtn: { opacity: 0.4, cursor: 'not-allowed' },
    pageNumbers: { display: 'flex', gap: '4px' }
};