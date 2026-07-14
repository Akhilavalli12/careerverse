/**
 * Wraps email body content in a simple branded shell matching the frontend's "registrar's
 * ledger" visual identity — warm parchment background, serif heading, umber-brown button.
 * Email clients strip most modern CSS, so this deliberately stays table-based and inline-styled.
 */
const emailTemplate = ({ preheader = '', heading, bodyHtml, ctaText, ctaUrl }) => `
<!DOCTYPE html>
<html>
  <head><meta charset="utf-8" /></head>
  <body style="margin:0;padding:0;background-color:#E8DFC8;font-family:Georgia,'Times New Roman',serif;">
    <span style="display:none;font-size:1px;color:#E8DFC8;">${preheader}</span>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#E8DFC8;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#F3EDE0;border:1px solid rgba(42,36,32,0.12);border-radius:6px;overflow:hidden;">
            <tr>
              <td style="padding:28px 32px 8px 32px;">
                <p style="margin:0;font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#8A7F71;">CareerVerse Record</p>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 32px 0 32px;">
                <h1 style="margin:0;font-family:Georgia,serif;font-size:26px;color:#2A2420;font-weight:600;">${heading}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 32px 8px 32px;font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#4A4038;">
                ${bodyHtml}
              </td>
            </tr>
            ${ctaText && ctaUrl ? `
            <tr>
              <td style="padding:16px 32px 32px 32px;">
                <a href="${ctaUrl}" style="display:inline-block;background-color:#7A5738;color:#F3EDE0;text-decoration:none;font-family:Helvetica,Arial,sans-serif;font-size:14px;font-weight:600;padding:12px 28px;border-radius:24px;">${ctaText}</a>
              </td>
            </tr>` : ''}
            <tr>
              <td style="padding:16px 32px 28px 32px;border-top:1px dashed rgba(42,36,32,0.15);">
                <p style="margin:0;font-family:'Courier New',monospace;font-size:10px;letter-spacing:0.08em;text-transform:uppercase;color:#8A7F71;">Issued via CareerVerse</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

module.exports = emailTemplate;
