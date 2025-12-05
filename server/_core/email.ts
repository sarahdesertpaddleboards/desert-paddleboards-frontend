import { Resend } from 'resend';
import { ENV } from './env';

const resend = new Resend(ENV.resendApiKey);

export type BookingConfirmationEmailData = {
  customerEmail: string;
  customerName: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  locationName: string;
  locationAddress: string;
  participantCount: number;
  totalPrice: string;
  bookingId: string;
};

/**
 * Send booking confirmation email to customer
 */
export async function sendBookingConfirmationEmail(
  data: BookingConfirmationEmailData
): Promise<{ success: boolean; error?: string }> {
  if (!ENV.resendApiKey) {
    console.warn('[Email] Resend API key not configured, skipping email');
    return { success: false, error: 'Email service not configured' };
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #0891b2 0%, #06b6d4 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Desert Paddleboards</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Booking Confirmation</p>
  </div>
  
  <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
    <p style="font-size: 18px; margin-top: 0;">Hi ${data.customerName},</p>
    
    <p style="font-size: 16px;">Thank you for booking with Desert Paddleboards! Your reservation has been confirmed.</p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0891b2;">
      <h2 style="margin-top: 0; color: #0891b2; font-size: 20px;">Booking Details</h2>
      
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-weight: 600; color: #666;">Event:</td>
          <td style="padding: 8px 0;">${data.eventTitle}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 600; color: #666;">Date:</td>
          <td style="padding: 8px 0;">${data.eventDate}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 600; color: #666;">Time:</td>
          <td style="padding: 8px 0;">${data.eventTime}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 600; color: #666;">Location:</td>
          <td style="padding: 8px 0;">${data.locationName}<br><span style="color: #666; font-size: 14px;">${data.locationAddress}</span></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 600; color: #666;">Participants:</td>
          <td style="padding: 8px 0;">${data.participantCount}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 600; color: #666;">Total Paid:</td>
          <td style="padding: 8px 0; font-size: 18px; font-weight: 600; color: #0891b2;">${data.totalPrice}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 600; color: #666;">Booking ID:</td>
          <td style="padding: 8px 0; font-family: monospace; font-size: 14px;">${data.bookingId}</td>
        </tr>
      </table>
    </div>
    
    <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
      <h3 style="margin-top: 0; color: #92400e; font-size: 16px;">What to Bring</h3>
      <ul style="margin: 10px 0; padding-left: 20px; color: #78350f;">
        <li>2-3 towels for comfort</li>
        <li>Quick-drying workout clothes</li>
        <li>Water bottle</li>
        <li>Please arrive 15 minutes early</li>
      </ul>
    </div>
    
    <p style="font-size: 14px; color: #666; margin-top: 30px;">
      If you have any questions, please don't hesitate to contact us at <a href="tel:480.201.9520" style="color: #0891b2; text-decoration: none;">480.201.9520</a>.
    </p>
    
    <p style="font-size: 14px; color: #666;">
      We look forward to seeing you on the water!
    </p>
    
    <p style="font-size: 14px; color: #666; margin-bottom: 0;">
      Namaste,<br>
      <strong>Desert Paddleboards Team</strong>
    </p>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
    <p style="margin: 5px 0;">Desert Paddleboards</p>
    <p style="margin: 5px 0;">Find Your Zen on the Water</p>
  </div>
</body>
</html>
  `;

  try {
    const { data: emailData, error } = await resend.emails.send({
      from: 'Desert Paddleboards <bookings@desertpaddleboards.com>',
      to: [data.customerEmail],
      subject: `Booking Confirmed: ${data.eventTitle}`,
      html,
      replyTo: 'info@desertpaddleboards.com',
    });

    if (error) {
      console.error('[Email] Failed to send booking confirmation:', error);
      return { success: false, error: error.message };
    }

    console.log('[Email] Booking confirmation sent:', emailData?.id);
    return { success: true };
  } catch (error) {
    console.error('[Email] Error sending booking confirmation:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Send owner notification email for new booking
 */
export async function sendOwnerBookingNotification(
  data: BookingConfirmationEmailData
): Promise<{ success: boolean; error?: string }> {
  if (!ENV.resendApiKey) {
    console.warn('[Email] Resend API key not configured, skipping email');
    return { success: false, error: 'Email service not configured' };
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Booking Received</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🎉 New Booking!</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Desert Paddleboards</p>
  </div>
  
  <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
    <p style="font-size: 16px; margin-top: 0;">A new booking has been received!</p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #7c3aed;">
      <h2 style="margin-top: 0; color: #7c3aed; font-size: 20px;">Booking Information</h2>
      
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-weight: 600; color: #666;">Customer:</td>
          <td style="padding: 8px 0;">${data.customerName}<br><span style="color: #666; font-size: 14px;">${data.customerEmail}</span></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 600; color: #666;">Event:</td>
          <td style="padding: 8px 0;">${data.eventTitle}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 600; color: #666;">Date & Time:</td>
          <td style="padding: 8px 0;">${data.eventDate} at ${data.eventTime}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 600; color: #666;">Location:</td>
          <td style="padding: 8px 0;">${data.locationName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 600; color: #666;">Participants:</td>
          <td style="padding: 8px 0;">${data.participantCount}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 600; color: #666;">Revenue:</td>
          <td style="padding: 8px 0; font-size: 18px; font-weight: 600; color: #16a34a;">${data.totalPrice}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 600; color: #666;">Booking ID:</td>
          <td style="padding: 8px 0; font-family: monospace; font-size: 14px;">${data.bookingId}</td>
        </tr>
      </table>
    </div>
    
    <p style="font-size: 14px; color: #666; margin-top: 30px;">
      The customer has received a confirmation email with all the details.
    </p>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
    <p style="margin: 5px 0;">Desert Paddleboards Admin</p>
  </div>
</body>
</html>
  `;

  try {
    const { data: emailData, error } = await resend.emails.send({
      from: 'Desert Paddleboards <bookings@desertpaddleboards.com>',
      to: [ENV.ownerEmail || 'admin@desertpaddleboards.com'],
      subject: `New Booking: ${data.eventTitle} - ${data.customerName}`,
      html,
      replyTo: data.customerEmail,
    });

    if (error) {
      console.error('[Email] Failed to send owner notification:', error);
      return { success: false, error: error.message };
    }

    console.log('[Email] Owner notification sent:', emailData?.id);
    return { success: true };
  } catch (error) {
    console.error('[Email] Error sending owner notification:', error);
    return { success: false, error: String(error) };
  }
}

const tracks = [
  { id: 1, title: "Desert Dawn", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663233691307/PRLTv39ySLt5ijTYKqCuQo/sonoran-echoes/01-Desert-Dawn.wav" },
  { id: 2, title: "Cactus Bloom", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663233691307/PRLTv39ySLt5ijTYKqCuQo/sonoran-echoes/02-Cactus-Bloom.wav" },
  { id: 3, title: "Canyon Whispers", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663233691307/PRLTv39ySLt5ijTYKqCuQo/sonoran-echoes/03-Canyon-Whispers.wav" },
  { id: 4, title: "Monsoon Dreams", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663233691307/PRLTv39ySLt5ijTYKqCuQo/sonoran-echoes/04-Monsoon-Dreams.wav" },
  { id: 5, title: "Saguaro Serenade", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663233691307/PRLTv39ySLt5ijTYKqCuQo/sonoran-echoes/05-Saguaro-Serenade.wav" },
  { id: 6, title: "Twilight Mesa", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663233691307/PRLTv39ySLt5ijTYKqCuQo/sonoran-echoes/06-Twilight-Mesa.wav" },
  { id: 7, title: "Starlight Meditation", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663233691307/PRLTv39ySLt5ijTYKqCuQo/sonoran-echoes/07-Starlight-Meditation.wav" },
  { id: 8, title: "River Stones", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663233691307/PRLTv39ySLt5ijTYKqCuQo/sonoran-echoes/08-River-Stones.wav" },
  { id: 9, title: "Ancient Echoes", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663233691307/PRLTv39ySLt5ijTYKqCuQo/sonoran-echoes/09-Ancient-Echoes.wav" },
  { id: 10, title: "Healing Waters", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663233691307/PRLTv39ySLt5ijTYKqCuQo/sonoran-echoes/10-Healing-Waters.wav" },
  { id: 11, title: "Sunset Reflection", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663233691307/PRLTv39ySLt5ijTYKqCuQo/sonoran-echoes/11-Sunset-Reflection.wav" },
  { id: 12, title: "Mountain Spirit", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663233691307/PRLTv39ySLt5ijTYKqCuQo/sonoran-echoes/12-Mountain-Spirit.wav" },
  { id: 13, title: "Desert Rain", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663233691307/PRLTv39ySLt5ijTYKqCuQo/sonoran-echoes/13-Desert-Rain.wav" },
  { id: 14, title: "Peaceful Journey", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663233691307/PRLTv39ySLt5ijTYKqCuQo/sonoran-echoes/14-Peaceful-Journey.wav" },
  { id: 15, title: "Sacred Ground", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663233691307/PRLTv39ySLt5ijTYKqCuQo/sonoran-echoes/15-Sacred-Ground.wav" },
  { id: 16, title: "Moonlit Path", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663233691307/PRLTv39ySLt5ijTYKqCuQo/sonoran-echoes/16-Moonlit-Path.wav" },
  { id: 17, title: "Inner Peace", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663233691307/PRLTv39ySLt5ijTYKqCuQo/sonoran-echoes/17-Inner-Peace.wav" },
  { id: 18, title: "Eternal Calm", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663233691307/PRLTv39ySLt5ijTYKqCuQo/sonoran-echoes/18-Eternal-Calm.wav" },
];

export type AlbumDownloadEmailData = {
  customerEmail: string;
  customerName: string;
  albumName: string;
  trackCount: number;
};

/**
 * Send album download email with all track links
 */
export async function sendAlbumDownloadEmail(
  data: AlbumDownloadEmailData
): Promise<{ success: boolean; error?: string }> {
  if (!ENV.resendApiKey) {
    console.warn('[Email] Resend API key not configured, skipping email');
    return { success: false, error: 'Email service not configured' };
  }

  const trackListHtml = tracks.map((track, index) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${String(index + 1).padStart(2, '0')}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${track.title}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">
        <a href="${track.url}" download style="background: linear-gradient(135deg, #d97706 0%, #ea580c 100%); color: white; padding: 6px 12px; border-radius: 6px; text-decoration: none; font-size: 14px; display: inline-block;">Download</a>
      </td>
    </tr>
  `).join('');

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Album Download</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #d97706 0%, #ea580c 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🎵 Sonoran Echoes</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Your Download is Ready!</p>
  </div>
  
  <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
    <p style="font-size: 18px; margin-top: 0;">Hi ${data.customerName},</p>
    
    <p style="font-size: 16px;">Thank you for purchasing ${data.albumName}! Your high-quality WAV files are ready to download.</p>
    
    <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
      <p style="margin: 0; color: #78350f;"><strong>💡 Tip:</strong> Right-click each download button and select "Save Link As" to choose where to save your files.</p>
    </div>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h2 style="margin-top: 0; color: #d97706; font-size: 20px;">Download Your Tracks</h2>
      
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: #fef3c7;">
            <th style="padding: 10px; text-align: left; font-weight: 600; color: #78350f;">#</th>
            <th style="padding: 10px; text-align: left; font-weight: 600; color: #78350f;">Track Name</th>
            <th style="padding: 10px; text-align: right; font-weight: 600; color: #78350f;">Download</th>
          </tr>
        </thead>
        <tbody>
          ${trackListHtml}
        </tbody>
      </table>
    </div>
    
    <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0891b2;">
      <h3 style="margin-top: 0; color: #0c4a6e; font-size: 16px;">Lifetime Access</h3>
      <p style="margin: 10px 0 0 0; color: #075985;">You can download these files as many times as you need. Save this email for future access to your music.</p>
    </div>
    
    <p style="font-size: 14px; color: #666; margin-top: 30px;">
      Enjoy your healing soundscape journey! If you have any questions, contact us at <a href="mailto:info@desertpaddleboards.com" style="color: #d97706; text-decoration: none;">info@desertpaddleboards.com</a>.
    </p>
    
    <p style="font-size: 14px; color: #666; margin-bottom: 0;">
      Namaste,<br>
      <strong>Desert Paddleboards Team</strong>
    </p>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
    <p style="margin: 5px 0;">Desert Paddleboards</p>
    <p style="margin: 5px 0;">Find Your Zen on the Water</p>
  </div>
</body>
</html>
  `;

  try {
    const { data: emailData, error } = await resend.emails.send({
      from: 'Desert Paddleboards <music@desertpaddleboards.com>',
      to: [data.customerEmail],
      subject: `Your Sonoran Echoes Album is Ready to Download! 🎵`,
      html,
      replyTo: 'info@desertpaddleboards.com',
    });

    if (error) {
      console.error('[Email] Failed to send album download email:', error);
      return { success: false, error: error.message };
    }

    console.log('[Email] Album download email sent:', emailData?.id);
    return { success: true };
  } catch (error) {
    console.error('[Email] Error sending album download email:', error);
    return { success: false, error: String(error) };
  }
}

export type TrackDownloadEmailData = {
  customerEmail: string;
  customerName: string;
  trackTitle: string;
  trackId: number;
};

/**
 * Send individual track download email
 */
export async function sendTrackDownloadEmail(
  data: TrackDownloadEmailData
): Promise<{ success: boolean; error?: string }> {
  if (!ENV.resendApiKey) {
    console.warn('[Email] Resend API key not configured, skipping email');
    return { success: false, error: 'Email service not configured' };
  }

  const track = tracks.find(t => t.id === data.trackId);
  if (!track) {
    return { success: false, error: 'Track not found' };
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Track Download</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #d97706 0%, #ea580c 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🎵 Sonoran Echoes</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Your Track is Ready!</p>
  </div>
  
  <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
    <p style="font-size: 18px; margin-top: 0;">Hi ${data.customerName},</p>
    
    <p style="font-size: 16px;">Thank you for your purchase! Your high-quality WAV file is ready to download.</p>
    
    <div style="background: white; padding: 25px; border-radius: 8px; margin: 20px 0; text-align: center; border: 2px solid #fed7aa;">
      <h2 style="margin: 0 0 15px 0; color: #d97706; font-size: 22px;">${track.title}</h2>
      <p style="margin: 0 0 20px 0; color: #666; font-size: 14px;">Track ${String(track.id).padStart(2, '0')} • Sonoran Echoes</p>
      <a href="${track.url}" download style="background: linear-gradient(135deg, #d97706 0%, #ea580c 100%); color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: 600; display: inline-block;">Download Track</a>
    </div>
    
    <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
      <p style="margin: 0; color: #78350f;"><strong>💡 Tip:</strong> Right-click the download button and select "Save Link As" to choose where to save your file.</p>
    </div>
    
    <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0891b2;">
      <h3 style="margin-top: 0; color: #0c4a6e; font-size: 16px;">Love the Full Album?</h3>
      <p style="margin: 10px 0 0 0; color: #075985;">Get all 18 tracks for just $25 (save over 40%!) at <a href="https://desertpaddleboards.com/sonoran-echoes" style="color: #0891b2; text-decoration: none;">desertpaddleboards.com/sonoran-echoes</a></p>
    </div>
    
    <p style="font-size: 14px; color: #666; margin-top: 30px;">
      Enjoy your healing soundscape! If you have any questions, contact us at <a href="mailto:info@desertpaddleboards.com" style="color: #d97706; text-decoration: none;">info@desertpaddleboards.com</a>.
    </p>
    
    <p style="font-size: 14px; color: #666; margin-bottom: 0;">
      Namaste,<br>
      <strong>Desert Paddleboards Team</strong>
    </p>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
    <p style="margin: 5px 0;">Desert Paddleboards</p>
    <p style="margin: 5px 0;">Find Your Zen on the Water</p>
  </div>
</body>
</html>
  `;

  try {
    const { data: emailData, error } = await resend.emails.send({
      from: 'Desert Paddleboards <music@desertpaddleboards.com>',
      to: [data.customerEmail],
      subject: `Your Track "${track.title}" is Ready to Download! 🎵`,
      html,
      replyTo: 'info@desertpaddleboards.com',
    });

    if (error) {
      console.error('[Email] Failed to send track download email:', error);
      return { success: false, error: error.message };
    }

    console.log('[Email] Track download email sent:', emailData?.id);
    return { success: true };
  } catch (error) {
    console.error('[Email] Error sending track download email:', error);
    return { success: false, error: String(error) };
  }
}
