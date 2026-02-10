import Swal from "sweetalert2";
import  { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../Service/Database/Supabase'; 
import { TableClientes } from '../../../Components/TableClientes';
import { FormClientes } from '../../../Components/FormClientes';
const getStyles = () => `
    #crud-container {
        display: grid;
        grid-template-columns:250px 1fr;
        gap: 20px;
        max-width: 1200px;
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
    const [clientes, setClientes] = useState([]);
    const [formData, setFormData] = useState(initialFormState);
    const [crudLoading, setCrudLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {loadClientes();   }, []);

    
    const mapFormToDB = (data) => ({
        nombre_de_cliente: data.nombre,
        fecha_de_caducidad: data.fecha_caducidad || null,
        nueva_fecha_de_caducidad: data.nueva_fecha_caducidad || null,
        soporte: data.soporte,
        prioridad: data.prioridad,
        state: data.estado,
    });

    
    const mapDBToForm = (cliente) => ({
        id: cliente.id,
        nombre: cliente.nombre_de_cliente,
        fecha_caducidad: cliente.fecha_de_caducidad,
        nueva_fecha_caducidad: cliente.nueva_fecha_de_caducidad,
        soporte: cliente.soporte,
        prioridad: cliente.prioridad,
        estado: cliente.state || 'N/A',
    });

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
    }, []);

   
    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    
    const populateForm = (cliente) => {
        setFormData(mapDBToForm(cliente));
        setIsUpdating(true);
        window.scrollTo(0, 0); 
    };

    
    const resetForm = () => {
        setFormData(initialFormState);
        setIsUpdating(false);
    };

    
    const deleteCliente = async (id, nombre) => {
        Swal.fire({
      title: `¿Está seguro de Esto?, Esta acción es irreversible!`,
      showCancelButton: true,
      confirmButtonText: "Si",
      }  ).then(async (result) => {
        if (result.isConfirmed) {
         
            const { error } = await supabase
                .from('clientes')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Error eliminando cliente:', error);
            } else {
                loadClientes();
            }
    }})
        
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        const clienteData = mapFormToDB(formData);
        if (formData.id) {
            const { error } = await supabase
                .from('clientes')
                .update(clienteData)
                .eq('id', formData.id);

            if (error) console.error('Error actualizando cliente:', error);
            Swal.fire({ title: 'Cliente Actualizado', text: '', icon: 'success', });
        } else {
            // Crear
            const { error } = await supabase
                .from('clientes')
                .insert(clienteData);

            if (error) console.error('Error creando cliente:', error);
            Swal.fire({ title: 'Cliente Creado', text: '', icon: 'success', });
        }
         
        resetForm();
        loadClientes(); // Recargar la tabla
    };

    // --- Componente CRUD de Clientes (JSX) ---
    return (
        <div>
            {/* INCLUSIÓN DE ESTILOS */}
            <style dangerouslySetInnerHTML={{ __html: getStyles() }} />

            <div id="crud-container">
                <FormClientes handleChange={handleChange} formData={formData} handleSubmit={handleSubmit} isUpdating={isUpdating} resetForm={resetForm}/>
                <div id="table-container">
                    <h2>Lista de Clientes</h2>
                    {crudLoading && !clientes.length? (
                        <div>Cargando lista de clientes...</div>
                    ) : (<TableClientes clientes={clientes} populateForm={populateForm} deleteCliente={deleteCliente}/> )}
                </div>
            </div>
        </div>
    );
};

export default ClientesPages;