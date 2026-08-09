import { supabase } from './supabase';

export const getGroups = async () => {
  const { data, error } = await supabase
    .from('groups')
    .select('id, name, created_at')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const createGroup = async (name) => {
  const { data, error } = await supabase
    .from('groups')
    .insert({ name: name.trim() })
    .select('id, name, created_at')
    .single();

  if (error) throw error;
  return data;
};
