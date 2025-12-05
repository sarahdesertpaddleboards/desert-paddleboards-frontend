import { ENV } from './env';

const FLODESK_API_BASE = 'https://api.flodesk.com/v1';

export type FlodeskSubscriber = {
  email: string;
  first_name?: string;
  last_name?: string;
  custom_fields?: Record<string, string>;
  segment_ids?: string[];
  double_optin?: boolean;
};

export type FlodeskSubscriberResponse = {
  id: string;
  status: 'active' | 'unsubscribed' | 'unconfirmed' | 'bounced' | 'complained' | 'cleaned';
  email: string;
  source: string;
  first_name?: string;
  last_name?: string;
  segments?: Array<{ id: string; name: string }>;
  custom_fields?: Record<string, string>;
  created_at: string;
};

/**
 * Add or update a subscriber in Flodesk
 * 
 * This will:
 * 1. Add the subscriber to your Flodesk email list
 * 2. Optionally add them to specific segments for targeting
 * 3. Trigger any automations you've set up in Flodesk for those segments
 * 
 * @param subscriber - Subscriber data including email, name, and optional segments
 * @returns Promise with success status and subscriber data or error
 */
export async function addFlodeskSubscriber(
  subscriber: FlodeskSubscriber
): Promise<{ success: boolean; data?: FlodeskSubscriberResponse; error?: string }> {
  if (!ENV.flodeskApiKey) {
    console.warn('[Flodesk] API key not configured, skipping subscriber add');
    return { success: false, error: 'Flodesk API key not configured' };
  }

  try {
    // Flodesk uses HTTP Basic Auth with API key as username and empty password
    const authHeader = `Basic ${Buffer.from(`${ENV.flodeskApiKey}:`).toString('base64')}`;

    const response = await fetch(`${FLODESK_API_BASE}/subscribers`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'User-Agent': 'Desert-Paddleboards/1.0',
      },
      body: JSON.stringify(subscriber),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Flodesk] Failed to add subscriber:', response.status, errorText);
      return {
        success: false,
        error: `Flodesk API error: ${response.status} - ${errorText}`,
      };
    }

    const data: FlodeskSubscriberResponse = await response.json();
    console.log('[Flodesk] Successfully added subscriber:', data.email);

    return { success: true, data };
  } catch (error) {
    console.error('[Flodesk] Error adding subscriber:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Add a subscriber to specific segments
 * Useful for adding existing subscribers to new segments without updating other data
 * 
 * @param emailOrId - Subscriber email or Flodesk ID
 * @param segmentIds - Array of segment IDs to add the subscriber to
 * @returns Promise with success status
 */
export async function addSubscriberToSegments(
  emailOrId: string,
  segmentIds: string[]
): Promise<{ success: boolean; error?: string }> {
  if (!ENV.flodeskApiKey) {
    console.warn('[Flodesk] API key not configured, skipping segment add');
    return { success: false, error: 'Flodesk API key not configured' };
  }

  try {
    const authHeader = `Basic ${Buffer.from(`${ENV.flodeskApiKey}:`).toString('base64')}`;

    const response = await fetch(
      `${FLODESK_API_BASE}/subscribers/${encodeURIComponent(emailOrId)}/segments`,
      {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
          'User-Agent': 'Desert-Paddleboards/1.0',
        },
        body: JSON.stringify({ segment_ids: segmentIds }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Flodesk] Failed to add subscriber to segments:', response.status, errorText);
      return {
        success: false,
        error: `Flodesk API error: ${response.status} - ${errorText}`,
      };
    }

    console.log('[Flodesk] Successfully added subscriber to segments:', emailOrId);
    return { success: true };
  } catch (error) {
    console.error('[Flodesk] Error adding subscriber to segments:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
