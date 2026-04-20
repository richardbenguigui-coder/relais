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

export async function sendPatientEmail(params: {
  patientEmail: string;
  patientFirstName: string;
  token: string;
  isFollowUp: boolean;
}) {
  const { patientEmail, patientFirstName, token, isFollowUp } = params;
  const baseUrl = `${APP_URL}/patient/${token}`;

  const subject = isFollowUp
    ? "Un petit rappel — avez-vous eu le temps d'y réfléchir ?"
    : `${patientFirstName}, un moment pour faire le point ?`;

  const intro = isFollowUp
    ? `Il y a quelques jours, nous vous avons écrit au sujet de votre parcours thérapeutique. Peut-être n'avez-vous simplement pas eu le temps d'y répondre — c'est tout à fait normal.`
    : `Votre suivi thérapeutique s'est terminé il y a quelques semaines. Nous espérons que vous allez bien.`;

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${subject}</title>
<style>
  body { font-family: 'DM Sans', Arial, sans-serif; background: #F4F7FD; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; padding: 40px; }
  .logo { font-size: 22px; font-weight: 700; color: #1B3A6B; margin-bottom: 32px; }
  p { color: #374151; line-height: 1.7; margin: 0 0 16px; font-size: 16px; }
  .btn { display: block; text-align: center; padding: 14px 24px; border-radius: 8px; font-size: 15px; font-weight: 600; text-decoration: none; margin: 12px 0; }
  .btn-primary { background: #1B3A6B; color: #ffffff; }
  .btn-secondary { background: #F4F7FD; color: #1B3A6B; border: 1px solid #1B3A6B; }
  .btn-ghost { background: transparent; color: #6b7280; border: 1px solid #e2e8f0; }
  .divider { border: none; border-top: 1px solid #e2e8f0; margin: 32px 0; }
  .footer { color: #9ca3af; font-size: 13px; text-align: center; margin-top: 32px; }
</style>
</head>
<body>
<div class="container">
  <div class="logo">Relais</div>
  <p>Bonjour ${patientFirstName},</p>
  <p>${intro}</p>
  <p>Relais est un espace neutre et confidentiel qui permet de donner une voix à votre expérience, à votre rythme, comme vous le souhaitez.</p>
  <p>Vous avez trois possibilités :</p>
  <a href="${baseUrl}/public" class="btn btn-primary">
    Oui, je partage mon témoignage publiquement
  </a>
  <a href="${baseUrl}/private" class="btn btn-secondary">
    Je préfère laisser un retour privé à mon thérapeute
  </a>
  <a href="${baseUrl}/declined" class="btn btn-ghost">
    Pas pour l'instant
  </a>
  <hr class="divider">
  <p style="font-size: 14px; color: #6b7280;">Il n'y a pas de bonne ou mauvaise réponse. Votre expérience vous appartient — Relais est simplement là pour la recueillir, si vous le souhaitez.</p>
  <div class="footer">
    Relais — un espace de confiance entre patients et thérapeutes<br>
    Vous recevez cet email car votre thérapeute utilise Relais.
  </div>
</div>
</body>
</html>`;

  return getResend().emails.send({
    from: `Relais <${FROM}>`,
    to: patientEmail,
    subject,
    html,
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

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<style>
  body { font-family: Arial, sans-serif; background: #F4F7FD; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; padding: 40px; }
  .logo { font-size: 22px; font-weight: 700; color: #1B3A6B; margin-bottom: 32px; }
  h2 { color: #1B3A6B; font-size: 20px; }
  .stat { background: #F4F7FD; border-radius: 8px; padding: 16px 20px; margin: 8px 0; display: flex; justify-content: space-between; }
  .stat-label { color: #6b7280; }
  .stat-value { font-weight: 700; color: #1B3A6B; font-size: 20px; }
  p { color: #374151; line-height: 1.7; }
  .footer { color: #9ca3af; font-size: 13px; text-align: center; margin-top: 32px; }
</style>
</head>
<body>
<div class="container">
  <div class="logo">Relais</div>
  <h2>Bilan mensuel — ${month}</h2>
  <p>Bonjour ${therapistName},</p>
  <p>Voici un résumé de l'activité Relais pour le mois de ${month}.</p>
  <div class="stat"><span class="stat-label">Clôtures enregistrées</span><span class="stat-value">${totalClosures}</span></div>
  <div class="stat"><span class="stat-label">Emails envoyés aux patients</span><span class="stat-value">${emailsSent}</span></div>
  <div class="stat"><span class="stat-label">Retours privés reçus</span><span class="stat-value">${privateCount}</span></div>
  <div class="stat"><span class="stat-label">Témoignages publics</span><span class="stat-value">${publicCount}</span></div>
  <div class="stat"><span class="stat-label">Sans suite</span><span class="stat-value">${noFollowUpCount}</span></div>
  <div class="stat"><span class="stat-label">Taux de réponse</span><span class="stat-value">${responseRate}%</span></div>
  <p style="margin-top: 24px;">Merci de faire confiance à Relais pour accompagner vos fins de suivi.</p>
  <div class="footer">Relais</div>
</div>
</body>
</html>`;

  return getResend().emails.send({
    from: `Relais <${FROM}>`,
    to: therapistEmail,
    subject: `Votre bilan Relais — ${month}`,
    html,
  });
}
