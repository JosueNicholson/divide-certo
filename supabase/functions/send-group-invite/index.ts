import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const emailContent = {
  en: {
    body: 'You were invited to join a Divide Certo group.',
    cta: 'Open Divide Certo',
    title: 'You have a group invitation',
  },
  es: {
    body: 'Te invitaron a unirte a un grupo en Divide Certo.',
    cta: 'Abrir Divide Certo',
    title: 'Tienes una invitación a un grupo',
  },
  fr: {
    body: 'Vous êtes invité à rejoindre un groupe sur Divide Certo.',
    cta: 'Ouvrir Divide Certo',
    title: 'Vous avez une invitation à un groupe',
  },
  pt: {
    body: 'Você foi convidado a participar de um grupo no Divide Certo.',
    cta: 'Abrir Divide Certo',
    title: 'Você tem um convite para um grupo',
  },
};

Deno.serve(async (request) => {
  try {
    const authorization = request.headers.get('Authorization');
    if (!authorization) throw new Error('Unauthorized');

    const { email, groupId, inviteId, language = 'pt' } = await request.json();
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const resendFromEmail = Deno.env.get('RESEND_FROM_EMAIL');
    const appUrl = Deno.env.get('APP_URL');

    if (!supabaseUrl || !supabaseAnonKey || !resendApiKey || !resendFromEmail || !appUrl) {
      throw new Error('Server configuration is incomplete');
    }

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authorization } },
    });
    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();
    if (userError || !user) throw new Error('Unauthorized');

    const { data: membership, error: membershipError } = await userClient
      .from('group_members')
      .select('role')
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();
    if (membershipError || !membership) throw new Error('Forbidden');

    const { data: invite, error: inviteError } = inviteId
      ? await userClient
          .from('group_invites')
          .update({ expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() })
          .eq('id', inviteId)
          .eq('group_id', groupId)
          .eq('status', 'pending')
          .select('id, email')
          .single()
      : await userClient
          .from('group_invites')
          .insert({ created_by: user.id, email: email.trim().toLowerCase(), group_id: groupId })
          .select('id, email')
          .single();
    if (inviteError) {
      if (inviteError.code === '23505') throw new Error('A pending invitation already exists');
      throw inviteError;
    }

    const content = emailContent[language as keyof typeof emailContent] ?? emailContent.pt;
    const inviteUrl = `${appUrl}?inviteId=${encodeURIComponent(invite.id)}`;
    const emailResponse = await fetch('https://api.resend.com/emails', {
      body: JSON.stringify({
        from: resendFromEmail,
        html: `<h1>${content.title}</h1><p>${content.body}</p><p><a href="${inviteUrl}">${content.cta}</a></p>`,
        subject: content.title,
        text: `${content.title}\n\n${content.body}\n\n${inviteUrl}`,
        to: [invite.email],
      }),
      headers: { Authorization: `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
      method: 'POST',
    });

    if (!emailResponse.ok) {
      if (!inviteId) await userClient.from('group_invites').delete().eq('id', invite.id);
      throw new Error(`Resend error: ${await emailResponse.text()}`);
    }

    return Response.json({ inviteId: invite.id });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === 'object' && error !== null && 'message' in error
          ? String(error.message)
          : JSON.stringify(error);
    console.error('Failed to send group invite:', error);
    return Response.json({ error: message }, { status: 400 });
  }
});
