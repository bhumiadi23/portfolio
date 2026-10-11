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
