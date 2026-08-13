Deno.serve((request) => {
  const inviteId = new URL(request.url).searchParams.get('inviteId');
  if (!inviteId) return new Response('Missing invitation identifier', { status: 400 });

  const appUrl = new URL('dividecerto://invite');
  appUrl.searchParams.set('inviteId', inviteId);
  return Response.redirect(appUrl, 302);
});
