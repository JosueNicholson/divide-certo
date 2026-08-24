Deno.serve((request) => {
  const url = new URL(request.url);
  const inviteId = url.searchParams.get('inviteId');
  const token = url.searchParams.get('token');
  if (!inviteId && !token) return new Response('Missing invitation identifier', { status: 400 });

  const appUrl = new URL('dividecerto://invite');
  if (inviteId) appUrl.searchParams.set('inviteId', inviteId);
  if (token) {
    appUrl.searchParams.set('token', token);
    appUrl.searchParams.set('type', 'link');
  }
  return Response.redirect(appUrl, 302);
});
