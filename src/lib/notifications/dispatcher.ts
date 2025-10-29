import nodemailer from "nodemailer";
import { IncomingWebhook } from "@slack/webhook";
import twilio from "twilio";
import sendgrid from "@sendgrid/mail";
import { getEnv } from "@/lib/config/env";

export type NotificationPayload = {
  channels: Array<"email" | "sms" | "slack">;
  email?: {
    to: string;
    subject: string;
    html: string;
  };
  sms?: {
    to: string;
    message: string;
  };
  slack?: {
    text: string;
  };
};

const env = getEnv();
const FROM_EMAIL = env.EMAIL_FROM ?? "notifications@ai-job-apply.com";
const FROM_NAME = "AIJobApply";
let mailer: nodemailer.Transporter | null = null;

const getMailer = () => {
  if (mailer) {
    return mailer;
  }

  if (env.SMTP_HOST) {
    mailer = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT ?? 587,
      secure: (env.SMTP_PORT ?? 587) === 465,
      auth:
        env.SMTP_USER && env.SMTP_PASSWORD
          ? {
              user: env.SMTP_USER,
              pass: env.SMTP_PASSWORD,
            }
          : undefined,
    });
    return mailer;
  }

  mailer = nodemailer.createTransport({
    jsonTransport: true,
  });
  return mailer;
};

const sendEmail = async (payload: NotificationPayload["email"]) => {
  if (!payload) {
    return;
  }

  if (env.SENDGRID_API_KEY) {
    sendgrid.setApiKey(env.SENDGRID_API_KEY);
    await sendgrid.send({
      to: payload.to,
      from: {
        email: FROM_EMAIL,
        name: FROM_NAME,
      },
      subject: payload.subject ?? "Notification from AIJobApply",
      html: payload.html,
    });
    return;
  }

  const transport = getMailer();
  await transport.sendMail({
    to: payload.to,
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    subject: payload.subject ?? "Notification from AIJobApply",
    html: payload.html,
  });
};

const sendSms = async (payload: NotificationPayload["sms"]) => {
  if (!payload) {
    return;
  }

  if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN || !env.TWILIO_FROM_NUMBER) {
    return;
  }

  const client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
  await client.messages.create({
    to: payload.to,
    from: env.TWILIO_FROM_NUMBER,
    body: payload.message,
  });
};

const sendSlack = async (payload: NotificationPayload["slack"]) => {
  if (!payload || !env.SLACK_WEBHOOK_URL) {
    return;
  }

  const client = new IncomingWebhook(env.SLACK_WEBHOOK_URL);
  await client.send(payload);
};

export const dispatchNotification = async (payload: NotificationPayload) => {
  const uniqueChannels = new Set(payload.channels);

  await Promise.all(
    Array.from(uniqueChannels).map(async (channel) => {
      if (channel === "email") {
        await sendEmail(payload.email);
      }

      if (channel === "sms") {
        await sendSms(payload.sms);
      }

      if (channel === "slack") {
        await sendSlack(payload.slack);
      }
    })
  );
};
