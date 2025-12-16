import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

// 1. CONFIGURACIÓN DE SUPABASE
// Usando las credenciales proporcionadas anteriormente
const SUPABASE_URL = 'https://uwafsywazersqpmalmqw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3YWZzeXdhemVyc3FwbWFsbXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MDg4MzMsImV4cCI6MjA3NzQ4NDgzM30.1FzR9yUoLyPrfO9ixX4uIYJhMZM7YbV-45uIz-CF2dw';
const TABLE_NAME = 'profiles';

// Inicialización del cliente Supabase (asumimos que la librería está disponible)
// Usamos createClient ya que estamos en un entorno React/JSX
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const App = () => {
    // 2. ESTADOS
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState(null);
    const [profile, setProfile] = useState({ id: '', email: '', username: '', website: '' });
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);

    // Estado del formulario para los campos editables
    const [formState, setFormState] = useState({ username: '', website: '' });
    const [isSaving, setIsSaving] = useState(false);

    // 3. FUNCIONES DE UTILIDAD
    const showMessage = useCallback((msg, error = false) => {
        setMessage(msg);
        setIsError(error);
        setTimeout(() => setMessage(''), 5000);
    }, []);

    // 4. LÓGICA DE PERFIL (Supabase DB)

    /**
     * Crea una entrada de perfil inicial si no existe para el usuario autenticado.
     */
    const createInitialProfile = useCallback(async (userId, email) => {
        const initialUsername = email.split('@')[0] || 'usuario';
        try {
            const { error } = await supabase
                .from(TABLE_NAME)
                .insert({ id: userId, username: initialUsername });
            
            if (error) throw error;
            showMessage('Perfil inicial creado. ¡Bienvenido!');
            return { id: userId, email, username: initialUsername, website: '' };

        } catch (error) {
            showMessage(`Error al crear el perfil inicial: ${error.message}`, true);
            console.error('Error al crear perfil inicial:', error);
            return null;
        }
    }, [showMessage]);

    /**
     * Obtiene los datos del perfil de la tabla 'profiles'.
     */
    const fetchProfile = useCallback(async (userId, email) => {
        try {
            let { data, error, status } = await supabase
                .from(TABLE_NAME)
                .select(`username, website, id`)
                .eq('id', userId)
                .single();

            if (error && status !== 406) throw error;

            if (data) {
                // Perfil encontrado
                setProfile({ id: userId, email, username: data.username, website: data.website });
                setFormState({ username: data.username, website: data.website });
            } else {
                // Perfil no encontrado, crear uno
                const newProfile = await createInitialProfile(userId, email);
                if (newProfile) {
                     setProfile(newProfile);
                     setFormState({ username: newProfile.username, website: newProfile.website });
                }
            }
        } catch (error) {
            showMessage(`Error al cargar el perfil: ${error.message}`, true);
            console.error('Error al cargar perfil:', error);
        } finally {
            setLoading(false);
        }
    }, [showMessage, createInitialProfile]);


    /**
     * Maneja el envío del formulario de actualización de perfil.
     */
    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        if (!session) return;

        setIsSaving(true);

        try {
            const updates = {
                id: session.user.id,
                username: formState.username.trim(),
                website: formState.website.trim(),
                updated_at: new Date().toISOString(),
            };

            const { error } = await supabase
                .from(TABLE_NAME)
                .upsert(updates, { onConflict: 'id' });

            if (error) throw error;

            // Actualizar el estado del perfil con los nuevos datos
            setProfile(prev => ({ 
                ...prev, 
                username: updates.username, 
                website: updates.website 
            }));
            showMessage('Perfil actualizado con éxito!');
        } catch (error) {
            showMessage(`Error al actualizar el perfil: ${error.message}`, true);
            console.error('Error al actualizar perfil:', error);
        } finally {
            setIsSaving(false);
        }
    };

    /**
     * Cierra la sesión del usuario.
     */
    const logout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            showMessage(`Error al cerrar sesión: ${error.message}`, true);
        } else {
            showMessage('Sesión cerrada correctamente.');
        }
    };

    // 5. EFECTO PARA MANEJAR LA AUTENTICACIÓN
    useEffect(() => {
        const { data: listener } = supabase.auth.onAuthStateChange(
            (event, currentSession) => {
                console.log('Auth Event:', event, 'Session:', currentSession);
                setSession(currentSession);
                
                if (currentSession) {
                    const user = currentSession.user;
                    // Solo cargamos el perfil si la sesión está activa y los datos de usuario están disponibles
                    fetchProfile(user.id, user.email);
                } else {
                    setLoading(false);
                }
            }
        );

        // Limpiar el listener al desmontar el componente
        return () => {
            if (listener && listener.subscription) {
                 listener.subscription.unsubscribe();
            }
        };
    }, [fetchProfile]); // Dependencia de fetchProfile


    // 6. VISTAS CONDICIONALES (RENDERIZADO)

    /**
     * Vista de carga.
     */
    const LoadingView = () => (
        <div className="main-container text-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando estado de autenticación...</p>
        </div>
    );

    /**
     * Vista de acceso restringido.
     */
    const UnauthenticatedView = () => (
        <div className="main-container text-center py-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">🚫 Perfil No Disponible</h2>
            <p className="text-gray-600 mb-6">Debes iniciar sesión para administrar tu perfil.</p>
            <p className="text-sm text-gray-500">Esta vista solo está disponible para usuarios autenticados de Supabase.</p>
        </div>
    );

    /**
     * Vista del formulario de perfil.
     */
    const ProfilePages = () => (
        <div className="main-container">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Administrar Perfil</h2>
            
            <div className="mb-4 p-3 bg-indigo-50 border-l-4 border-indigo-500 text-indigo-700 rounded-md">
                <p className="font-medium">Email: <span className="font-normal">{profile.email}</span></p>
                <p className="text-xs mt-1">Tu ID de Usuario (uid): <span className="break-all font-mono text-xs text-gray-500">{profile.id}</span></p>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="form-group">
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">Nombre de Usuario</label>
                    <input 
                        type="text" 
                        id="username" 
                        value={formState.username}
                        onChange={(e) => setFormState({...formState, username: e.target.value})}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="website" className="block text-sm font-medium text-gray-700">Sitio Web (Opcional)</label>
                    <input 
                        type="url" 
                        id="website" 
                        value={formState.website}
                        onChange={(e) => setFormState({...formState, website: e.target.value})}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                <button 
                    type="submit" 
                    disabled={isSaving}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150"
                >
                    {isSaving ? 'Guardando...' : 'Actualizar Perfil'}
                </button>
            </form>
        </div>
    );

    // Renderizado principal
    let content;
    if (loading) {
        content = <LoadingView />;
    } else if (session) {
        content = <ProfilePages />;
    } else {
        content = <UnauthenticatedView />;
    }

    // Estilo para el mensaje de estado
    const messageClass = isError 
        ? 'text-red-600 bg-red-100 border-red-500' 
        : 'text-green-600 bg-green-100 border-green-500';

    return (
        <div className="p-4 md:p-8 min-h-screen">
            <header className="mb-8 p-4 bg-indigo-600 rounded-lg shadow-xl">
                <div className="flex justify-between items-center max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold text-white">Administración de Perfiles</h1>
                    <button 
                        onClick={session ? logout : null} 
                        disabled={loading || !session}
                        className="bg-white text-indigo-600 hover:bg-indigo-100 font-semibold py-2 px-4 rounded-lg shadow transition duration-200 disabled:opacity-50"
                    >
                        {loading ? 'Cargando...' : session ? 'Cerrar Sesión' : 'Acceso Restringido'}
                    </button>
                </div>
            </header>

            <div className="max-w-7xl mx-auto">
                <div id="view-container">
                    {content}
                </div>

                {message && (
                    <div className={`mt-4 mx-auto max-w-sm text-center p-3 border-l-4 rounded-md ${messageClass} transition duration-300`}>
                        <p className="text-sm font-medium">{message}</p>
                    </div>
                )}

                <div className="mt-8 pt-4 border-t border-gray-200 flex flex-wrap justify-center gap-4">
                    <a href="index.html" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium transition duration-150">Ir a CRUD Clientes (Simulado)</a>
                    <a href="index dashboard.html" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium transition duration-150">Ir a Dashboard (Simulado)</a>
                </div>
            </div>
        </div>
    );
};

export default App;