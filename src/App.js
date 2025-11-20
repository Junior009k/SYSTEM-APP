import './App.css';
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import { supabase } from './Auth/Supabase/Supabase';

// Componentes
import Login from './Auth/Components/Login';
import Register from './Auth/Components/Register';
import Clientes from './Auth/Components/Client';
import Dashboard from './Auth/Components/Dashboard';
import NotificationSetting from './Auth/Components/NotificactionSetting';
import Caducidades from './Auth/Components/Caducidades';
import ClientMigration from './Auth/Components/ClientMigration';
// *IMPORTANTE: Reemplazamos Sidebar por Navbar*
import Navbar from './App/Shared/Navbar'; // Asegúrate que esta ruta es correcta

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) return <div>Cargando...</div>;

  return (
    // 1. CONTENEDOR PRINCIPAL:
    // flex flex-col: Los hijos se apilan verticalmente.
    // h-screen: Fuerza la altura completa de la pantalla.
    // overflow-hidden: Prohíbe el scroll en la página entera.
    <div className="flex flex-col h-screen w-screen bg-gray-100 overflow-hidden">
      
      {/* 2. ZONA SUPERIOR: Navbar */}
      {/* shrink-0: Mantiene su altura fija (no se encoge). */}
      {session ? (
        <header className="shrink-0 z-50">
            <Navbar onLogout={handleLogout} userEmail={session.user.email} /> 
        </header>
      ) : (
        // Si no hay sesión, no se renderiza el Navbar
        null
      )}

      {/* 3. ZONA DE CONTENIDO PRINCIPAL */}
      {/* flex-1: Ocupa todo el espacio vertical restante. */}
      {/* overflow-y-auto: EL SCROLL SOLO OCURRE DENTRO DE ESTE ELEMENTO. */}
      <main className="flex-1 overflow-y-auto relative">
        <div className="p-0"> {/* Eliminamos el padding aquí y lo delegamos a los componentes internos (Dashboard) */}
          <Routes>
            {/* RUTAS PÚBLICAS */}
            <Route path="/" element={!session ? <Login /> : <Navigate to="/Reportes" />} />
            <Route path="/Register" element={!session ? <Register /> : <Navigate to="/Reportes" />} />
            
            {/* RUTAS PROTEGIDAS */}
            <Route path="/Clientes" element={session ? <Clientes /> : <Navigate to="/" />} />
            <Route path="/Reportes" element={session ? <Dashboard /> : <Navigate to="/" />} />
            <Route path="/Notificacion" element={session ? <NotificationSetting /> : <Navigate to="/" />} />
            <Route path="/Caducidades" element={session ? <Caducidades /> : <Navigate to="/" />} />
            <Route path="/ClientesMigration" element={session ? <ClientMigration /> : <Navigate to="/" />} />
          </Routes>
        </div>
      </main>
      
    </div>
  );
}

export default App;