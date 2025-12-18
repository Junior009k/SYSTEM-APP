import React, { useState, useEffect } from 'react';
import { supabase } from '../../Service/Database/Supabase';

const ProfilePages = () => {
  // Estados para catálogos básicos
  const [perfiles, setPerfiles] = useState([]);
  const [funcionalidades, setFuncionalidades] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  
  // Estados para los resúmenes (Tablas inferiores)
  const [relacionUP, setRelacionUP] = useState([]);
  const [relacionPF, setRelacionPF] = useState([]);

  // Estados para formularios
  const [nuevoPerfil, setNuevoPerfil] = useState({ nombre: '', descripcion: '' });
  const [nuevaFunc, setNuevaFunc] = useState({ codigo: '', nombre_mostrar: '' });
  const [vinculoUP, setVinculoUP] = useState({ usuario_id: '', perfil_id: '' });
  const [vinculoPF, setVinculoPF] = useState({ perfil_id: '', funcionalidad_id: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // Carga de catálogos básicos
    const { data: p } = await supabase.from('perfiles').select('*');
    const { data: f } = await supabase.from('funcionalidades').select('*');
    const { data: u } = await supabase.from('profiles_public').select('*');

    // Carga de relaciones para el resumen con joins
    const { data: up } = await supabase
      .from('usuario_perfiles')
      .select('profiles_public(email), perfiles(nombre)');
    
    const { data: pf } = await supabase
      .from('perfil_funcionalidades')
      .select('perfiles(nombre), funcionalidades(nombre_mostrar)');

    setPerfiles(p || []);
    setFuncionalidades(f || []);
    setUsuarios(u || []);
    setRelacionUP(up || []);
    setRelacionPF(pf || []);
  };

  const crearPerfil = async () => {
    if (!nuevoPerfil.nombre) return alert("Nombre requerido");
    await supabase.from('perfiles').insert([nuevoPerfil]);
    setNuevoPerfil({ nombre: '', descripcion: '' });
    fetchData();
  };

  const crearFuncionalidad = async () => {
    if (!nuevaFunc.codigo) return alert("Código requerido");
    await supabase.from('funcionalidades').insert([nuevaFunc]);
    setNuevaFunc({ codigo: '', nombre_mostrar: '' });
    fetchData();
  };

 const vincularUsuarioPerfil = async () => {
  if (!vinculoUP.usuario_id || !vinculoUP.perfil_id) {
    return alert("Complete los campos");
  }

  // .upsert() detecta si el par usuario_id/perfil_id ya existe
  const { error } = await supabase
    .from('usuario_perfiles')
    .upsert(vinculoUP, { 
      onConflict: 'usuario_id' // O la columna que defina la unicidad
    });

  if (error) {
    console.error("Error al vincular:", error);
    alert("Hubo un error al procesar la vinculación");
  } else {
    fetchData();
    alert("Vinculación o actualización exitosa");
  }
};

  const vincularPerfilFuncionalidad = async () => {
    if (!vinculoPF.perfil_id || !vinculoPF.funcionalidad_id) return alert("Complete los campos");
    await supabase.from('perfil_funcionalidades').insert([vinculoPF]);
    fetchData();
    alert("Funcionalidad asignada");
  };

  return (
    <div className="profile-container">
      <header className="profile-header">
        <h1>Gestión de Seguridad</h1>
        <p>Configura roles, funcionalidades y visualiza el resumen de accesos.</p>
      </header>

      <div className="profile-grid">
        {/* PANEL 1: CREAR PERFIL */}
        <section className="management-card">
          <h2>Crear Perfil</h2>
          <div className="input-group">
            <label>Nombre del Rol</label>
            <input 
              className="profile-input" 
              placeholder="Ej: Administrador" 
              value={nuevoPerfil.nombre}
              onChange={e => setNuevoPerfil({...nuevoPerfil, nombre: e.target.value})}
            />
          </div>
          <div className="input-group">
            <label>Descripción</label>
            <textarea 
              className="profile-textarea" 
              placeholder="Descripción..."
              value={nuevoPerfil.descripcion}
              onChange={e => setNuevoPerfil({...nuevoPerfil, descripcion: e.target.value})}
            />
          </div>
          <button onClick={crearPerfil} className="btn-action btn-blue">Guardar Perfil</button>
        </section>

        {/* PANEL 2: NUEVA FUNCIONALIDAD */}
        <section className="management-card">
          <h2>Nueva Funcionalidad</h2>
          <div className="input-group">
            <label>Código de Sistema</label>
            <input 
              className="profile-input" 
              placeholder="Ej: user_delete" 
              value={nuevaFunc.codigo}
              onChange={e => setNuevaFunc({...nuevaFunc, codigo: e.target.value})}
            />
          </div>
          <div className="input-group">
            <label>Nombre en Pantalla</label>
            <input 
              className="profile-input" 
              placeholder="Ej: Eliminar Usuarios"
              value={nuevaFunc.nombre_mostrar}
              onChange={e => setNuevaFunc({...nuevaFunc, nombre_mostrar: e.target.value})}
            />
          </div>
          <button onClick={crearFuncionalidad} className="btn-action btn-green">Registrar Función</button>
        </section>

        {/* PANEL 3: ASIGNAR ROL A USUARIO */}
        <section className="management-card">
          <h2>Asignar Rol a Usuario</h2>
          <div className="input-group">
            <label>Seleccionar Usuario</label>
            <select className="profile-select" onChange={e => setVinculoUP({...vinculoUP, usuario_id: e.target.value})}>
              <option value="">-- Elige un usuario --</option>
              {usuarios.map(u => (
                <option key={u.id} value={u.id}>{u.email || u.id}</option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label>Asignar Perfil</label>
            <select className="profile-select" onChange={e => setVinculoUP({...vinculoUP, perfil_id: e.target.value})}>
              <option value="">-- Elige un perfil --</option>
              {perfiles.map(p => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>
          <button onClick={vincularUsuarioPerfil} className="btn-action btn-dark">Vincular Acceso</button>
        </section>

        {/* PANEL 4: PERMISOS POR PERFIL */}
        <section className="management-card">
          <h2>Permisos por Perfil</h2>
          <div className="input-group">
            <label>Perfil de Destino</label>
            <select className="profile-select" onChange={e => setVinculoPF({...vinculoPF, perfil_id: e.target.value})}>
              <option value="">-- Selecciona el perfil --</option>
              {perfiles.map(p => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label>Funcionalidad a Permitir</label>
            <select className="profile-select" onChange={e => setVinculoPF({...vinculoPF, funcionalidad_id: e.target.value})}>
              <option value="">-- Selecciona la función --</option>
              {funcionalidades.map(f => (
                <option key={f.id} value={f.id}>{f.nombre_mostrar}</option>
              ))}
            </select>
          </div>
          <button onClick={vincularPerfilFuncionalidad} className="btn-action btn-orange">Asignar Permiso</button>
        </section>
      </div>

      <div className="summary-section">
        <div className="management-card">
          <h2>Usuarios / Roles</h2>
          <table className="summary-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Rol</th>
              </tr>
            </thead>
            <tbody>
              {relacionUP.map((item, i) => (
                <tr key={i}>
                  <td>{item.profiles_public?.email}</td>
                  <td><span className="badge-role">{item.perfiles?.nombre}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="management-card">
          <h2>Roles / Funcionalidades</h2>
          <table className="summary-table">
            <thead>
              <tr>
                <th>Rol</th>
                <th>Funcionalidad</th>
              </tr>
            </thead>
            <tbody>
              {relacionPF.map((item, i) => (
                <tr key={i}>
                  <td><strong>{item.perfiles?.nombre}</strong></td>
                  <td>{item.funcionalidades?.nombre_mostrar}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProfilePages;