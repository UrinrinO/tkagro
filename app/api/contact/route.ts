import { NextRequest, NextResponse } from 'next/server';
import { submitHubspotForm } from '@/lib/hubspot';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  const { name, email, subject, message } = await request.json();

  if (!name || !email || !EMAIL_REGEX.test(email) || !message) {
    return NextResponse.json({ success: false, message: 'Name, a valid email, and a message are required' }, { status: 400 });
  }

  const formGuid = process.env.HUBSPOT_CONTACT_FORM_GUID;
  if (!formGuid) {
    console.error('[contact] HUBSPOT_CONTACT_FORM_GUID not configured');
    return NextResponse.json({ success: false, message: 'Contact form is not configured yet' }, { status: 503 });
  }

  try {
    await submitHubspotForm({
      formGuid,
      fields: [
        { name: 'firstname', value: name },
        { name: 'email', value: email },
        { name: 'subject', value: subject ?? '' },
        { name: 'message', value: message },
      ],
      pageUri: request.headers.get('referer') ?? undefined,
      pageName: 'T.kays Agrocosmetics — Contact',
    });
  } catch (err) {
    console.error('[contact] HubSpot submission failed', err);
    return NextResponse.json({ success: false, message: 'Could not send your message right now. Please try again later.' }, { status: 502 });
  }

  return NextResponse.json({ success: true });
}
