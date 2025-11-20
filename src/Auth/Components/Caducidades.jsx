import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../Supabase/Supabase'; 
import Login from './Login';

const TABLE_NAME = 'clientes';

// --- CSS del HTML original (Incluido para fidelidad visual) ---
const CADUCIDADES_STYLES = `
    body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        margin: 0;
        padding: 20px;
        background-color: #f4f7f6;
        color: #333;
    }
    h1, h2 {
        color: #1a202c;
    }
    #crud-container {
        display: grid;
        grid-template-columns: 300px 1fr;
        gap: 30px;
        max-width: 1200px;
        margin: 0 auto;
    }
    @media (max-width: 1024px) {
        #crud-container {
            grid-template-columns: 1fr;
        }
    }
    #clientForm {
        background: #fff;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        display: flex;
        flex-direction: column;
        gap: 15px;
    }
    #clientForm div {
        display: flex;
        flex-direction: column;
    }
    #clientForm label {
        margin-bottom: 5px;
        font-weight: 600;
    }
    #clientForm input, 
    #clientForm button {
        padding: 10px;
        border-radius: 5px;
        border: 1px solid #ddd;
        font-size: 16px;
    }
    #clientForm button {
        background-color: #2c5282;
        color: white;
        border: none;
        cursor: pointer;
        transition: background-color 0.2s;
    }
    #clientForm button:hover {
        background-color: #2a4365;
    }
    #clientForm button[type="button"] {
        background-color: #a0aec0;
    }
    #clientForm button[type="button"]:hover {
        background-color: #718096;
    }

    /* Campos deshabilitados */
    #clientId:disabled, #nombreReadOnly:disabled, #fecha_caducidad:disabled {
        background-color: #e9ecef;
        color: #495057;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        background: #fff;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        border-radius: 8px;
        overflow: hidden;
    }
    th, td {
        padding: 12px 15px;
        text-align: left;
        border-bottom: 1px solid #eee;
    }
    th {
        background-color: #edf2f7;
    }
    tr:hover {
        background-color: #f7fafc;
    }
    .actions button {
        margin-right: 5px;
        padding: 5px 10px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }
    .edit-btn {
        background-color: #3182ce;
        color: white;
    }
    .delete-btn { /* No se usa en este módulo pero se mantiene por si acaso */
        background-color: #e53e3e; 
        color: white;
    }

    /* Estilos de Auth UI */
    #auth-form {
        max-width: 400px;
        margin: 50px auto;
        padding: 25px;
        border-radius: 12px;
        box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1); 
        background: #fff;
        display: flex;
        flex-direction: column;
        gap: 15px;
    }
    #auth-form input {
        padding: 10px;
        border: 1px solid #ced4da;
        border-radius: 6px;
        font-size: 1rem;
        width: 100%;
        box-sizing: border-box;
    }
    #auth-form button {
        width: 100%;
        margin-top: 15px;
    }
    .logout-button {
        background-color: #e53e3e;
        color: white;
        border: none;
        padding: 8px 12px;
        border-radius: 5px;
        cursor: pointer;
        transition: background-color 0.2s;
    }
    .logout-button:hover {
        background-color: #c53030;
    }
`;

// --- Estado Inicial del Formulario ---
const initialFormState = {
    id: null,
    nombre_de_cliente: '',
    fecha_de_caducidad: '', // Fecha actual (Read-only)
    nueva_fecha_caducidad: '', // Nueva fecha pendiente (Editable)
    fechaPromocionable: null, // 🌟 VALOR CLAVE: Valor que se promoverá al guardar
};

const Caducidades = () => {
    // --- Estado de Autenticación ---
    const [session, setSession] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [authEmail, setAuthEmail] = useState('');
    const [authMessage, setAuthMessage] = useState('');

    // --- Estado CRUD ---
    const [formData, setFormData] = useState(initialFormState);
    const [clients, setClients] = useState([]);
    const [crudLoading, setCrudLoading] = useState(true);

    // --- Lógica de Autenticación ---

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            setAuthLoading(false);
        };

        getSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session);
                setAuthLoading(false);
                if (session) {
                    loadClientes();
                } else {
                    setClients([]);
                }
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setAuthLoading(true);
        setAuthMessage('');
        const { error } = await supabase.auth.signInWithOtp({ email: authEmail });

        if (error) {
            setAuthMessage(error.error_description || error.message);
        } else {
            setAuthMessage('¡Revisa tu correo electrónico para el enlace mágico!');
        }
        setAuthLoading(false);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };


    // --- Lógica CRUD y Promoción de Fechas ---

    const loadClientes = useCallback(async () => {
        setCrudLoading(true);
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('id, nombre_de_cliente, fecha_de_caducidad, nueva_fecha_de_caducidad, soporte, prioridad')
            .order('id', { ascending: true });

        if (error) {
            console.error('Error al cargar clientes:', error);
            setClients([]);
        } else {
            setClients(data);
        }
        setCrudLoading(false);
    }, []);

    /**
     * Rellena el formulario con los datos de un cliente y prepara la fecha para la promoción.
     */
    const populateForm = useCallback((cliente) => {
        setFormData({
            id: cliente.id,
            nombre_de_cliente: cliente.nombre_de_cliente || '',
            fecha_de_caducidad: cliente.fecha_de_caducidad || '',
            nueva_fecha_caducidad: cliente.nueva_fecha_de_caducidad || '', // Valor editable
            // 🌟 GUARDAR EL VALOR DE LA FECHA PENDIENTE ANTES DE QUE EL USUARIO LO EDITE
            fechaPromocionable: cliente.nueva_fecha_de_caducidad || null, 
        });
        window.scrollTo(0, 0);
    }, []);

    const resetForm = useCallback(() => {
        setFormData(initialFormState);
    }, []);

    /**
     * Maneja el envío del formulario para actualizar y promover fechas.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const { id, fechaPromocionable, nueva_fecha_caducidad } = formData;
        const nuevaFechaIngresada = nueva_fecha_caducidad.trim();

        if (!id) {
            alert('Por favor, selecciona un cliente de la lista primero.');
            return;
        }

        // Validación: Asegura que haya una fecha válida para la nueva caducidad
        if (!nuevaFechaIngresada) {
            alert('Debes ingresar un valor en "Nueva Fecha de Caducidad" para aplicar la actualización.');
            return;
        }

        setCrudLoading(true);

        // 🌟 LÓGICA CLAVE: Promoción de Fechas
        const fechaQueSeraActual = fechaPromocionable; // La antigua 'nueva_fecha_de_caducidad'
        const nuevaFechaPendiente = nuevaFechaIngresada; // La fecha que el usuario acaba de ingresar

        const updateData = {
            // 1. La NUEVA FECHA ACTUAL es el valor promocionado 
            fecha_de_caducidad: fechaQueSeraActual || null, 
            
            // 2. La NUEVA FECHA PENDIENTE es el valor ingresado por el usuario
            nueva_fecha_de_caducidad: nuevaFechaPendiente || null, 
        };

        const { error } = await supabase
            .from(TABLE_NAME)
            .update(updateData) 
            .eq('id', id);

        if (error) {
            console.error('Error actualizando cliente:', error);
            alert('Error al actualizar: ' + error.message);
        } else {
            alert(`Fechas para el cliente ID ${id} actualizadas con éxito. Nueva fecha actual: ${updateData.fecha_de_caducidad}.`);
            await loadClientes(); // Recargar la tabla
            resetForm(); // Limpiar el formulario
        }
        setCrudLoading(false);
    };

    // --- Componente de Autenticación (JSX) ---
    if (authLoading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}>Cargando autenticación...</div>;
    }

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
            <style dangerouslySetInnerHTML={{ __html: CADUCIDADES_STYLES }} />


            <div id="crud-container">
                {/* Panel de Formulario de Actualización */}
                <form id="clientForm" onSubmit={handleSubmit}>
                    <h2>Actualizar Fechas del Cliente</h2>
                    
                    <div>
                        <label htmlFor="clientId">ID de Cliente</label>
                        <input type="text" id="clientId" value={formData.id || ''} disabled />
                    </div>
                    
                    <div>
                        <label htmlFor="nombreReadOnly">Nombre de Cliente</label>
                        <input type="text" id="nombreReadOnly" value={formData.nombre_de_cliente} disabled />
                    </div>

                    <hr style={{ borderTop: '1px solid #eee' }} />
                    
                    <div>
                        <label htmlFor="fecha_caducidad">Fecha de Caducidad Actual (se actualizará con el valor de "Nueva Fecha Caducidad" al guardar)</label>
                        <input type="date" id="fecha_caducidad" value={formData.fecha_de_caducidad} disabled /> 
                    </div>

                    <div>
                        <label htmlFor="nueva_fecha_caducidad">Nueva Fecha de Caducidad (Editable)</label>
                        <input 
                            type="date" 
                            id="nueva_fecha_caducidad" 
                            value={formData.nueva_fecha_caducidad}
                            onChange={(e) => setFormData(prev => ({ ...prev, nueva_fecha_caducidad: e.target.value }))}
                            disabled={!formData.id || crudLoading}
                        />
                    </div>
                    
                    <button type="submit" id="saveButton" disabled={!formData.id || crudLoading}>
                        {crudLoading ? 'Guardando...' : formData.id ? 'Aplicar Nueva Fecha' : 'Selecciona un Cliente para Actualizar'}
                    </button>
                    {formData.id && (
                        <button type="button" id="cancelButton" onClick={resetForm} disabled={crudLoading}>
                            Cancelar
                        </button>
                    )}
                </form>

                {/* Panel de Listado de Clientes */}
                <div id="table-container">
                    <h2>Lista de Clientes</h2>
                    {crudLoading && !clients.length ? (
                        <p style={{ textAlign: 'center', padding: '20px' }}>Cargando lista de clientes...</p>
                    ) : (
                        <table id="clientTable">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nombre</th>
                                    <th>Caducidad</th>
                                    <th>Nueva Caducidad</th>
                                    <th>Soporte</th>
                                    <th>Prioridad</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {clients.map(cliente => (
                                    <tr key={cliente.id}>
                                        <td>{cliente.id}</td>
                                        <td>{cliente.nombre_de_cliente || 'N/A'}</td>
                                        <td>{cliente.fecha_de_caducidad || 'N/A'}</td>
                                        <td>{cliente.nueva_fecha_de_caducidad || 'N/A'}</td>
                                        <td>{cliente.soporte || 'N/A'}</td>
                                        <td>{cliente.prioridad || 'N/A'}</td>
                                        <td className="actions">
                                            <button 
                                                className="edit-btn" 
                                                onClick={() => populateForm(cliente)}
                                                disabled={crudLoading}
                                            >
                                                Actualizar Fechas
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Caducidades;