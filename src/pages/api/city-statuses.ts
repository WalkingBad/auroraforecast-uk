import type { APIRoute } from 'astro';

const STATUS_ENDPOINT = 'https://europe-west1-aurorame-621f6.cloudfunctions.net/allCitiesStatus';

export const GET: APIRoute = async () => {
  try {
    const response = await fetch(STATUS_ENDPOINT, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'AuroraMe-Web/1.0'
      }
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: `API returned ${response.status}` }), {
        status: response.status,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=60' // Cache for 1 minute
        }
      });
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60', // Cache for 1 minute
        'Access-Control-Allow-Origin': '*' // Allow all origins
      }
    });
  } catch (error) {
    console.error('Failed to fetch city statuses:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};
