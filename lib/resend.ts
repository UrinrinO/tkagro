import { Resend } from 'resend';
import { supabase } from '@/lib/supabase-server';

if (!process.env.RESEND_API_KEY) throw new Error('Missing RESEND_API_KEY');

export const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.RESEND_FROM ?? 'T.kays Agrocosmetics <hello@tkaysagro.com>';

export interface OrderItem {
  name: string;
  qty: number;
  price: string;
}

export interface ShippingAddress {
  line1: string;
  city: string;
  postcode: string;
  country: string;
}

export interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  total: string;
  shippingAddress: ShippingAddress;
}

export async function sendOrderConfirmation(data: OrderEmailData) {
  const rows = data.items
    .map(
      (i) =>
        `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6">${i.name}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;text-align:center">${i.qty}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;text-align:right">${i.price}</td>
        </tr>`,
    )
    .join('');

  await resend.emails.send({
    from: FROM,
    to: data.customerEmail,
    subject: `Order confirmed — ${data.orderNumber} | T.kays Agrocosmetics`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#1a1a1a">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08)">
    <div style="background:#2d5016;padding:28px 32px;text-align:center">
      <h1 style="margin:0;color:#fff;font-size:20px;letter-spacing:0.02em">T.kays Agrocosmetics</h1>
      <p style="margin:6px 0 0;color:#c9a84c;font-size:12px;letter-spacing:0.12em;text-transform:uppercase">Balanced Wellness</p>
    </div>
    <div style="padding:36px 32px">
      <h2 style="margin:0 0 8px;color:#2d5016;font-size:22px">Order Confirmed ✓</h2>
      <p style="margin:0 0 24px;color:#6b7280;font-size:15px">
        Hi ${data.customerName}, thank you for your order!<br>
        We're preparing it now and will notify you when it ships.
      </p>
      <div style="background:#f9fafb;border-radius:8px;padding:12px 16px;margin-bottom:24px;display:inline-block">
        <span style="font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.08em">Order number</span>
        <span style="display:block;font-size:16px;font-weight:700;color:#1a1a1a;margin-top:2px;font-family:monospace">${data.orderNumber}</span>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:16px">
        <thead>
          <tr style="background:#f3f4f6">
            <th style="padding:10px 12px;text-align:left;font-weight:600;color:#374151">Product</th>
            <th style="padding:10px 12px;text-align:center;font-weight:600;color:#374151">Qty</th>
            <th style="padding:10px 12px;text-align:right;font-weight:600;color:#374151">Price</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <p style="text-align:right;font-size:16px;font-weight:700;margin:0 0 28px">Total: ${data.total}</p>
      <hr style="border:none;border-top:1px solid #f3f4f6;margin:0 0 24px">
      <h3 style="margin:0 0 8px;font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.08em">Shipping to</h3>
      <address style="font-style:normal;font-size:14px;color:#374151;line-height:1.7">
        ${data.shippingAddress.line1}<br>
        ${data.shippingAddress.city}, ${data.shippingAddress.postcode}<br>
        ${data.shippingAddress.country}
      </address>
      <p style="margin:32px 0 0;font-size:13px;color:#9ca3af;line-height:1.6">
        Questions about your order? Simply reply to this email and we'll help.<br>
        Thank you for choosing T.kays — we can't wait for you to try your products.
      </p>
    </div>
    <div style="background:#f9fafb;padding:20px 32px;text-align:center">
      <p style="margin:0;font-size:11px;color:#9ca3af">© 2026 T.kays Agrocosmetics · London, UK</p>
    </div>
  </div>
</body>
</html>`,
  });
}

export interface ShippingUpdateEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  trackingNumber?: string | null;
}

export async function sendShippingUpdate(data: ShippingUpdateEmailData) {
  const trackingBlock = data.trackingNumber
    ? `<div style="background:#f9fafb;border-radius:8px;padding:12px 16px;margin-bottom:24px;margin-left:12px;display:inline-block">
        <span style="font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.08em">Tracking number</span>
        <span style="display:block;font-size:16px;font-weight:700;color:#1a1a1a;margin-top:2px;font-family:monospace">${data.trackingNumber}</span>
      </div>`
    : '';

  await resend.emails.send({
    from: FROM,
    to: data.customerEmail,
    subject: `Your order has shipped — ${data.orderNumber} | T.kays Agrocosmetics`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#1a1a1a">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08)">
    <div style="background:#2d5016;padding:28px 32px;text-align:center">
      <h1 style="margin:0;color:#fff;font-size:20px;letter-spacing:0.02em">T.kays Agrocosmetics</h1>
      <p style="margin:6px 0 0;color:#c9a84c;font-size:12px;letter-spacing:0.12em;text-transform:uppercase">Balanced Wellness</p>
    </div>
    <div style="padding:36px 32px">
      <h2 style="margin:0 0 8px;color:#2d5016;font-size:22px">Your Order Has Shipped ✓</h2>
      <p style="margin:0 0 24px;color:#6b7280;font-size:15px">
        Hi ${data.customerName}, great news — your order is on its way!
      </p>
      <div style="background:#f9fafb;border-radius:8px;padding:12px 16px;margin-bottom:24px;display:inline-block">
        <span style="font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.08em">Order number</span>
        <span style="display:block;font-size:16px;font-weight:700;color:#1a1a1a;margin-top:2px;font-family:monospace">${data.orderNumber}</span>
      </div>
      ${trackingBlock}
      <p style="margin:32px 0 0;font-size:13px;color:#9ca3af;line-height:1.6">
        Questions about your delivery? Simply reply to this email and we'll help.<br>
        Thank you for choosing T.kays.
      </p>
    </div>
    <div style="background:#f9fafb;padding:20px 32px;text-align:center">
      <p style="margin:0;font-size:11px;color:#9ca3af">© 2026 T.kays Agrocosmetics · London, UK</p>
    </div>
  </div>
</body>
</html>`,
  });
}

export async function getNotificationRecipient(): Promise<string | null> {
  const { data: notifRow } = await supabase
    .from('content_blocks')
    .select('value')
    .eq('key', 'settings.notifications')
    .single();
  const notificationEmail = (notifRow?.value as any)?.notificationEmail;
  if (typeof notificationEmail === 'string' && notificationEmail.trim() !== '') {
    return notificationEmail;
  }

  const { data: storeRow } = await supabase
    .from('content_blocks')
    .select('value')
    .eq('key', 'settings.store_info')
    .single();
  const contactEmail = (storeRow?.value as any)?.contactEmail;
  if (typeof contactEmail === 'string' && contactEmail.trim() !== '') {
    return contactEmail;
  }

  return null;
}

export interface LowStockAlertEmailData {
  recipientEmail: string;
  productName: string;
  stockCount: number;
  productId: string;
}

export async function sendLowStockAlert(data: LowStockAlertEmailData) {
  await resend.emails.send({
    from: FROM,
    to: data.recipientEmail,
    subject: `Low stock alert — ${data.productName} | T.kays Agrocosmetics`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#1a1a1a">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08)">
    <div style="background:#2d5016;padding:28px 32px;text-align:center">
      <h1 style="margin:0;color:#fff;font-size:20px;letter-spacing:0.02em">T.kays Agrocosmetics</h1>
      <p style="margin:6px 0 0;color:#c9a84c;font-size:12px;letter-spacing:0.12em;text-transform:uppercase">Balanced Wellness</p>
    </div>
    <div style="padding:36px 32px">
      <h2 style="margin:0 0 8px;color:#2d5016;font-size:22px">Low Stock Alert</h2>
      <p style="margin:0 0 24px;color:#6b7280;font-size:15px">
        One of your products has dropped below 5 units in stock.
      </p>
      <div style="background:#f9fafb;border-radius:8px;padding:12px 16px;margin-bottom:24px;display:inline-block">
        <span style="font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.08em">Product</span>
        <span style="display:block;font-size:16px;font-weight:700;color:#1a1a1a;margin-top:2px">${data.productName}</span>
      </div>
      <div style="background:#f9fafb;border-radius:8px;padding:12px 16px;margin-bottom:24px;margin-left:12px;display:inline-block">
        <span style="font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.08em">Current stock</span>
        <span style="display:block;font-size:16px;font-weight:700;color:#1a1a1a;margin-top:2px">${data.stockCount}</span>
      </div>
      <p style="margin:24px 0 0;font-size:14px">
        <a href="https://www.tkaysagrocosmetics.com/admin/products/${data.productId}" style="color:#2d5016;font-weight:600">Update this product →</a>
      </p>
      <p style="margin:32px 0 0;font-size:13px;color:#9ca3af;line-height:1.6">
        You're receiving this because Low Stock Alerts are enabled in Admin → Settings → Notifications.
      </p>
    </div>
    <div style="background:#f9fafb;padding:20px 32px;text-align:center">
      <p style="margin:0;font-size:11px;color:#9ca3af">© 2026 T.kays Agrocosmetics · London, UK</p>
    </div>
  </div>
</body>
</html>`,
  });
}
