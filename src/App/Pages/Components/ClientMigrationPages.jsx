import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../Service/Database/Supabase'; 
import {insertClient} from '../../Service/Components/Service'; 
import Login from '../../Auth/Components/Login';


const ClientMigrationPages = () => {
    const [session, setSession] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [uploadStatus, setUploadStatus] = useState('');
    const [uploading, setUploading] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);

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
            }
        );

        return () => subscription.unsubscribe();
    }, []);


    /**
     * Función central para procesar el archivo y realizar la inserción masiva.
     */
    const handleFileUpload = useCallback(async (file) => {
        if (file.type !== 'text/plain') {
            setUploadStatus('❌ Formato de archivo no válido. Por favor, sube un archivo .txt.');
            return;
        }

        setUploading(true);
        setUploadStatus(`⏳ Leyendo archivo: ${file.name}...`);
        
        const reader = new FileReader();
        reader.onload = async (e) => {
            const text = e.target.result;
            // Dividir por líneas, limpiar espacios y filtrar líneas vacías
            const names = text.split('\n')
                .map(name => name.trim())
                .filter(name => name.length > 0);

            if (names.length === 0) {
                setUploadStatus('⚠️ El archivo no contiene nombres válidos.');
                setUploading(false);
                return;
            }
            
            // Crea el array de objetos con los campos por defecto del HTML original
            const bulkData = names.map(name => ({
                nombre_de_cliente: name,
                fecha_de_caducidad: null,
                nueva_fecha_de_caducidad: null,
                soporte: 'Básico', 
                prioridad: 'Baja',
            }));

            setUploadStatus(`⏳ Procesando ${bulkData.length} clientes e insertando en Supabase...`);

            // Realizar la inserción masiva en Supabase
            const { error } = insertClient(bulkData)
            if (error) {
                console.error('Error en la carga masiva:', error);
                setUploadStatus(`❌ Error al insertar clientes: ${error.message}`);
            } else {
                setUploadStatus(`✅ ¡Carga Masiva Exitosa! Se crearon ${bulkData.length} clientes.`);
            }
            setUploading(false);
            // Limpiar el input file
            document.getElementById('clientFile').value = '';
        };

        reader.readAsText(file);
    }, []);


    // --- Lógica Drag & Drop (React Events) ---

    const handleDragOver = (e) => {
        e.preventDefault();
        if (!uploading) setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);

        if (uploading) return;

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileUpload(files[0]);
        } else {
            setUploadStatus('❌ No se soltó ningún archivo.');
        }
    };

    // Manejar la selección manual de archivo
    const handleFileInputChange = (e) => {
        if (e.target.files.length > 0) {
            handleFileUpload(e.target.files[0]);
        }
    };


    // --- Componente de Autenticación (JSX) ---
    if (authLoading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                Cargando autenticación...
            </div>
        );
    }
     if (!session) {
        return (
            <Login/>
        );
    }
    // --- Componente Principal de Carga Masiva (JSX) ---
    return (
        <div>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '600px', width: '100%', margin: '0 auto 20px auto', padding: '10px 0' }}>
                <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Módulo de Carga Masiva</h1>
            </header>

            <div id="crud-container">
                <div 
                    id="massUploadContainer"
                    className={isDragOver ? 'drag-over' : ''}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    style={{ pointerEvents: uploading ? 'none' : 'auto', cursor: uploading ? 'wait' : 'default' }}
                >
                    <h2>Clientes desde Archivo (.txt)</h2>
                    <p id="dropPrompt">👉 **Arrastra y suelta** tu archivo **.txt** aquí.</p>
                    
                    <input 
                        type="file" 
                        id="clientFile" 
                        accept=".txt" 
                        onChange={handleFileInputChange}
                        disabled={uploading}
                    />

                    <p>O</p>
                    
                    <button 
                        type="button" 
                        id="selectFileButton"
                        onClick={() => document.getElementById('clientFile').click()}
                        disabled={uploading}
                    >
                        {uploading ? 'Cargando...' : 'Seleccionar Archivo'}
                    </button>
                    
                    <p id="uploadStatus" style={{ color: uploadStatus.includes('❌') ? 'red' : uploadStatus.includes('✅') ? 'green' : 'black' }}>{uploadStatus}</p>
                </div>
            </div>
        </div>
    );
};

export default ClientMigrationPages;