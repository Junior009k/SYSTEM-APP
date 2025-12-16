import './App.css';
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import { supabase } from './App/Service/Database/Supabase';

// Componentes
import Login from './App/Auth/Components/Login';
import Register from './App/Auth/Components/Register';
import ClientesPages from './App/Pages/Components/ClientPages';
import DashboardPages from './App/Pages/Components/DashboardPages';
import NotificationSettingPages from './App/Pages/Components/NotificactionSettingPages';
import CaducidadesPages from './App/Pages/Components/CaducidadesPages';
import ClientMigrationPages from './App/Pages/Components/ClientMigrationPages';
import ProfilePages from './App/Pages/Components/ProfilePages';
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
            <Route path="/Clientes" element={session ? <ClientesPages /> : <Navigate to="/" />} />
            <Route path="/Reportes" element={session ? <DashboardPages /> : <Navigate to="/" />} />
            <Route path="/Notificacion" element={session ? <NotificationSettingPages /> : <Navigate to="/" />} />
            <Route path="/Caducidades" element={session ? <CaducidadesPages /> : <Navigate to="/" />} />
            <Route path="/ClientesMigration" element={session ? <ClientMigrationPages /> : <Navigate to="/" />} />
             <Route path="/Profile" element={session ? <ProfilePages /> : <Navigate to="/" />} />
          </Routes>
        </div>
      </main>
      
    </div>
  );
}

export default App;