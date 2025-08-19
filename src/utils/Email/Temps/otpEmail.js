export const otpEmailTemp = ({ name = "", otp = "" } = {}) => {
  return `<!doctype html>
<html>
  <body style="font-family:system-ui,-apple-system,Segoe UI,Roboto,'Helvetica Neue',Arial; margin:0; padding:0; background:#f6f8fb;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center" style="padding:24px 16px;">
          <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff; border-radius:8px; box-shadow:0 4px 18px rgba(20,20,40,0.06); overflow:hidden;">
            <tr>
              <td style="padding:20px 24px; text-align:left;">
                <img src="https://saraha-app-react-taupe.vercel.app/assets/image-D5Ptgltq.png" alt="WishPR" width="120" style="display:block; margin-bottom:12px;">
                <h2 style="margin:0 0 12px 0; font-size:20px; color:#0f1724;">Your verification code</h2>
                <p style="margin:0 0 18px 0; color:#334155;">Hi ${name},</p>

                <div style="padding:18px; border-radius:6px; background:#f1f5f9; display:inline-block; font-weight:700; font-size:20px; letter-spacing:2px;">
                  ${otp}
                </div>

                <p style="margin:24px 0 0 0; color:#94a3b8; font-size:13px;">
                  — The WishPR Team
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:14px 24px; background:#f8fafc; color:#94a3b8; font-size:12px; text-align:center;">
                <a href="https://saraha-app-react-taupe.vercel.app" style="color:#475569; text-decoration:none;">https://saraha-app-react-taupe.vercel.app/assets/image-D5Ptgltq.png</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
};
