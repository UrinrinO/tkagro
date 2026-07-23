interface HubspotFormField {
  name: string;
  value: string;
}

interface SubmitHubspotFormOptions {
  formGuid: string;
  fields: HubspotFormField[];
  pageUri?: string;
  pageName?: string;
}

export async function submitHubspotForm({ formGuid, fields, pageUri, pageName }: SubmitHubspotFormOptions) {
  const portalId = process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID;
  if (!portalId) throw new Error('Missing NEXT_PUBLIC_HUBSPOT_PORTAL_ID');

  // Tkays' portal is EU-hosted (data-region=eu1 in HubSpot's embed codes), so
  // the Forms API must go through the eu1 endpoint, not the default api.hsforms.com.
  const response = await fetch(
    `https://api-eu1.hsforms.com/submissions/v3/integration/submit/${portalId}/${formGuid}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields,
        context: { pageUri, pageName },
      }),
    },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`HubSpot form submission failed (${response.status}): ${body}`);
  }
}
