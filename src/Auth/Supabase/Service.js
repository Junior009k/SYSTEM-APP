import { supabase } from '../Supabase/Supabase'; 


const TABLE_NAME = 'clientes';

export const  insertClient=async (dataClient)=>{
    const { error }  = await supabase
                .from(TABLE_NAME)
                .insert(dataClient)
    return { error } 

}

export const  selectClient=async ()=>{
    const { data, error } = await supabase
                .from(TABLE_NAME)
                .select('id, nombre_de_cliente, fecha_de_caducidad, nueva_fecha_de_caducidad, soporte, prioridad')
                .order('id', { ascending: true });
    return { data, error } 

}

export const  updateClient=async (dataClient)=>{
    const { error } = await supabase
            .from(TABLE_NAME)
            .update(dataClient) 
            .eq('id', id);
    return  { error }
}




//const { error } = insertClient(bulkData)