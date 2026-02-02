import type { APIRoute } from 'astro';
import { API_BASE } from '../../config/api';

const STATUS_ENDPOINT = `${API_BASE}/allCitiesStatus`;

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
