import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../Service/Database/Supabase'; 
import {selectClient, updateClient} from '../../Service/Components/Service' 
import Login from '../../Auth/Components/Login';

const CADUCIDADES_STYLES = `
    /* Campos deshabilitados */
    #clientId:disabled, #nombreReadOnly:disabled, #fecha_caducidad:disabled {
        background-color: #e9ecef;
        color: #495057;
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

const CaducidadesPages = () => {
    // --- Estado de Autenticación ---
    const [session, setSession] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [formData, setFormData] = useState(initialFormState);
    const [clients, setClients] = useState([]);
    const [crudLoading, setCrudLoading] = useState(true);

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

    
    const loadClientes = useCallback(async () => {
        setCrudLoading(true);
        const { data, error } = await selectClient()
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

        const { error } = await updateClient(updateData)

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


            <div id="update-container">
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

export default CaducidadesPages;