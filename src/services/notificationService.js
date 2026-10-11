import emailjs from '@emailjs/browser';
import { apologyConfig } from '../data/apologyConfig';

/**
 * Sends an email notification to Nestle when Annuva clicks "Yes, let's talk ❤️".
 *
 * Rules:
 * 1. Requires VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, VITE_EMAILJS_PUBLIC_KEY.
 * 2. Sent strictly upon explicit click on "Yes".
 * 3. Prevents duplicate triggers in the same browsing session.
 * 4. Never exposes secret keys or private credentials.
 */
export async function sendYesDecisionNotification() {
  // Check session storage to prevent duplicates
  if (typeof window !== 'undefined' && sessionStorage.getItem('annuva_yes_notification_sent')) {
    return {
      success: true,
      duplicate: true,
      message: 'Already recorded for this session.',
    };
  }

  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID?.trim();
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID?.trim();
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY?.trim();

  // If credentials are not configured yet
  if (!serviceId || !templateId || !publicKey) {
    console.warn(
      '[EmailJS Notification] Service ID, Template ID, or Public Key is missing. Please set VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, and VITE_EMAILJS_PUBLIC_KEY in your .env or Vercel environment variables.'
    );
    return {
      success: false,
      notConfigured: true,
      error: 'Email notifications are not configured yet in .env',
    };
  }

  const now = new Date();
  const formattedDateTime = now.toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'medium',
    timeZoneName: 'short',
  });

  const templateParams = {
    website_name: apologyConfig.decision.websiteName,
    event: apologyConfig.decision.eventName,
    date_time: formattedDateTime,
    timestamp: formattedDateTime,
    recipient_name: apologyConfig.recipientName,
    sender_name: apologyConfig.senderName,
    message: `${apologyConfig.recipientName} clicked 'Yes, let's talk ❤️' on ${apologyConfig.decision.websiteName} on ${formattedDateTime}.`,
  };

  try {
    const response = await emailjs.send(serviceId, templateId, templateParams, publicKey);

    if (response.status === 200 || response.text === 'OK') {
      // Record in session storage so duplicate clicks in same visit don't resend
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('annuva_yes_notification_sent', 'true');
      }
      return { success: true };
    } else {
      return {
        success: false,
        error: `EmailJS responded with status: ${response.status} (${response.text})`,
      };
    }
  } catch (error) {
    console.error('[EmailJS Notification Failed]:', error);
    return {
      success: false,
      error: error?.text || error?.message || 'Network error occurred while sending notification.',
    };
  }
}

/**
 * Detects device info for the visit notification
 */
function getDeviceInfo() {
  if (typeof window === 'undefined') return 'Unknown device';
  const ua = navigator.userAgent || '';
  let device = 'Desktop';
  if (/iPad|Tablet/i.test(ua)) device = 'Tablet / iPad';
  else if (/iPhone/i.test(ua)) device = 'Apple iPhone 📱';
  else if (/Android/i.test(ua)) device = 'Android Phone 📱';
  else if (/Mobile/i.test(ua)) device = 'Mobile Phone 📱';
  else if (/Macintosh|Mac OS/i.test(ua)) device = 'Apple Mac 💻';
  else if (/Windows/i.test(ua)) device = 'Windows PC 💻';

  const screenRes = `${window.screen?.width || window.innerWidth}x${window.screen?.height || window.innerHeight}`;
  return `${device} (${screenRes})`;
}

/**
 * Sends a silent notification to Nestle the moment Annuva opens the website.
 * Runs once per browsing session.
 */
export async function sendVisitNotification() {
  // Prevent duplicate visit notifications in the same browsing session
  if (typeof window !== 'undefined' && sessionStorage.getItem('annuva_visit_notified')) {
    return { success: true, duplicate: true };
  }

  // Mark immediately in session storage so rapid rerenders never duplicate
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('annuva_visit_notified', 'true');
  }

  const now = new Date();
  const formattedDateTime = now.toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'medium',
    timeZoneName: 'short',
  });
  const deviceInfo = getDeviceInfo();

  // Optional Discord Webhook ping (if configured)
  const discordWebhookUrl = import.meta.env.VITE_DISCORD_WEBHOOK_URL?.trim();
  if (discordWebhookUrl) {
    try {
      fetch(discordWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [
            {
              title: '💌 Annuva opened your apology website!',
              description: `Annuva is viewing your apology letter right now.`,
              color: 0xbe123c, // Rose Red
              fields: [
                { name: 'Device', value: deviceInfo, inline: true },
                { name: 'Time', value: formattedDateTime, inline: true },
              ],
              footer: { text: 'For Annuva • From Nestle ❤️' },
            },
          ],
        }),
      }).catch(() => {});
    } catch {
      // ignore webhook silent fail
    }
  }

  // EmailJS notification
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID?.trim();
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID?.trim();
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY?.trim();

  if (!serviceId || !templateId || !publicKey) {
    console.info(
      '[Visit Notification] Visit logged locally. To receive email alerts, configure VITE_EMAILJS_* in your .env or Vercel.'
    );
    return { success: false, notConfigured: true };
  }

  const templateParams = {
    website_name: apologyConfig.decision.websiteName,
    event: 'Annuva opened the website 💌',
    date_time: formattedDateTime,
    timestamp: formattedDateTime,
    recipient_name: apologyConfig.recipientName,
    sender_name: apologyConfig.senderName,
    device: deviceInfo,
    message: `💌 ${apologyConfig.recipientName} just opened your apology website on ${deviceInfo} at ${formattedDateTime}!`,
  };

  try {
    const res = await emailjs.send(serviceId, templateId, templateParams, publicKey);
    return { success: res.status === 200 || res.text === 'OK' };
  } catch (error) {
    // Fail silently in the background without affecting Annuva's experience
    console.warn('[Visit Notification Email failed silently]:', error);
    return { success: false, error };
  }
}

