import { getEnv } from "@/lib/config/env";
import { dispatchNotification } from "@/lib/notifications/dispatcher";

const env = getEnv();

const getBaseUrl = () =>
  env.APP_BASE_URL ?? env.NEXTAUTH_URL ?? "http://localhost:3000";

const buildUrlWithToken = (path: string, token: string) => {
  const url = new URL(path, getBaseUrl());
  url.searchParams.set("token", token);
  return url.toString();
};

const renderEmail = (title: string, body: string, ctaLabel: string, ctaUrl: string) => {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charSet="utf-8" />
    <title>${title}</title>
    <style>
      body { font-family: 'Inter', Arial, sans-serif; background: #f8fafc; color: #0f172a; }
      .container { max-width: 560px; margin: 32px auto; padding: 32px; background: #ffffff; border-radius: 16px; box-shadow: 0 10px 40px rgba(15, 23, 42, 0.08); }
      h1 { font-size: 22px; margin-bottom: 16px; }
      p { line-height: 1.6; margin-bottom: 16px; }
      a.button { display: inline-block; padding: 12px 20px; background: #1e40af; color: #ffffff !important; border-radius: 9999px; text-decoration: none; font-weight: 600; }
      .footer { font-size: 12px; color: #64748b; margin-top: 24px; }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>${title}</h1>
      ${body}
      <p style="text-align: center; margin-top: 24px;">
        <a class="button" href="${ctaUrl}">${ctaLabel}</a>
      </p>
      <p class="footer">
        If the button above doesn’t work, copy and paste this URL into your browser:<br />
        <span>${ctaUrl}</span>
      </p>
    </div>
  </body>
</html>`;
};

export const buildVerificationUrl = (token: string) =>
  buildUrlWithToken("/verify", token);

export const buildPasswordResetUrl = (token: string) =>
  buildUrlWithToken("/reset-password", token);

export const sendVerificationEmail = async (
  email: string,
  token: string,
  name?: string
) => {
  const verificationUrl = buildVerificationUrl(token);
  const greeting = name ? `Hi ${name.split(" ")[0]},` : "Hi there,";
  const body = `
    <p>${greeting}</p>
    <p>Thanks for signing up for AIJobApply. Please confirm your email address to activate your account and unlock the onboarding experience.</p>
    <p>This link will expire in 24 hours for security purposes.</p>
  `;

  await dispatchNotification({
    channels: ["email"],
    email: {
      to: email,
      subject: "Verify your AIJobApply account",
      html: renderEmail(
        "Confirm your email",
        body,
        "Verify email",
        verificationUrl
      ),
    },
  });
};

export const sendPasswordResetEmail = async (
  email: string,
  token: string,
  name?: string
) => {
  const resetUrl = buildPasswordResetUrl(token);
  const greeting = name ? `Hi ${name.split(" ")[0]},` : "Hi there,";
  const body = `
    <p>${greeting}</p>
    <p>We received a request to reset the password for your AIJobApply account. Click the button below to set a new password.</p>
    <p>This link will expire in 2 hours. If you didn’t request this reset, you can safely ignore this email.</p>
  `;

  await dispatchNotification({
    channels: ["email"],
    email: {
      to: email,
      subject: "Reset your AIJobApply password",
      html: renderEmail(
        "Reset your password",
        body,
        "Choose a new password",
        resetUrl
      ),
    },
  });
};
