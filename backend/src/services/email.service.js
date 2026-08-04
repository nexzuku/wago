import nodemailer from 'nodemailer';
import config from '../config/env.js';

class EmailService {
  constructor() {
    console.log('📧 Initializing Email Service with config:', {
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      user: config.smtp.user,
      fromName: config.smtp.fromName || 'WaGo Training'
    });

    this.transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass
      },
      tls: {
        rejectUnauthorized: false
      },
      debug: true,
      logger: true
    });

    this.fromName = config.smtp.fromName || 'WaGo Training';
    this.fromEmail = config.smtp.user;
  }

  // ─── Base Layout ───
  _layout(content, preheader = '') {
    return `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>WaGo Training</title>
  <!--[if mso]>
  <style>table,td{font-family:Arial,Helvetica,sans-serif!important;}</style>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f0f4f8;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preheader}</div>` : ''}
  
  <!-- Outer wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f4f8;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        
        <!-- Inner card -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);padding:32px 40px;text-align:center;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background-color:#ffffff;width:44px;height:44px;border-radius:12px;text-align:center;vertical-align:middle;font-size:22px;font-weight:800;color:#0f172a;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">&#21644;</td>
                        <td style="padding-left:14px;">
                          <span style="font-size:24px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">WaGo</span><span style="font-size:24px;font-weight:800;color:#38bdf8;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">.</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top:8px;text-align:center;">
                    <span style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:2.5px;">Enterprise Japanese Training</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:0 40px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-top:1px solid #e2e8f0;padding-top:24px;text-align:center;">
                    <p style="margin:0 0 8px;font-size:12px;color:#94a3b8;font-weight:600;">WaGo Training Platform</p>
                    <p style="margin:0 0 4px;font-size:11px;color:#cbd5e1;">Empowering teams with Japanese language skills</p>
                    <p style="margin:0;font-size:11px;color:#cbd5e1;">This is an automated message. Please do not reply directly.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
        <!-- /Inner card -->

      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  // ─── Reusable button ───
  _button(text, href, color = '#0891b2') {
    return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0;">
      <tr>
        <td style="background-color:${color};border-radius:10px;text-align:center;">
          <a href="${href}" target="_blank" style="display:inline-block;padding:14px 36px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;letter-spacing:0.3px;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">${text}</a>
        </td>
      </tr>
    </table>`;
  }

  // ─── Reusable info box ───
  _infoBox(rows) {
    const rowsHtml = rows.map(([label, value]) => `
      <tr>
        <td style="padding:10px 16px;font-size:13px;color:#64748b;font-weight:600;white-space:nowrap;border-bottom:1px solid #f1f5f9;">${label}</td>
        <td style="padding:10px 16px;font-size:14px;color:#0f172a;font-weight:700;border-bottom:1px solid #f1f5f9;">${value}</td>
      </tr>`).join('');

    return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin:20px 0;">
      ${rowsHtml}
    </table>`;
  }

  // ─── Reusable feature list ───
  _featureList(items) {
    return items.map(item => `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
      <tr>
        <td style="width:28px;vertical-align:top;padding-top:2px;">
          <div style="width:22px;height:22px;background-color:#ecfdf5;border-radius:50%;text-align:center;line-height:22px;font-size:12px;color:#059669;">&#10003;</div>
        </td>
        <td style="padding-left:10px;font-size:14px;color:#334155;line-height:1.6;">${item}</td>
      </tr>
    </table>`).join('');
  }

  // ─── Send method ───
  async send(to, subject, html, text = null) {
    try {
      const mailOptions = {
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email sent successfully to ${to}`);
      console.log(`   Subject: ${subject}`);
      console.log(`   Message ID: ${result.messageId}`);
      console.log(`   Response: ${result.response}`);
      return result;
    } catch (error) {
      console.error(`❌ Email send failed to ${to}:`);
      console.error(`   Subject: ${subject}`);
      console.error(`   Error: ${error.message}`);
      console.error(`   Code: ${error.code}`);
      console.error(`   Response: ${error.response}`);
      console.error('   Full error:', error);
      throw error;
    }
  }

  // ─── Verify SMTP connection ───
  async verify() {
    try {
      await this.transporter.verify();
      console.log('SMTP connection verified successfully');
      return true;
    } catch (error) {
      console.error('SMTP verification failed:', error.message);
      return false;
    }
  }

  // ━━━ Welcome Email (Admin Registration) ━━━
  async sendWelcome(email, userName, companyName) {
    const dashboardUrl = `${config.frontendUrl}/dashboard`;

    const content = `
      <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#0f172a;letter-spacing:-0.5px;">Welcome to WaGo!</h1>
      <p style="margin:0 0 24px;font-size:15px;color:#64748b;line-height:1.6;">Your journey to enterprise Japanese training starts now.</p>

      <p style="margin:0 0 6px;font-size:15px;color:#334155;line-height:1.7;">Hi <strong>${userName}</strong>,</p>
      <p style="margin:0 0 20px;font-size:15px;color:#334155;line-height:1.7;">
        Your company <strong style="color:#0891b2;">${companyName}</strong> has been successfully registered. You now have full access to the WaGo Training platform.
      </p>

      <p style="margin:0 0 16px;font-size:13px;font-weight:700;color:#0f172a;text-transform:uppercase;letter-spacing:1.5px;">What you can do</p>

      ${this._featureList([
        'Invite employees and manage your team',
        'Upload voice samples for AI voice cloning',
        'Create custom training topics and phrases',
        'Monitor progress with real-time analytics',
        'Set up learning paths and training scenarios'
      ])}

      ${this._button('Go to Dashboard &rarr;', dashboardUrl)}

      <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.5;">Need help getting started? Check out the Settings page to configure your organization.</p>
    `;

    return this.send(
      email,
      `Welcome to WaGo Training, ${userName}!`,
      this._layout(content, `${companyName} is now registered on WaGo Training.`)
    );
  }

  // ━━━ Employee Invite Email ━━━
  async sendEmployeeInvite(email, companyName, tempPassword, adminName = 'Admin') {
    const loginUrl = `${config.frontendUrl}/login`;

    const content = `
      <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#0f172a;letter-spacing:-0.5px;">You're Invited!</h1>
      <p style="margin:0 0 24px;font-size:15px;color:#64748b;line-height:1.6;">Join your team's Japanese training program.</p>

      <p style="margin:0 0 20px;font-size:15px;color:#334155;line-height:1.7;">
        <strong>${adminName}</strong> has invited you to join <strong style="color:#0891b2;">${companyName}</strong> on WaGo Training &mdash; the enterprise platform for learning Japanese.
      </p>

      <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#0f172a;text-transform:uppercase;letter-spacing:1.5px;">Your Login Credentials</p>

      ${this._infoBox([
        ['Email', email],
        ['Temporary Password', `<code style="background:#fef3c7;color:#92400e;padding:3px 8px;border-radius:4px;font-size:14px;font-family:monospace;">${tempPassword}</code>`]
      ])}

      <div style="background-color:#fffbeb;border-left:4px solid #f59e0b;border-radius:0 8px 8px 0;padding:14px 18px;margin:20px 0;">
        <p style="margin:0;font-size:13px;color:#92400e;font-weight:600;">&#9888; Please change your password after your first login for security.</p>
      </div>

      ${this._button('Login to WaGo &rarr;', loginUrl)}

      <p style="margin:0 0 16px;font-size:13px;font-weight:700;color:#0f172a;text-transform:uppercase;letter-spacing:1.5px;">What to expect</p>

      ${this._featureList([
        'Interactive pronunciation practice with AI feedback',
        'Industry-specific Japanese phrases and vocabulary',
        'Track your progress and earn badges',
        'Learn at your own pace, anytime'
      ])}
    `;

    return this.send(
      email,
      `You're invited to ${companyName} - WaGo Training`,
      this._layout(content, `${adminName} invited you to join ${companyName} on WaGo Training.`)
    );
  }

  // ━━━ Password Reset Email ━━━
  async sendPasswordReset(email, resetToken, userName = 'User') {
    const resetUrl = `${config.frontendUrl}/reset-password?token=${resetToken}`;

    const content = `
      <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#0f172a;letter-spacing:-0.5px;">Reset Your Password</h1>
      <p style="margin:0 0 24px;font-size:15px;color:#64748b;line-height:1.6;">We received a request to reset your password.</p>

      <p style="margin:0 0 20px;font-size:15px;color:#334155;line-height:1.7;">
        Hi <strong>${userName}</strong>, click the button below to choose a new password for your WaGo Training account.
      </p>

      ${this._button('Reset Password &rarr;', resetUrl, '#dc2626')}

      <div style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:18px 20px;margin:24px 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="width:36px;vertical-align:top;">
              <div style="width:32px;height:32px;background-color:#fef2f2;border-radius:50%;text-align:center;line-height:32px;font-size:16px;">&#128274;</div>
            </td>
            <td style="padding-left:14px;">
              <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#0f172a;">Security Notice</p>
              <p style="margin:0;font-size:13px;color:#64748b;line-height:1.5;">This link expires in <strong>1 hour</strong>. If you didn't request this reset, you can safely ignore this email &mdash; your account is secure.</p>
            </td>
          </tr>
        </table>
      </div>

      <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.5;">If the button doesn't work, copy and paste this link into your browser:</p>
      <p style="margin:6px 0 0;font-size:12px;color:#0891b2;word-break:break-all;"><a href="${resetUrl}" style="color:#0891b2;text-decoration:underline;">${resetUrl}</a></p>
    `;

    return this.send(
      email,
      'Reset Your Password - WaGo Training',
      this._layout(content, 'Password reset requested for your WaGo account.')
    );
  }
}

export default new EmailService();
