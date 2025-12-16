// src/components/Login.js
import React, { useState , useEffect} from 'react';
import { supabase } from '../../Service/Database/Supabase'; // Asegúrate de que la ruta sea corr
import DashboardPages from '../../Pages/Components/DashboardPages';

const Login = () => {
  // --- Estado de Autenticación ---
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(''); // Para mensajes de error/éxito

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(''); // Limpiar mensajes anteriores

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) throw error;
      
      setMessage('¡Inicio de sesión exitoso! Redirigiendo...');
      // console.log('Usuario logueado:', data.user);
      // Aquí puedes redirigir al usuario al dashboard, ej:
      // window.location.href = '/dashboard'; 

    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

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

   if (session) {
          return (
              <DashboardPages/>
          );
      }
  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Iniciar Sesión</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              placeholder="tu@email.com"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              placeholder="********"
            />
          </div>
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Cargando...' : 'Entrar'}
          </button>
          {message && (
            <p className={`message ${message.startsWith('Error') ? 'error' : 'success'}`}>
              {message}
            </p>
          )}
        </form>
        <p className="forgot-password">
          <a href="/reset-password">¿Olvidaste tu contraseña?</a>
        </p>
        No tienes cuenta? <a href="/Register">Registra</a>
      </div>
    </div>
  );
};

export default Login;