import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../Supabase/Supabase'; 
import Chart from 'chart.js/auto'; // Importación necesaria para Chart.js en React
import Login from './Login';

const TABLE_NAME = 'clientes';

// --- CSS del HTML original (Incluido para fidelidad visual) ---
const NOTIFICATION_STYLES = ` 
    .card {
        background: #fff;
        padding: 25px;
        border-radius: 12px;
        box-shadow: 0 6px 15px rgba(0, 0, 0, 0.08); 
        border: 1px solid #e9ecef;
    }
    #clientForm {
        display: flex;
        flex-direction: column;
        gap: 15px;
    }
    .form-group {
        display: flex;
        flex-direction: column;
        gap: 5px;
    }
    label {
        font-weight: 600;
        font-size: 0.9rem;
        color: #495057;
    }
    input[type="text"], 
    input[type="number"], 
    input[type="email"], 
    select, 
    textarea {
        padding: 10px;
        border: 1px solid #ced4da;
        border-radius: 6px;
        font-size: 1rem;
        transition: border-color 0.2s, box-shadow 0.2s;
        resize: vertical;
    }
    input:focus, select:focus, textarea:focus {
        border-color: #007bff;
        box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
        outline: none;
    }

    /* Botones */
    .button-group {
        display: flex;
        gap: 10px;
        margin-top: 10px;
    }
    button {
        padding: 10px 15px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 700;
        transition: background-color 0.2s, opacity 0.2s;
        flex-grow: 1;
    }
    .btn-primary {
        background-color: #007bff;
        color: white;
    }
    .btn-primary:hover {
        background-color: #0056b3;
    }
    .btn-secondary {
        background-color: #6c757d;
        color: white;
    }
    .btn-secondary:hover {
        background-color: #5a6268;
    }
    
    /* Layout de Notificaciones */
    .notification-config-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 15px;
        padding: 15px;
        border: 1px dashed #adb5bd;
        border-radius: 8px;
        margin-top: 10px;
    }
    .checkbox-group {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    /* Tabla de Clientes */
    #clientListContainer {
        overflow-x: auto;
    }
    #clientTable {
        width: 100%;
        border-collapse: separate;
        border-spacing: 0 8px; 
    }
    #clientTable th, #clientTable td {
        padding: 12px 15px;
        text-align: left;
        border-bottom: 1px solid #dee2e6;
    }
    #clientTable th {
        background-color: #e9ecef;
        font-size: 0.85rem;
        color: #495057;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }
    #clientTable tr {
        background-color: white;
        transition: background-color 0.2s;
    }
    #clientTable tr:hover {
        background-color: #f1f3f5;
    }

    .action-cell button {
        padding: 5px 10px;
        font-size: 0.8rem;
        margin-right: 5px;
        flex-grow: 0;
    }
    
    /* Estilo para notificaciones */
    .notification-enabled {
        color: #28a745;
        font-weight: 700;
    }
    .notification-disabled {
        color: #dc3545;
    }
    

`;

// --- Estado Inicial del Formulario ---
const initialFormState = {
    id: null,
    nombre_de_cliente: '',
    email_notificacion: '',
    habilitar_notificacion: false,
    umbral_dias_notificacion: 90,
    frecuencia_notificacion: 'Diario',
    plantilla_correo: '',
    searchClient: '',
};

// --- Función de Utilidad: Parsear Configuración de Mail ---
/**
 * Parsea y valida el objeto JSON de configuración de correo.
 * @param {string|Object} mailData - El valor de la columna 'mail'.
 * @returns {Object} - El objeto de configuración de correo.
 */
const getMailConfig = (mailData) => {
    let mailConfig = {};
    if (mailData) {
        try {
            mailConfig = (typeof mailData === 'string' && mailData.trim() !== '') ? JSON.parse(mailData) : mailData;
        } catch (e) {
            console.error("Error al parsear el JSON de 'mail':", e);
            mailConfig = {};
        }
    }
    return mailConfig || {};
};

const NotificationSetting = () => {
    // --- Estado de Autenticación ---
    const [session, setSession] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [authEmail, setAuthEmail] = useState('');
    const [authMessage, setAuthMessage] = useState('');

    // --- Estado CRUD ---
    const [formData, setFormData] = useState(initialFormState);
    const [clients, setClients] = useState([]);
    const [crudLoading, setCrudLoading] = useState(true);
    const [crudMessage, setCrudMessage] = useState('Cargando clientes...');

    // --- Lógica de Autenticación ---

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            setAuthLoading(false);
            if (session) {
                loadClientes();
            } else {
                setCrudLoading(false);
            }
        };

        getSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session);
                if (session) {
                    loadClientes();
                    setAuthMessage('');
                } else {
                    setClients([]);
                }
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    /**
     * Carga todos los clientes y su configuración de mail.
     */
    const loadClientes = useCallback(async () => {
        setCrudLoading(true);
        setCrudMessage('Cargando clientes...');
        
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('id, nombre_de_cliente, mail')
            .order('id', { ascending: true });

        if (error) {
            console.error('Error al cargar clientes:', error);
            setClients([]);
            setCrudMessage(`Error al cargar datos: ${error.message}`);
        } else {
            setClients(data);
            setCrudMessage(data.length === 0 ? 'No hay clientes registrados.' : '');
        }
        setCrudLoading(false);
    }, []);

    /**
     * Rellena el formulario con los datos de un cliente.
     */
    const populateForm = useCallback((cliente) => {
        const mailConfig = getMailConfig(cliente.mail);
        const rawEmailDestino = mailConfig.email_destino;
        const emailDestino = Array.isArray(rawEmailDestino) ? rawEmailDestino.join(', ') : (rawEmailDestino || '');

        setFormData({
            id: cliente.id,
            nombre_de_cliente: cliente.nombre_de_cliente || '',
            email_notificacion: emailDestino,
            habilitar_notificacion: mailConfig.habilitar_notificacion === true,
            umbral_dias_notificacion: mailConfig.umbral_dias_notificacion || 90,
            frecuencia_notificacion: mailConfig.frecuencia_notificacion || 'Diario',
            plantilla_correo: mailConfig.plantilla_correo || '',
            searchClient: '',
        });
        window.scrollTo(0, 0); // Desplazar al inicio para ver el formulario
    }, []);

    /**
     * Resetea el formulario a su estado inicial.
     */
    const resetForm = () => {
        setFormData(initialFormState);
        setCrudMessage(clients.length === 0 ? 'No hay clientes registrados.' : '');
    };

    /**
     * Busca un cliente por ID o nombre y rellena el formulario (o prepara para creación).
     */
    const fetchClient = async (query) => {
        setCrudMessage('Buscando cliente...');
        setFormData(initialFormState);

        let data = null;

        // 1. Intentar buscar por ID (si es numérico)
        if (!isNaN(query) && query.trim() !== '') {
            const { data: idData } = await supabase
                .from(TABLE_NAME)
                .select('id, nombre_de_cliente, mail')
                .eq('id', query)
                .single();
            if (idData) data = idData;
        }

        // 2. Intentar buscar por nombre (LIKE/ILIKE) si no se encontró por ID
        if (!data) {
            const { data: nameData } = await supabase
                .from(TABLE_NAME)
                .select('id, nombre_de_cliente, mail')
                .ilike('nombre_de_cliente', `%${query}%`)
                .limit(1);

            if (nameData && nameData.length > 0) {
                data = nameData[0];
            }
        }

        if (data) {
            populateForm(data);
            setCrudMessage(`Cliente ${data.id} cargado exitosamente.`);
            return;
        }

        // --- Cliente no encontrado: Permitir CREACIÓN ---
        console.warn('Cliente no encontrado. Se preparará el formulario para CREACIÓN.');
        setFormData(prev => ({
            ...initialFormState,
            nombre_de_cliente: query.trim() || '',
            searchClient: '',
        }));

        setCrudMessage(`Cliente "${query.trim()}" no encontrado. Ingrese los detalles para crear uno nuevo.`);
    };

    const handleSearchClick = () => {
        const query = formData.searchClient.trim();
        if (query) {
            fetchClient(query);
        } else {
            alert('Ingrese un ID o Nombre para buscar o crear un nuevo cliente.');
        }
    };

    const handleInputChange = (e) => {
        const { id, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: type === 'checkbox' ? checked : value
        }));
    };
    
    /**
     * Maneja el envío del formulario para actualizar o crear un cliente.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setCrudLoading(true);

        const id = formData.id;
        const nombreCliente = formData.nombre_de_cliente.trim();
        const emailValue = formData.email_notificacion.trim();
        const plantillaCorreo = formData.plantilla_correo.trim();

        if (!nombreCliente) {
            alert('El nombre del cliente es obligatorio.');
            setCrudLoading(false);
            return;
        }

        const emailArray = emailValue.split(',')
                                     .map(email => email.trim())
                                     .filter(email => email !== '');

        if (emailArray.length === 0) {
            alert('Debe ingresar al menos un correo electrónico de notificación, separado por comas.');
            setCrudLoading(false);
            return;
        }

        // CONSOLIDAR TODA LA CONFIGURACIÓN EN UN ÚNICO OBJETO JSON para la columna 'mail'
        const mailConfig = {
            email_destino: emailArray, // ARRAY de strings
            habilitar_notificacion: formData.habilitar_notificacion,
            umbral_dias_notificacion: parseInt(formData.umbral_dias_notificacion) || 90,
            frecuencia_notificacion: formData.frecuencia_notificacion,
            plantilla_correo: plantillaCorreo,
        };

        const dataToSave = {
            nombre_de_cliente: nombreCliente,
            mail: mailConfig, // Guardamos el JSON completo aquí
        };

        let error = null;
        let successMessage = '';

        if (id) {
            // Actualizar cliente existente
            const response = await supabase
                .from(TABLE_NAME)
                .update(dataToSave)
                .eq('id', id);
            error = response.error;
            successMessage = `Cliente ${id} actualizado exitosamente.`;
        } else {
            // Crear nuevo cliente
            const response = await supabase
                .from(TABLE_NAME)
                .insert(dataToSave);
            error = response.error;
            successMessage = `Cliente "${nombreCliente}" creado exitosamente.`;
        }
        
        if (error) {
            console.error('Error al guardar cliente:', error);
            alert('Error al guardar: ' + error.message);
        } else {
            alert(successMessage);
            resetForm();
            loadClientes();
        }
        setCrudLoading(false);
    };

     // --- Componente de Autenticación (JSX) ---
    if (!session) {
        return (
            <Login/>
        );
    }

    // --- Componente Principal (JSX) ---
    return (
        <div>
            {/* INCLUSIÓN DE ESTILOS */}
            <style dangerouslySetInnerHTML={{ __html: NOTIFICATION_STYLES }} />


            <div id="notification-container">
                {/* Panel de Formulario CRUD */}
                <div className="card" id="form-panel">
                    <h2>
                        {formData.id ? 'Editar Configuración' : 'Configurar Notificación'}
                    </h2>
                    <form id="clientForm" onSubmit={handleSubmit}>
                        <input type="hidden" id="clientId" value={formData.id || ''} />

                        {/* Buscador de Cliente por ID o Nombre */}
                        <div className="form-group">
                            <label htmlFor="searchClient">Buscar Cliente (ID o Nombre)</label>
                            <div style={{ display: 'flex', gap: '5px' }}>
                                <input 
                                    type="text" 
                                    id="searchClient" 
                                    placeholder="Escriba y presione Enter para cargar..." 
                                    value={formData.searchClient}
                                    onChange={handleInputChange}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleSearchClick();
                                        }
                                    }}
                                />
                                <button type="button" id="searchButton" className="btn-primary" style={{ flexGrow: 0, width: '80px' }} onClick={handleSearchClick} disabled={crudLoading}>
                                    Cargar
                                </button>
                            </div>
                        </div>

                        {/* Detalles del Cliente Cargado */}
                        {formData.id && (
                            <div id="clientDetails" style={{ border: '1px solid #007bff55', padding: '10px', borderRadius: '5px', marginTop: '10px' }}>
                                <p style={{ margin: '0' }}><strong>Cliente Actual:</strong> <span id="currentClientName">{formData.nombre_de_cliente}</span></p>
                                <p style={{ margin: '5px 0 0 0' }}><strong>ID Cliente:</strong> <span id="currentClientId">{formData.id}</span></p>
                            </div>
                        )}

                        {/* Input para el Nombre del Cliente (Obligatorio) */}
                        <div className="form-group">
                            <label htmlFor="nombre_de_cliente">Nombre del Cliente (*)</label>
                            <input 
                                type="text" 
                                id="nombre_de_cliente" 
                                placeholder="Nombre completo o razón social" 
                                value={formData.nombre_de_cliente} 
                                onChange={handleInputChange} 
                                required 
                            />
                        </div>

                        {/* Input para el Correo de Notificación (Múltiples) */}
                        <div className="form-group">
                            <label htmlFor="email_notificacion">Correos Electrónicos de Notificación (*)</label>
                            <input 
                                type="text" 
                                id="email_notificacion" 
                                placeholder="ejemplo1@dominio.com, ejemplo2@otro.com" 
                                value={formData.email_notificacion} 
                                onChange={handleInputChange} 
                                required 
                            />
                            <small style={{ color: '#6c757d' }}>Separe múltiples correos con una coma (,).</small>
                        </div>


                        {/* SECCIÓN DE CONFIGURACIÓN DE NOTIFICACIONES */}
                        <h3 style={{ margin: '20px 0 10px 0', color: '#007bff', borderBottom: '1px solid #007bff33', paddingBottom: '5px' }}>Configuración de Notificación</h3>
                        
                        {/* 1. Habilitar Notificación */}
                        <div className="form-group checkbox-group">
                            <input 
                                type="checkbox" 
                                id="habilitar_notificacion" 
                                checked={formData.habilitar_notificacion} 
                                onChange={handleInputChange}
                                style={{ width: 'auto', marginRight: '5px' }}
                            />
                            <label htmlFor="habilitar_notificacion" style={{ marginBottom: 0 }}>Habilitar Notificación por Correo</label>
                        </div>

                        {/* Grid para Umbral y Frecuencia */}
                        <div className="notification-config-grid" style={{ opacity: formData.habilitar_notificacion ? 1 : 0.6 }}>
                            {/* 2. Umbral de Días */}
                            <div className="form-group">
                                <label htmlFor="umbral_dias_notificacion">Umbral (Días Restantes)</label>
                                <input 
                                    type="number" 
                                    id="umbral_dias_notificacion" 
                                    value={formData.umbral_dias_notificacion} 
                                    onChange={handleInputChange} 
                                    min="1" 
                                    max="365"
                                    disabled={!formData.habilitar_notificacion}
                                />
                                <small style={{ color: '#6c757d' }}>Notificar si quedan X días o menos.</small>
                            </div>

                            {/* 3. Frecuencia de Notificación */}
                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                <label htmlFor="frecuencia_notificacion">Frecuencia de Notificación</label>
                                <select 
                                    id="frecuencia_notificacion" 
                                    value={formData.frecuencia_notificacion} 
                                    onChange={handleInputChange}
                                    disabled={!formData.habilitar_notificacion}
                                >
                                    <option value="Diario">Diario</option>
                                    <option value="Semanal">Semanal</option>
                                    <option value="Mensual">Mensual (30 días)</option>
                                    <option value="Trimestral">Trimestral (90 días)</option>
                                </select>
                            </div>
                        </div>

                        {/* Input para Plantilla de Correo Personalizada */}
                        <div className="form-group">
                            <label htmlFor="plantilla_correo">Plantilla de Correo Personalizada (Opcional)</label>
                            <textarea 
                                id="plantilla_correo" 
                                rows="5" 
                                placeholder="Estimado/a [NOMBRE_CLIENTE], Su contrato [ID_CONTRATO] caducará en [DIAS_RESTANTES] días. Por favor, contacte con nosotros."
                                value={formData.plantilla_correo} 
                                onChange={handleInputChange}
                            ></textarea>
                            <small style={{ color: '#6c757d' }}>Utilice `[NOMBRE_CLIENTE]`, `[ID_CONTRATO]` y `[DIAS_RESTANTES]` como placeholders.</small>
                        </div>

                        {/* Botones de Acción */}
                        <div className="button-group">
                            <button type="submit" id="saveButton" className="btn-primary" disabled={crudLoading || (!formData.id && !formData.nombre_de_cliente)}>
                                {formData.id ? 'Actualizar Configuración' : 'Crear Cliente'}
                            </button>
                            {(formData.id || formData.nombre_de_cliente) && (
                                <button type="button" id="cancelButton" className="btn-secondary" onClick={resetForm} disabled={crudLoading} style={{ flexGrow: 1 }}>
                                    Limpiar
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Panel de Listado de Clientes */}
                <div className="card" id="list-panel">
                    <h2>Clientes Configurados</h2>
                    <div id="clientListContainer">
                        
                        {crudLoading ? (
                            <p id="loadingMessage" style={{ padding: '10px' }}>{crudMessage}</p>
                        ) : clients.length === 0 ? (
                             <p style={{ textAlign: 'center', color: '#6c757d', padding: '10px' }}>{crudMessage}</p>
                        ) : (
                            <table id="clientTable">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Cliente</th>
                                        <th>Correos</th>
                                        <th>Notificación</th>
                                        <th>Umbral</th>
                                        <th>Frecuencia</th>
                                        <th>Plantilla</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody id="clientList">
                                    {clients.map(cliente => {
                                        const mailConfig = getMailConfig(cliente.mail);
                                        const rawEmailDestino = mailConfig.email_destino;
                                        const emailDestino = Array.isArray(rawEmailDestino) ? rawEmailDestino.join(', ') : (rawEmailDestino || 'Sin configurar');
                                        const habilitarNotificacion = mailConfig.habilitar_notificacion === true;
                                        const umbralDias = mailConfig.umbral_dias_notificacion || 90;
                                        const frecuencia = mailConfig.frecuencia_notificacion || 'Diario';
                                        const tienePlantillaPersonalizada = !!mailConfig.plantilla_correo && mailConfig.plantilla_correo.trim() !== '';
                                        
                                        const notifEnabledText = habilitarNotificacion ? 'Sí' : 'No';
                                        const notifClass = habilitarNotificacion ? 'notification-enabled' : 'notification-disabled';

                                        return (
                                            <tr key={cliente.id}>
                                                <td>{cliente.id}</td>
                                                <td>{cliente.nombre_de_cliente || 'N/A'}</td>
                                                <td style={{ fontSize: '0.9rem' }}>{emailDestino}</td>
                                                <td><span className={notifClass}>{notifEnabledText}</span></td>
                                                <td>{habilitarNotificacion ? umbralDias + ' días' : 'N/A'}</td>
                                                <td>{habilitarNotificacion ? frecuencia : 'N/A'}</td>
                                                <td>{tienePlantillaPersonalizada ? 'Personalizada' : 'Estándar'}</td>
                                                <td className="action-cell">
                                                    <button 
                                                        className="btn-primary" 
                                                        onClick={() => populateForm(cliente)}
                                                        style={{ width: 'auto' }}
                                                    >
                                                        Configurar
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                        
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationSetting;