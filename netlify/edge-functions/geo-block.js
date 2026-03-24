export default async (request, context) => {
  // Check if the user is from Bangladesh (BD)
  if (context.geo.country?.code !== 'BD') {
    return new Response('Access Denied: SG Worker Hub is only accessible from Bangladesh.', {
      status: 403,
      headers: { 'content-type': 'text/plain' }
    });
  }
};

