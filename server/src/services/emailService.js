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

async function sendPasswordResetEmail({
  to,
  resetUrl,
  expiresInMinutes,
}) {
  const safeResetUrl = escapeHtml(resetUrl)
  const expirationText = `${expiresInMinutes} minute${
    expiresInMinutes === 1 ? '' : 's'
  }`

  await getMailTransport().sendMail({
    from: environment.mail.from,
    to,
    subject: 'Reset your TeleSim 3D password',
    text: [
      'A password reset was requested for your TeleSim 3D account.',
      '',
      'Use the link below to create a new password:',
      resetUrl,
      '',
      `This link expires in ${expirationText}.`,
      'If you did not request this change, you can ignore this email.',
    ].join('\n'),
    html: `
      <div style="font-family:Arial,sans-serif;color:#15242b;line-height:1.6">
        <h1 style="font-size:22px">Reset your TeleSim 3D password</h1>
        <p>A password reset was requested for your TeleSim 3D account.</p>
        <p>Use the link below to create a new password.</p>
        <p><a href="${safeResetUrl}">Reset Password</a></p>
        <p>This link expires in ${expirationText}.</p>
        <p>If you did not request this change, you can ignore this email.</p>
      </div>
    `,
  })
}

export { sendPasswordResetEmail }
