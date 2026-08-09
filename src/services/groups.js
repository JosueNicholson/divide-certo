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
  const trimmedName = name.trim();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) throw new Error('No authenticated user found');

  const { error } = await supabase
    .from('groups')
    .insert({ created_by: session.user.id, name: trimmedName });

  if (error) throw error;

  const group = (await getGroups()).find((currentGroup) => currentGroup.name === trimmedName);
  if (!group) throw new Error('Created group could not be loaded');

  return group;
};
