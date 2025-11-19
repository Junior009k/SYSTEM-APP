import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../Supabase/Supabase'; 
import Login from './Login';
const TABLE_NAME = 'clientes';


// --- CSS del HTML original (Adaptado a React) ---
const MIGRATION_STYLES = `
    body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        margin: 0;
        padding: 20px;
        background-color: #f4f7f6;
        color: #333;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
    }
    h1, h2 {
        color: #1a202c;
        text-align: center;
    }
    #crud-container {
        max-width: 600px;
        width: 100%;
        margin: 40px auto;
    }
    
    /* Estilos para el módulo de Carga Masiva (Drag & Drop Zone) */
    #massUploadContainer {
        background: #fff;
        padding: 30px;
        border-radius: 12px;
        box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
        display: flex;
        flex-direction: column;
        gap: 20px;
        border: 2px dashed #4299e1; 
        text-align: center;
        transition: all 0.2s ease-in-out;
    }
    
    /* ESTILO PARA CUANDO SE ARRASTRA EL ARCHIVO SOBRE LA ZONA */
    .drag-over {
        background-color: #ebf8ff; 
        border-color: #3182ce !important;
        border-style: solid !important; 
        box-shadow: 0 10px 20px rgba(49, 130, 206, 0.3) !important;
    }
    
    #clientFile {
        display: none; 
    }

    #selectFileButton {
        background-color: #48bb78; 
        color: white;
        border: none;
        padding: 12px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 16px;
        font-weight: 700;
        transition: background-color 0.2s;
        pointer-events: auto;
    }
    #selectFileButton:hover {
        background-color: #38a169;
    }
    #selectFileButton:disabled {
        background-color: #a0aec0;
        cursor: not-allowed;
    }
    #uploadStatus {
        font-size: 16px;
        font-weight: 600;
        text-align: center;
        padding-top: 10px;
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
        padding: 10px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 700;
        background-color: #2c5282;
        color: white;
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

const ClientMigration = () => {
    // --- Estado de Autenticación ---
    const [session, setSession] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [authEmail, setAuthEmail] = useState('');
    const [authMessage, setAuthMessage] = useState('');

    // --- Estado de Carga Masiva ---
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
        setAuthMessage('');
        setUploadStatus('');
    };

    // --- Lógica del Módulo de Carga Masiva ---

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
            const { error } = await supabase
                .from(TABLE_NAME)
                .insert(bulkData);

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
                <style dangerouslySetInnerHTML={{ __html: MIGRATION_STYLES }} />
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
            {/* INCLUSIÓN DE ESTILOS */}
            <style dangerouslySetInnerHTML={{ __html: MIGRATION_STYLES }} />

            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '600px', width: '100%', margin: '0 auto 20px auto', padding: '10px 0' }}>
                <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Módulo de Carga Masiva</h1>
                <button onClick={handleLogout} className="logout-button">
                    Cerrar Sesión
                </button>
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

export default ClientMigration;