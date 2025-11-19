import React, { useState, useEffect } from 'react';
import { supabase } from '../Supabase/Supabase'; // Asegúrate de que la ruta sea corr

// --- ESTILOS SIMPLES (Objeto JS para no depender de CSS externo) ---
const styles = {
  container: { maxWidth: '1000px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' },
  authBox: { maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', textAlign: 'center' },
  grid: { display: 'grid', gridTemplateColumns: '300px 1fr', gap: '30px' },
  form: { display: 'flex', flexDirection: 'column', gap: '10px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fff' },
  input: { padding: '8px', borderRadius: '4px', border: '1px solid #ccc' },
  button: { padding: '10px', backgroundColor: '#2c5282', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  buttonDelete: { padding: '5px 10px', backgroundColor: '#e53e3e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginLeft: '5px' },
  buttonEdit: { padding: '5px 10px', backgroundColor: '#3182ce', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '20px' },
  th: { borderBottom: '2px solid #ddd', padding: '10px', textAlign: 'left', backgroundColor: '#f7fafc' },
  td: { borderBottom: '1px solid #ddd', padding: '10px' },
  error: { color: 'red', fontSize: '0.9em' }
};

export default function ClientesCRUD() {
  // --- ESTADOS ---
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clientes, setClientes] = useState([]);
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre_de_cliente: '',
    fecha_de_caducidad: '',
    nueva_fecha_de_caducidad: '',
    soporte: 'Básico',
    prioridad: 'Baja'
  });
  const [editingId, setEditingId] = useState(null);

  // Estado para Login
  const [email, setEmail] = useState('');

  // --- EFECTOS (Auth y Carga de datos) ---

  useEffect(() => {
    // 1. Verificar sesión actual al montar
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (session) fetchClientes();
    });

    // 2. Escuchar cambios en la autenticación (Login/Logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchClientes();
      else setClientes([]); // Limpiar datos si sale
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- FUNCIONES CRUD ---

  const fetchClientes = async () => {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('id', { ascending: true });
    
    if (error) console.error('Error cargando:', error);
    else setClientes(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
        nombre_de_cliente: formData.nombre_de_cliente,
        fecha_de_caducidad: formData.fecha_de_caducidad || null,
        nueva_fecha_de_caducidad: formData.nueva_fecha_de_caducidad || null,
        soporte: formData.soporte,
        prioridad: formData.prioridad
    };

    if (editingId) {
      // UPDATE
      const { error } = await supabase
        .from('clientes')
        .update(payload)
        .eq('id', editingId);
        
      if (!error) {
        fetchClientes();
        resetForm();
      }
    } else {
      // CREATE
      const { error } = await supabase
        .from('clientes')
        .insert(payload);

      if (!error) {
        fetchClientes();
        resetForm();
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este cliente?')) return;

    const { error } = await supabase
      .from('clientes')
      .delete()
      .eq('id', id);

    if (!error) fetchClientes();
  };

  const handleEdit = (cliente) => {
    setFormData({
      nombre_de_cliente: cliente.nombre_de_cliente,
      fecha_de_caducidad: cliente.fecha_de_caducidad || '',
      nueva_fecha_de_caducidad: cliente.nueva_fecha_de_caducidad || '',
      soporte: cliente.soporte,
      prioridad: cliente.prioridad
    });
    setEditingId(cliente.id);
  };

  const resetForm = () => {
    setFormData({
      nombre_de_cliente: '',
      fecha_de_caducidad: '',
      nueva_fecha_de_caducidad: '',
      soporte: 'Básico',
      prioridad: 'Baja'
    });
    setEditingId(null);
  };

  // --- FUNCIONES AUTH (Login simple con Magic Link para demo) ---
  const handleLogin = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) alert(error.message);
    else alert('¡Revisa tu correo para el enlace de acceso!');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // --- RENDERIZADO ---

  if (loading) return <div style={{textAlign:'center', marginTop: 50}}>Cargando...</div>;

  // 🔒 BLOQUEO: Si no hay sesión, mostrar Login
  if (!session) {
    return (
      <div style={styles.authBox}>
        <h2>Acceso Restringido</h2>
        <p>Debes iniciar sesión para ver el CRUD de clientes.</p>
        <form onSubmit={handleLogin} style={{display:'flex', flexDirection:'column', gap:10}}>
          <input 
            type="email" 
            placeholder="Tu correo electrónico" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />
          <button type="submit" style={styles.button}>Enviar Magic Link</button>
        </form>
      </div>
    );
  }

  // ✅ ACCESO CONCEDIDO: Mostrar CRUD
  return (
    <div style={styles.container}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 20}}>
        <h1>Gestión de Clientes</h1>
        <div>
            <span style={{marginRight: 10, fontSize:'0.9em'}}>Usuario: {session.user.email}</span>
            <button onClick={handleLogout} style={{...styles.button, backgroundColor: '#718096'}}>Cerrar Sesión</button>
        </div>
      </div>

      <div style={styles.grid}>
        {/* FORMULARIO */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <h3>{editingId ? 'Editar Cliente' : 'Nuevo Cliente'}</h3>
          
          <label>Nombre</label>
          <input 
            style={styles.input}
            type="text" 
            value={formData.nombre_de_cliente} 
            onChange={(e) => setFormData({...formData, nombre_de_cliente: e.target.value})} 
            required 
          />

          <label>Fecha Caducidad</label>
          <input 
            style={styles.input}
            type="date" 
            value={formData.fecha_de_caducidad} 
            onChange={(e) => setFormData({...formData, fecha_de_caducidad: e.target.value})} 
          />

          <label>Nueva Fecha Caducidad</label>
          <input 
            style={styles.input}
            type="date" 
            value={formData.nueva_fecha_de_caducidad} 
            onChange={(e) => setFormData({...formData, nueva_fecha_de_caducidad: e.target.value})} 
          />

          <label>Soporte</label>
          <select 
            style={styles.input}
            value={formData.soporte} 
            onChange={(e) => setFormData({...formData, soporte: e.target.value})}
          >
            <option>Básico</option>
            <option>Estándar</option>
            <option>Premium</option>
          </select>

          <label>Prioridad</label>
          <select 
            style={styles.input}
            value={formData.prioridad} 
            onChange={(e) => setFormData({...formData, prioridad: e.target.value})}
          >
            <option>Baja</option>
            <option>Media</option>
            <option>Alta</option>
          </select>

          <button type="submit" style={styles.button}>
            {editingId ? 'Actualizar' : 'Guardar'}
          </button>
          
          {editingId && (
            <button type="button" onClick={resetForm} style={{...styles.button, backgroundColor:'#cbd5e0', color:'#333'}}>
              Cancelar
            </button>
          )}
        </form>

        {/* TABLA DE DATOS */}
        <div>
            {clientes.length === 0 ? (
                <p>No hay clientes registrados.</p>
            ) : (
                <table style={styles.table}>
                    <thead>
                    <tr>
                        <th style={styles.th}>Nombre</th>
                        <th style={styles.th}>Caducidad</th>
                        <th style={styles.th}>Soporte</th>
                        <th style={styles.th}>Prioridad</th>
                        <th style={styles.th}>Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {clientes.map((cliente) => (
                        <tr key={cliente.id}>
                        <td style={styles.td}>{cliente.nombre_de_cliente}</td>
                        <td style={styles.td}>{cliente.fecha_de_caducidad}</td>
                        <td style={styles.td}>{cliente.soporte}</td>
                        <td style={styles.td}>{cliente.prioridad}</td>
                        <td style={styles.td}>
                            <button 
                                onClick={() => handleEdit(cliente)} 
                                style={styles.buttonEdit}>
                                ✎
                            </button>
                            <button 
                                onClick={() => handleDelete(cliente.id)} 
                                style={styles.buttonDelete}>
                                🗑
                            </button>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
      </div>
    </div>
  );
}