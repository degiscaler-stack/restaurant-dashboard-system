import nodemailer from "nodemailer";

export async function sendMail(opts: {
  to: string;
  subject: string;
  text: string;
}) {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || process.env.RESTAURANT_NOTIFY_EMAIL;

  if (!host || !from) {
    return { sent: false as const, reason: "SMTP not configured" };
  }

  const transporter = nodemailer.createTransport({
    host,
    port: port || 587,
    secure: port === 465,
    auth: user && pass ? { user, pass } : undefined,
  });

  await transporter.sendMail({
    from,
    to: opts.to,
    subject: opts.subject,
    text: opts.text,
  });

  return { sent: true as const };
}
