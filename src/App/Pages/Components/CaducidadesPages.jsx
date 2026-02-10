import React, { useState, useEffect, useCallback } from 'react';
import {selectClient, updateClient} from '../../Service/Components/Service' 
import { TableCaducidades } from '../../../Components/TableCaducidades';
import { FormCaducidades } from '../../../Components/FormCaducidades';
import Swal from "sweetalert2";

const CADUCIDADES_STYLES = `
    /* Campos deshabilitados */
    #clientId:disabled, #nombreReadOnly:disabled, #fecha_caducidad:disabled {
        background-color: #e9ecef;
        color: #495057;
    }  `;

const initialFormState = {
    id: null,
    nombre_de_cliente: '',
    fecha_de_caducidad: '', // Fecha actual (Read-only)
    nueva_fecha_de_caducidad: '', // Nueva fecha pendiente (Editable)
};

const CaducidadesPages = () => {
    const [formData, setFormData] = useState(initialFormState);
    const [clients, setClients] = useState([]);
    const [crudLoading, setCrudLoading] = useState(true);

    useEffect(() => {
        loadClientes();
        
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

   
    const populateForm = useCallback((cliente) => {
        setFormData({
            id: cliente.id,
            nombre_de_cliente: cliente.nombre_de_cliente || '',
            fecha_de_caducidad: cliente.fecha_de_caducidad || '',
            nueva_fecha_de_caducidad: cliente.nueva_fecha_de_caducidad || '',
        });
        window.scrollTo(0, 0);
    }, []);

    const resetForm = useCallback(() => {
        setFormData(initialFormState);
    }, []);

    const handleSubmit = async (e) => {
    e.preventDefault();

    const { id, nueva_fecha_de_caducidad } = formData;
    const nuevaFechaIngresada = nueva_fecha_de_caducidad.trim();
    
    if (!id) {
        Swal.fire({ title: 'Selecciona un cliente', text:  'Por favor, selecciona un cliente de la lista primero.', icon: 'error', });
        return;
    }

    if (!nuevaFechaIngresada) {
        Swal.fire({ title: 'Ingrese una Fecha', text:  'Debes ingresar un valor en "Nueva Fecha de Caducidad".', icon: 'error', });
        return;
    }
 setCrudLoading(true);
 formData.nueva_fecha_de_caducidad=nuevaFechaIngresada
    const { error } = await updateClient(formData);

    if (error) {
        console.error('Error actualizando cliente:', error);
        Swal.fire({ title: 'Error al actualizar:', text:  '' + error.message, icon: 'error', });
        alert();
    } else {
        Swal.fire({ title: 'Fecha actualizada', text:  `Nueva fecha de caducidad actualizada con éxito para el cliente ID ${id}.`, icon: 'success', });
        await loadClientes();
        resetForm();
    }

    setCrudLoading(false);
};
    return (
        <div>
            <style dangerouslySetInnerHTML={{ __html: CADUCIDADES_STYLES }} />


            <div id="update-container">
                <FormCaducidades setFormData={setFormData} formData={formData} handleSubmit={handleSubmit} crudLoading={crudLoading} resetForm={resetForm}/>
                <div id="table-container">
                    <h2>Lista de Clientes</h2>
                    {crudLoading && !clients.length ? (
                        <p style={{ textAlign: 'center', padding: '20px' }}>Cargando lista de clientes...</p>
                    ) : (<TableCaducidades clients={clients} populateForm={populateForm} crudLoading={crudLoading}/>)}
                </div>
            </div>
        </div>
    );
};

export default CaducidadesPages;