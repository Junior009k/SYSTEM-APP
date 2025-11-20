import React from 'react';
import { NavLink } from 'react-router-dom';
import { supabase } from '../../Auth/Supabase/Supabase'; // Ajusta la ruta a tu archivo Supabase

// --- CSS DEL NAVBAR INYECTADO (Basado en la paleta de colores de Dashboard) ---
const NAVBAR_STYLES = `
    /* 1. Base del Navbar */
    .app-navbar {
        background-color: #F0F4F8; /* Gris azulado suave (--color-primary-bg) */
        box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.06);
        border-bottom: 1px solid #E5E7EB;
        z-index: 50;
        height: 4rem; /* h-16 */
        display: flex;
        align-items: center;
    }

    .nav-inner-container {
        max-width: 1380px;
        width: 100%;
        margin: 0 auto;
        padding: 0 1.5rem; 
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    /* 2. Marca y Logo */
    .nav-brand h1 {
        font-size: 1.25rem; 
        font-weight: 800; 
        color: #1E40AF; /* Azul corporativo (--color-corporate-blue) */
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin: 0;
    }
    
    /* 3. Enlaces de Navegación */
    .nav-links-group {
        display: flex;
        gap: 1rem; 
        align-items: center;
        height: 100%;
    }

    .nav-link {
        display: flex;
        align-items: center;
        padding: 0.5rem 0.75rem;
        border-radius: 0.375rem; 
        font-size: 0.875rem; 
        font-weight: 500; 
        transition: all 0.3s ease-in-out; /* ANIMACIÓN: Transición suave */
        border-bottom: 2px solid transparent;
        text-decoration: none;
        color: #6B7280; /* Gris medio (--color-text-medium) */
    }

    .nav-link:hover { /* HOVER: Efecto sutil */
        color: #3B82F6; /* Azul de foco (--color-focus-ring-blue) */
        border-bottom-color: rgba(59, 130, 246, 0.5); 
    }

    /* 4. Enlace Activo */
    .nav-link.active {
        background-color: #FFFFFF; /* Fondo Blanco para efecto de pestaña */
        color: #1E40AF; /* Azul corporativo */
        border-bottom-color: #3B82F6; /* Borde inferior azul de foco */
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05) inset; /* Sombra interior suave */
    }
    
    .nav-link svg {
        margin-right: 0.25rem;
        color: #6B7280; /* Color base del ícono */
    }
    
    .nav-link.active svg {
        color: #1E40AF; /* Icono azul corporativo cuando está activo */
    }

    /* 5. Info de Usuario y Botón */
    .nav-user-info {
        display: flex;
        align-items: center;
    }
    
    .nav-user-text {
        font-size: 0.875rem; 
        color: #4B5563; 
        margin-right: 1rem;
        display: none; 
    }
    
    @media (min-width: 640px) {
        .nav-user-text {
            display: block;
        }
    }

    .nav-logout-button {
        background-color: #DC2626; /* Rojo de estado (--status-red) */
        color: white;
        padding: 0.35rem 0.75rem;
        border-radius: 9999px; /* rounded-full */
        font-size: 0.875rem; 
        font-weight: 500; 
        cursor: pointer;
        border: none;
        transition: all 0.2s; /* ANIMACIÓN: Transición para hover */
        box-shadow: 0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1);
    }
    
    .nav-logout-button:hover { /* HOVER: Efecto de escala */
        background-color: #C53030; 
        transform: scale(1.05); 
    }
`;

// --- Definición de Rutas e Iconos SVG ---
const menuItems = [
    { 
      path: "/Clientes", name: "Clientes", 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> 
    },
    { 
      path: "/Reportes", name: "Reportes", 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg> 
    },
    { 
      path: "/Notificacion", name: "Notificaciones", 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg> 
    },
    { 
      path: "/Caducidades", name: "Caducidades", 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> 
    },
    { 
      path: "/ClientesMigration", name: "Migración", 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v5"/><path d="M3 12v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5"/><path d="M9 12h6"/></svg> 
    },
];


const Navbar = ({ onLogout, userEmail }) => {
    
    const handleLogout = onLogout || (async () => {
        await supabase.auth.signOut();
    });

    return (
        <>
            {/* 1. INYECCIÓN DEL CSS */}
            <style dangerouslySetInnerHTML={{ __html: NAVBAR_STYLES }} />
            
            {/* 2. ESTRUCTURA USANDO LAS CLASES INYECTADAS */}
            <nav className="app-navbar">
                <div className="nav-inner-container">
                    
                    {/* MARCA/LOGO */}
                    <div className="nav-brand">
                        <h1>
                            {/* SVG Icon (Corporate Blue) */}
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1E40AF" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
                            AdminPanel
                        </h1>
                    </div>

                    {/* ENLACES DE NAVEGACIÓN */}
                    <div className="nav-links-group">
                        {menuItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                // Usa la clase base y añade 'active' si corresponde
                                className={({ isActive }) => 
                                    `nav-link ${isActive ? 'active' : ''}`
                                }
                            >
                                {item.icon}
                                {item.name}
                            </NavLink>
                        ))}
                    </div>

                    {/* INFO DE USUARIO Y BOTÓN DE LOGOUT */}
                    <div className="nav-user-info">
                        <span className="nav-user-text">
                            Usuario: <span style={{ fontWeight: 600 }}>{userEmail}</span>
                        </span>
                        <button 
                            onClick={handleLogout}
                            className="nav-logout-button"
                        >
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </nav>
        </>
    );
};

export default Navbar;