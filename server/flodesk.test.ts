import { describe, it, expect } from 'vitest';
import { addFlodeskSubscriber } from './_core/flodesk';
import { ENV } from './_core/env';

describe('Flodesk Integration', () => {
  it('should validate Flodesk API credentials', async () => {
    // Skip test if credentials not configured
    if (!ENV.flodeskApiKey) {
      console.log('[Test] Flodesk API key not configured, skipping test');
      return;
    }

    // Try to add a test subscriber to validate credentials
    const testEmail = `test+${Date.now()}@desertpaddleboards.com`;
    const result = await addFlodeskSubscriber({
      email: testEmail,
      first_name: 'Test',
      last_name: 'User',
      custom_fields: {
        test_booking: 'true',
      },
      // Include segment ID if configured
      ...(ENV.flodeskSegmentId && { segment_ids: [ENV.flodeskSegmentId] }),
    });

    // Validate the API call succeeded
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.email).toBe(testEmail);
    expect(result.data?.status).toBe('active');

    console.log('[Test] Flodesk API credentials validated successfully');
    console.log('[Test] Test subscriber created:', result.data?.id);
  }, 30000); // 30 second timeout for API call
});
