import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../Service/Database/Supabase'; 
import Login from '../../Auth/Components/Login';


const getStyles = () => `
    
    #crud-container {
        display: grid;
        grid-template-columns: 300px 1fr;
        gap: 30px;
        max-width: 1200px;
        margin: 0 auto;
    }
    #clientForm, #auth-form {
        background: #fff;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        display: flex;
        flex-direction: column;
        gap: 15px;
    }
    #clientForm div, #auth-form div {
        display: flex;
        flex-direction: column;
    }
    #clientForm label, #auth-form label {
        margin-bottom: 5px;
        font-weight: 600;
    }
    #clientForm input, 
    #clientForm select, 
    #clientForm button, 
    #auth-form input,
    #auth-form button {
        padding: 10px;
        border-radius: 5px;
        border: 1px solid #ddd;
        font-size: 16px;
    }
    #clientForm button, #auth-form button {
        background-color: #2c5282;
        color: white;
        border: none;
        cursor: pointer;
        transition: background-color 0.2s;
    }
   
`;

const initialFormState = {
    id: null,
    nombre: '',
    fecha_caducidad: '',
    nueva_fecha_caducidad: '',
    soporte: 'Básico',
    prioridad: 'Baja',
    estado: 'N/A',
};

const ClientesPages = () => {
    // --- Estado de Autenticación ---
    const [session, setSession] = useState(null);
    const [authLoading, setAuthLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [authMessage, setAuthMessage] = useState('');

    // --- Estado CRUD ---
    const [clientes, setClientes] = useState([]);
    const [formData, setFormData] = useState(initialFormState);
    const [crudLoading, setCrudLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

    // --- Lógica de Autenticación ---

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            if (session) {
                loadClientes();
            } else {
                setCrudLoading(false);
            }
        };

        getSession();

        // Escuchar cambios de estado de autenticación
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session);
                if (session) {
                    loadClientes();
                    setAuthMessage('');
                }
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    /**
     * Mapeo de campos del formulario a campos de la DB
     */
    const mapFormToDB = (data) => ({
        nombre_de_cliente: data.nombre,
        fecha_de_caducidad: data.fecha_caducidad || null,
        nueva_fecha_de_caducidad: data.nueva_fecha_caducidad || null,
        soporte: data.soporte,
        prioridad: data.prioridad,
        state: data.estado,
    });

    /**
     * Mapeo de campos de la DB a campos del formulario
     */
    const mapDBToForm = (cliente) => ({
        id: cliente.id,
        nombre: cliente.nombre_de_cliente,
        fecha_caducidad: cliente.fecha_de_caducidad,
        nueva_fecha_caducidad: cliente.nueva_fecha_de_caducidad,
        soporte: cliente.soporte,
        prioridad: cliente.prioridad,
        estado: cliente.state || 'N/A',
    });

    /**
     * (READ) Obtiene todos los clientes.
     */
    const loadClientes = useCallback(async () => {
        setCrudLoading(true);
        const { data, error } = await supabase
            .from('clientes')
            .select('*')
            .order('id', { ascending: true });

        if (error) {
            console.error('Error cargando clientes:', error);
        } else {
            setClientes(data);
        }
        setCrudLoading(false);
    }, []); // Dependencias vacías

    /**
     * Maneja los cambios en los inputs del formulario.
     */
    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    /**
     * Rellena el formulario con los datos de un cliente para editarlo.
     */
    const populateForm = (cliente) => {
        setFormData(mapDBToForm(cliente));
        setIsUpdating(true);
        window.scrollTo(0, 0); // Desplazar al inicio para ver el formulario
    };

    /**
     * Resetea el formulario a su estado inicial.
     */
    const resetForm = () => {
        setFormData(initialFormState);
        setIsUpdating(false);
    };

    /**
     * (DELETE) Elimina un cliente.
     */
    const deleteCliente = async (id, nombre) => {
        if (window.confirm(`¿Estás seguro de que quieres eliminar a ${nombre}?`)) {
            const { error } = await supabase
                .from('clientes')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Error eliminando cliente:', error);
            } else {
                loadClientes();
            }
        }
    };

    /**
     * (CREATE/UPDATE) Maneja el envío del formulario.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        const clienteData = mapFormToDB(formData);

        if (formData.id) {
            // Actualizar
            const { error } = await supabase
                .from('clientes')
                .update(clienteData)
                .eq('id', formData.id);

            if (error) console.error('Error actualizando cliente:', error);
        } else {
            // Crear
            const { error } = await supabase
                .from('clientes')
                .insert(clienteData);

            if (error) console.error('Error creando cliente:', error);
        }

        resetForm();
        loadClientes(); // Recargar la tabla
    };

    // --- Componente de Autenticación (JSX) ---
    if (!session) {
        return (
            <Login/>
        );
    }

    // --- Componente CRUD de Clientes (JSX) ---
    return (
        <div>
            {/* INCLUSIÓN DE ESTILOS */}
            <style dangerouslySetInnerHTML={{ __html: getStyles() }} />

            <div id="crud-container">
                {/* Formulario de Clientes */}
                <form id="clientForm" onSubmit={handleSubmit}>
                    <h2>Datos del Cliente</h2>
                    <input type="hidden" id="clientId" value={formData.id || ''} />
                    
                    <div>
                        <label htmlFor="nombre">Nombre de Cliente</label>
                        <input type="text" id="nombre" value={formData.nombre} onChange={handleChange} required />
                    </div>
                    
                    <div>
                        <label htmlFor="fecha_caducidad">Fecha de Caducidad</label>
                        <input type="date" id="fecha_caducidad" value={formData.fecha_caducidad || ''} onChange={handleChange} />
                    </div>

                    <div>
                        <label htmlFor="nueva_fecha_caducidad">Nueva Fecha de Caducidad</label>
                        <input type="date" id="nueva_fecha_caducidad" value={formData.nueva_fecha_caducidad || ''} onChange={handleChange} />
                    </div>
                    
                    <div>
                        <label htmlFor="soporte">Soporte</label>
                        <select id="soporte" value={formData.soporte} onChange={handleChange}>
                            <option value="Básico">Básico</option>
                            <option value="Estándar">Estándar</option>
                            <option value="Premium">Premium</option>
                        </select>
                    </div>
                    
                    <div>
                        <label htmlFor="prioridad">Prioridad</label>
                        <select id="prioridad" value={formData.prioridad} onChange={handleChange}>
                            <option value="Baja">Baja</option>
                            <option value="Media">Media</option>
                            <option value="Alta">Alta</option>
                        </select>
                    </div>
                    
                    <div>
                        <label htmlFor="estado">Estado</label>
                        <select id="estado" value={formData.estado} onChange={handleChange}>
                            <option value="N/A">N/A</option>
                            <option value="Pedido">Pedido</option>
                            <option value="Enviado">Enviado</option>
                            <option value="Pendiente">Pendiente</option>
                            <option value="Listo">Listo</option>
                        </select>
                    </div>
                    
                    <button type="submit" id="saveButton">
                        {isUpdating ? 'Actualizar' : 'Guardar'}
                    </button>
                    {isUpdating && (
                        <button type="button" id="cancelButton" onClick={resetForm}>
                            Cancelar
                        </button>
                    )}
                </form>

                {/* Tabla de Clientes */}
                <div id="table-container">
                    <h2>Lista de Clientes</h2>
                    {crudLoading ? (
                        <div>Cargando lista de clientes...</div>
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
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {clientes.map((cliente) => (
                                    <tr key={cliente.id}>
                                        <td>{cliente.id}</td>
                                        <td>{cliente.nombre_de_cliente}</td>
                                        <td>{cliente.fecha_de_caducidad || 'N/A'}</td>
                                        <td>{cliente.nueva_fecha_de_caducidad || 'N/A'}</td>
                                        <td>{cliente.soporte}</td>
                                        <td>{cliente.prioridad}</td>
                                        <td>{cliente.state || 'N/A'}</td>
                                        <td className="actions">
                                            <button className="edit-btn" onClick={() => populateForm(cliente)}>
                                                Editar
                                            </button>
                                            <button className="delete-btn" onClick={() => deleteCliente(cliente.id, cliente.nombre_de_cliente)}>
                                                Eliminar
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

export default ClientesPages;