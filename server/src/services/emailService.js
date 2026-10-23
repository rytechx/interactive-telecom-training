import nodemailer from 'nodemailer'
import environment from '../config/environment.js'

let mailTransport = null

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function getMailTransport() {
  if (!mailTransport) {
    mailTransport = environment.nodeEnvironment === 'test'
      ? nodemailer.createTransport({ jsonTransport: true })
      : nodemailer.createTransport({
          host: environment.mail.host,
          port: environment.mail.port,
          secure: environment.mail.secure,
          auth: {
            user: environment.mail.user,
            pass: environment.mail.password,
          },
        })
  }

  return mailTransport
}

async function sendPasswordResetOtpEmail({
  to,
  otp,
  expiresInMinutes,
  maxAttempts,
}) {
  const safeOtp = escapeHtml(otp)
  const expirationText = `${expiresInMinutes} minute${
    expiresInMinutes === 1 ? '' : 's'
  }`

  await getMailTransport().sendMail({
    from: environment.mail.from,
    to,
    subject: 'Your TeleSim 3D password reset code',
    text: [
      'TeleSim 3D Password Reset',
      '',
      'Your verification code is:',
      otp,
      '',
      `This code expires in ${expirationText}.`,
      `You have a maximum of ${maxAttempts} verification attempts.`,
      '',
      'If you did not request a password reset, you can safely ignore this email.',
      '',
      '— TeleSim 3D Support',
    ].join('\n'),
    html: `
      <div style="font-family:Arial,sans-serif;color:#15242b;line-height:1.6">
        <h1 style="font-size:22px">TeleSim 3D Password Reset</h1>
        <p>Your verification code is:</p>
        <p style="font-size:32px;font-weight:700;letter-spacing:8px;color:#087d8b">${safeOtp}</p>
        <p>This code expires in ${expirationText}.</p>
        <p>You have a maximum of ${maxAttempts} verification attempts.</p>
        <p>If you did not request a password reset, you can safely ignore this email.</p>
        <p>— TeleSim 3D Support</p>
      </div>
    `,
  })
}

export { sendPasswordResetOtpEmail }
