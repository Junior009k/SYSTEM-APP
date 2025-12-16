// src/components/Register.js
import React, { useState, useEffect } from 'react';
import { supabase } from '../../Service/Database/Supabase'; // Asegúrate de que la ruta sea corr
import Dashboard from '../../Pages/Components/DashboardPages';
const Register = () => {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState('');
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Usamos la función signUp de Supabase
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          // El nombre es metadata y se puede pasar en el objeto 'data'
          data: { 
            nombre: nombre, 
          }
        }
      });

      if (error) throw error;
      
      // La mayoría de las configuraciones de Supabase Auth envían un email de confirmación.
      setMessage('¡Registro exitoso! Revisa tu email para confirmar tu cuenta antes de iniciar sesión.');
      
    } catch (error) {
      setMessage(`Error al registrar: ${error.message}`);
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
              <Dashboard/>
          );
      }
  return (
    <div className="login-container"> {/* <= Mismo contenedor de estética */}
      <div className="login-card"> {/* <= Misma tarjeta */}
        <h2>Crear Cuenta</h2>
        <form onSubmit={handleSubmit}>
          
          {/* Campo extra: Nombre */}
          <div className="form-group">
            <label htmlFor="nombre">Nombre</label>
            <input
              type="text"
              id="nombre"
              className="input-field" // Misma clase CSS
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              disabled={loading}
              placeholder="Tu nombre completo"
            />
          </div>

          {/* Campo Email */}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              className="input-field" // Misma clase CSS
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              placeholder="tu@email.com"
            />
          </div>
          
          {/* Campo Contraseña */}
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              className="input-field" // Misma clase CSS
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              placeholder="Crea una contraseña segura"
            />
          </div>
          
          <button type="submit" className="submit-button" disabled={loading}> {/* Misma clase CSS */}
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
          
          {message && (
            <p className={`message ${message.startsWith('Error') ? 'error' : 'success'}`}>
              {message}
            </p>
          )}

        </form>
        <p className="forgot-password">
          ¿Ya tienes cuenta? <a href="/">Iniciar Sesión</a>
        </p>
      </div>
    </div>
  );
};

export default Register;