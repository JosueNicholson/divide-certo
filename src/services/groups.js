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

export const getGroupDetails = async (groupId) => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) throw userError;

  const { data: group, error: groupError } = await supabase
    .from('groups')
    .select('id, name, created_at')
    .eq('id', groupId)
    .single();

  if (groupError) throw groupError;

  const { data: members, error: membersError } = await supabase
    .from('group_members')
    .select('role, user_id, profiles(display_name, email)')
    .eq('group_id', groupId)
    .order('created_at');

  if (membersError) throw membersError;

  const { data: bills, error: billsError } = await supabase
    .from('bills')
    .select('id, name, description, total_cents, currency_code, split_type, created_at')
    .eq('group_id', groupId)
    .order('created_at', { ascending: false });

  if (billsError) throw billsError;

  const isAdmin = members.some((member) => member.user_id === user?.id && member.role === 'admin');
  const { data: invites, error: invitesError } = isAdmin
    ? await supabase
        .from('group_invites')
        .select('id, email, expires_at')
        .eq('group_id', groupId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
    : { data: [], error: null };

  if (invitesError) throw invitesError;
  return { bills, group, invites, isAdmin, members };
};

export const createBill = async ({
  groupId,
  name,
  description,
  totalCents,
  splitType,
  userIds,
}) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) throw new Error('No authenticated user found');

  const { data: bill, error: billError } = await supabase
    .from('bills')
    .insert({
      created_by: session.user.id,
      description: description.trim() || null,
      group_id: groupId,
      name: name.trim(),
      split_type: splitType,
      total_cents: totalCents,
    })
    .select('id, name, description, total_cents, currency_code, split_type, created_at')
    .single();

  if (billError) throw billError;

  const participantRows = userIds.map((userId, index) => {
    if (splitType === 'percentage') {
      const basePoints = Math.floor(10000 / userIds.length);
      return {
        bill_id: bill.id,
        percentage_basis_points: basePoints + (index === 0 ? 10000 % userIds.length : 0),
        user_id: userId,
      };
    }

    if (splitType === 'amount') {
      const baseCents = Math.floor(totalCents / userIds.length);
      return {
        amount_cents: baseCents + (index === 0 ? totalCents % userIds.length : 0),
        bill_id: bill.id,
        user_id: userId,
      };
    }

    return { bill_id: bill.id, user_id: userId };
  });

  const { error: participantsError } = await supabase
    .from('bill_participants')
    .insert(participantRows);
  if (participantsError) throw participantsError;

  return bill;
};

export const createGroupInvite = async (groupId, email, language) => {
  const { error } = await supabase.functions.invoke('send-group-invite', {
    body: { email, groupId, language },
  });

  if (error) {
    const responseText = await error.context?.text().catch(() => '');
    console.error('Group invite function response:', responseText);

    try {
      const response = JSON.parse(responseText);
      throw new Error(response.error ?? error.message);
    } catch (parseError) {
      if (parseError instanceof SyntaxError) throw new Error(responseText || error.message);
      throw parseError;
    }
  }
};
