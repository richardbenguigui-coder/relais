import { Resend } from "resend";
import { QUESTIONS } from "./questions";

export { QUESTIONS };

let _resend: Resend | undefined;
function getResend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("RESEND_API_KEY is not set");
    _resend = new Resend(key);
  }
  return _resend;
}

const FROM = process.env.RESEND_FROM_EMAIL || "relais@votredomaine.com";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

function emailShell(subject: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="fr" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>${subject}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
  body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
  table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
  img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
  body { margin: 0; padding: 0; background-color: #EEF2F9; font-family: 'DM Sans', Arial, sans-serif; }
  @media only screen and (max-width: 620px) {
    .wrapper { width: 100% !important; padding: 16px !important; }
    .content { padding: 28px 24px !important; }
    .btn { padding: 14px 20px !important; font-size: 15px !important; }
  }
</style>
</head>
<body>
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#EEF2F9">
  <tr>
    <td align="center" style="padding: 40px 16px;">
      <table class="wrapper" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td bgcolor="#1B3A6B" style="border-radius: 12px 12px 0 0; padding: 28px 40px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <span style="font-family:'DM Sans',Arial,sans-serif;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">Relais</span>
                </td>
                <td align="right">
                  <span style="font-family:'DM Sans',Arial,sans-serif;font-size:12px;color:#93afd4;letter-spacing:0.5px;text-transform:uppercase;">Espace confidentiel</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Gold accent bar -->
        <tr>
          <td bgcolor="#C4923A" style="height:3px;line-height:3px;font-size:3px;">&nbsp;</td>
        </tr>

        <!-- Body -->
        <tr>
          <td class="content" bgcolor="#ffffff" style="padding: 40px; border-radius: 0 0 12px 12px;">
            ${body}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding: 24px 0 8px; text-align: center;">
            <p style="margin:0;font-family:'DM Sans',Arial,sans-serif;font-size:12px;color:#9ca3af;line-height:1.6;">
              Relais — un espace de confiance entre patients et thérapeutes<br>
              Vous recevez cet email car votre thérapeute utilise Relais.
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

function btnPrimary(href: string, label: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin: 10px 0;">
    <tr>
      <td align="center" bgcolor="#C4923A" style="border-radius:8px;">
        <a href="${href}" class="btn" target="_blank" style="display:block;padding:15px 24px;font-family:'DM Sans',Arial,sans-serif;font-size:16px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;text-align:center;">${label}</a>
      </td>
    </tr>
  </table>`;
}

function btnSecondary(href: string, label: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin: 10px 0;">
    <tr>
      <td align="center" style="border-radius:8px;border:1.5px solid #1B3A6B;">
        <a href="${href}" class="btn" target="_blank" style="display:block;padding:15px 24px;font-family:'DM Sans',Arial,sans-serif;font-size:16px;font-weight:600;color:#1B3A6B;text-decoration:none;border-radius:8px;text-align:center;">${label}</a>
      </td>
    </tr>
  </table>`;
}

function btnGhost(href: string, label: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin: 10px 0;">
    <tr>
      <td align="center" style="border-radius:8px;border:1px solid #e2e8f0;">
        <a href="${href}" class="btn" target="_blank" style="display:block;padding:15px 24px;font-family:'DM Sans',Arial,sans-serif;font-size:16px;font-weight:400;color:#6b7280;text-decoration:none;border-radius:8px;text-align:center;">${label}</a>
      </td>
    </tr>
  </table>`;
}

function p(text: string, small = false): string {
  const size = small ? "14px" : "16px";
  const color = small ? "#6b7280" : "#374151";
  return `<p style="margin:0 0 16px;font-family:'DM Sans',Arial,sans-serif;font-size:${size};color:${color};line-height:1.75;">${text}</p>`;
}

function divider(): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin: 28px 0;">
    <tr><td style="border-top:1px solid #e2e8f0;height:1px;line-height:1px;font-size:1px;">&nbsp;</td></tr>
  </table>`;
}

export async function sendPatientEmail(params: {
  patientEmail: string;
  patientFirstName: string;
  therapistName: string | null;
  token: string;
  isFollowUp: boolean;
}) {
  const { patientEmail, patientFirstName, therapistName, token, isFollowUp } = params;
  const baseUrl = `${APP_URL}/patient/${token}`;
  const therapistLabel = therapistName ? `votre thérapeute ${therapistName}` : "votre thérapeute";

  const subject = isFollowUp
    ? "Un petit rappel — avez-vous eu le temps d'y réfléchir ?"
    : `${patientFirstName}, un moment pour faire le point ?`;

  const introText = isFollowUp
    ? `Il y a quelques jours, nous vous avons écrit au sujet de votre parcours avec ${therapistLabel}. Peut-être n'avez-vous simplement pas eu le temps d'y répondre — c'est tout à fait normal.`
    : `Il y a quelques semaines, votre suivi avec ${therapistLabel} s'est terminé. Nous espérons sincèrement que vous allez bien.`;

  const body = `
    ${p(`Bonjour <strong>${patientFirstName}</strong>,`)}
    ${p(introText)}
    ${p(`Relais est un espace neutre et confidentiel pour donner une voix à votre expérience — à votre rythme, comme vous le souhaitez. Vous n'êtes pas obligé(e) de répondre.`)}
    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 8px 0 4px;">
      <tr><td style="padding-bottom:4px;">
        <p style="margin:0 0 12px;font-family:'DM Sans',Arial,sans-serif;font-size:13px;font-weight:600;color:#1B3A6B;letter-spacing:0.5px;text-transform:uppercase;">Vos options</p>
      </td></tr>
    </table>
    ${btnPrimary(`${baseUrl}/public`, "Laisser un avis public")}
    ${btnSecondary(`${baseUrl}/private`, "Laisser un retour privé à mon thérapeute")}
    ${btnGhost(`${baseUrl}/declined`, "Pas pour l'instant")}
    ${divider()}
    ${p(`Il n'y a pas de bonne ou mauvaise réponse. Votre expérience vous appartient — Relais est simplement là pour la recueillir, si vous le souhaitez.`, true)}
  `;

  return getResend().emails.send({
    from: `Relais <${FROM}>`,
    to: patientEmail,
    subject,
    html: emailShell(subject, body),
  });
}

export async function sendInterruptedPatientEmail(params: {
  patientEmail: string;
  patientFirstName: string;
  therapistName: string | null;
  token: string;
  isFollowUp: boolean;
}) {
  const { patientEmail, patientFirstName, therapistName, token, isFollowUp } = params;
  const baseUrl = `${APP_URL}/patient/${token}`;
  const therapistLabel = therapistName ? `avec ${therapistName}` : "";

  const subject = isFollowUp
    ? "Un dernier mot, si vous le souhaitez"
    : "Votre parcours mérite d'être entendu";

  const introText = isFollowUp
    ? `Nous vous avions écrit il y a peu. Vous n'êtes pas obligé(e) de répondre — mais si quelque chose en vous a envie de s'exprimer, cet espace reste ouvert.`
    : `Il y a quelques semaines, votre suivi thérapeutique ${therapistLabel} s'est terminé de façon inattendue. C'est parfois difficile à vivre, et vous n'avez rien à expliquer. Si vous le souhaitez, Relais est un espace où votre expérience peut trouver une place — en toute confidentialité.`;

  const body = `
    ${p(`Bonjour <strong>${patientFirstName}</strong>,`)}
    ${p(introText)}
    ${p(`Si vous souhaitez partager quelque chose — une impression, un ressenti, ce qui vous a aidé ou manqué — vous pouvez laisser un retour privé, visible uniquement par votre thérapeute.`)}
    ${btnPrimary(`${baseUrl}/private`, "Laisser un retour privé à mon thérapeute")}
    ${btnGhost(`${baseUrl}/declined`, "Pas pour l'instant")}
    ${divider()}
    ${p(`Votre retour reste strictement confidentiel — jamais rendu public, jamais partagé en dehors de votre thérapeute.`, true)}
  `;

  return getResend().emails.send({
    from: `Relais <${FROM}>`,
    to: patientEmail,
    subject,
    html: emailShell(subject, body),
  });
}

export async function sendPasswordResetEmail(params: {
  email: string;
  resetUrl: string;
}) {
  const { email, resetUrl } = params;
  const subject = "Réinitialisez votre mot de passe Relais";

  const body = `
    ${p(`Bonjour,`)}
    ${p(`Vous avez demandé à réinitialiser votre mot de passe Relais. Cliquez sur le bouton ci-dessous pour en créer un nouveau.`)}
    ${btnPrimary(resetUrl, "Réinitialiser mon mot de passe")}
    ${divider()}
    ${p(`Ce lien est valable <strong>1 heure</strong>. Si vous n'avez pas demandé cette réinitialisation, ignorez simplement cet email — votre mot de passe restera inchangé.`, true)}
  `;

  return getResend().emails.send({
    from: `Relais <${FROM}>`,
    to: email,
    subject,
    html: emailShell(subject, body),
  });
}

export async function sendMonthlyTherapistSummary(params: {
  therapistEmail: string;
  therapistName: string;
  month: string;
  totalClosures: number;
  emailsSent: number;
  privateCount: number;
  publicCount: number;
  noFollowUpCount: number;
}) {
  const {
    therapistEmail, therapistName, month,
    totalClosures, emailsSent, privateCount, publicCount, noFollowUpCount,
  } = params;

  const responded = privateCount + publicCount;
  const responseRate = emailsSent > 0 ? Math.round((responded / emailsSent) * 100) : 0;

  function stat(label: string, value: number | string): string {
    return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0;">
      <tr>
        <td bgcolor="#EEF2F9" style="padding:14px 18px;border-radius:8px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-family:'DM Sans',Arial,sans-serif;font-size:14px;color:#6b7280;">${label}</td>
              <td align="right" style="font-family:'DM Sans',Arial,sans-serif;font-size:20px;font-weight:700;color:#1B3A6B;">${value}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`;
  }

  const subject = `Votre bilan Relais — ${month}`;
  const body = `
    ${p(`Bonjour <strong>${therapistName}</strong>,`)}
    ${p(`Voici un résumé de l'activité Relais pour le mois de ${month}.`)}
    ${stat("Clôtures enregistrées", totalClosures)}
    ${stat("Emails envoyés aux patients", emailsSent)}
    ${stat("Retours privés reçus", privateCount)}
    ${stat("Témoignages publics", publicCount)}
    ${stat("Sans suite", noFollowUpCount)}
    ${stat("Taux de réponse", `${responseRate}%`)}
    ${divider()}
    ${p(`Merci de faire confiance à Relais pour accompagner vos fins de suivi.`, true)}
  `;

  return getResend().emails.send({
    from: `Relais <${FROM}>`,
    to: therapistEmail,
    subject,
    html: emailShell(subject, body),
  });
}
