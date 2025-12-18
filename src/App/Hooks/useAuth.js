import { useState, useEffect } from 'react';
import { supabase } from '../Service/Database/Supabase';

export const useAuthPermissions = () => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserPermissions = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Consultamos las funcionalidades a las que tiene acceso el usuario
        // Uniendo usuario_perfiles -> perfil_funcionalidades -> funcionalidades
        const { data, error } = await supabase
          .from('usuario_perfiles')
          .select(`
            perfil_id,
            perfiles (
              perfil_funcionalidades (
                funcionalidades (codigo)
              )
            )
          `)
          .eq('usuario_id', user.id);
          
        if (!error && data) {
          // Extraemos solo los códigos de las funcionalidades en un array plano
          const codes = data.flatMap(up => 
            up.perfiles.perfil_funcionalidades.map(pf => pf.funcionalidades.codigo)
          );
          setPermissions(codes);
        }
      }
      setLoading(false);
    };

    fetchUserPermissions();
  }, []);

  return { permissions, loading };
};