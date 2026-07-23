import { NextRequest, NextResponse } from 'next/server';
import { submitHubspotForm } from '@/lib/hubspot';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  const { email } = await request.json();

  if (!email || !EMAIL_REGEX.test(email)) {
    return NextResponse.json({ success: false, message: 'A valid email is required' }, { status: 400 });
  }

  const formGuid = process.env.HUBSPOT_NEWSLETTER_FORM_GUID;
  if (!formGuid) {
    console.error('[newsletter] HUBSPOT_NEWSLETTER_FORM_GUID not configured');
    return NextResponse.json({ success: false, message: 'Newsletter signup is not configured yet' }, { status: 503 });
  }

  try {
    await submitHubspotForm({
      formGuid,
      fields: [{ name: 'email', value: email }],
      pageUri: request.headers.get('referer') ?? undefined,
      pageName: 'T.kays Agrocosmetics — Newsletter',
    });
  } catch (err) {
    console.error('[newsletter] HubSpot submission failed', err);
    return NextResponse.json({ success: false, message: 'Could not subscribe right now. Please try again later.' }, { status: 502 });
  }

  return NextResponse.json({ success: true });
}
