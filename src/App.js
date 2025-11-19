import './App.css';
import { Routes, Route } from "react-router-dom";
import React, { useState, useEffect } from 'react';
import Login from './Auth/Components/Login';
import Register from './Auth/Components/Register';
import Clientes from './Auth/Components/Client';
import { supabase } from './Auth/Supabase/Supabase';
import Dashboard from './Auth/Components/Dashboard';
import NotificationSetting from './Auth/Components/NotificactionSetting';
import Caducidades from './Auth/Components/Caducidades';
import ClientMigration from './Auth/Components/ClientMigration';
function App() {
  const [session, setSession] = useState(null);

    useEffect(() => {
        // 1. Obtener sesión actual
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        // 2. Escuchar cambios de autenticación (login, logout)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session);
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) console.error('Error al cerrar sesión:', error);
    };
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={ <Login/> } />
        <Route path="/Register" element={ <Register/> } />
        <Route path="/Clientes" element={ <Clientes/> } />
        <Route path="/Reportes" element={ <Dashboard/> } />
        <Route path="/Notificacion" element={ <NotificationSetting/> } />
        <Route path="/Caducidades" element={ <Caducidades/> } />
        <Route path="/ClientesMigration" element={ <ClientMigration/> } />
        </Routes>
    </div>
      
  );
/* 
        /*/
}

export default App;
