import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardNav } from "@/components/DashboardNav";
import { Card, CardBody } from "@/components/ui/Card";
import { ClosureStatusBadge } from "@/components/ClosureStatusBadge";

const PLATFORM_LABELS: Record<string, string> = {
  GOOGLE: "Google",
  TRUSTPILOT: "Trustpilot",
  AVIS_VERIFIES: "Avis Vérifiés",
};

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const therapist = await prisma.therapist.findUnique({
    where: { id: session.therapistId },
    include: {
      closures: {
        orderBy: { createdAt: "desc" },
        include: { feedback: true },
      },
    },
  });

  if (!therapist) redirect("/login");
  if (!therapist.onboardingDone) redirect("/onboarding");

  const isReadOnly =
    therapist.subscriptionStatus === "CANCELED" ||
    (therapist.subscriptionStatus === "TRIAL" &&
      therapist.trialEndsAt &&
      new Date(therapist.trialEndsAt) < new Date());

  const stats = {
    total: therapist.closures.length,
    scheduled: therapist.closures.filter((c) => c.status === "SCHEDULED").length,
    emailSent: therapist.closures.filter((c) => c.status === "EMAIL_SENT").length,
    privateFeedback: therapist.closures.filter(
      (c) => c.status === "PRIVATE_FEEDBACK" || c.status === "BOTH_FEEDBACK"
    ).length,
    publicTestimonial: therapist.closures.filter(
      (c) => c.status === "PUBLIC_TESTIMONIAL" || c.status === "BOTH_FEEDBACK"
    ).length,
    noFollowUp: therapist.closures.filter((c) => c.status === "NO_FOLLOW_UP").length,
  };

  const platformLabel = PLATFORM_LABELS[therapist.reviewPlatform] ?? "avis";

  const daysRemaining = therapist.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(therapist.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <div className="min-h-screen bg-[#F4F7FD]">
      <DashboardNav
        therapistName={therapist.name}
        subscriptionStatus={therapist.subscriptionStatus}
        trialEndsAt={therapist.trialEndsAt}
      />

      <main className="max-w-5xl mx-auto px-4 py-8">
        {isReadOnly && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg px-5 py-4 flex items-center justify-between">
            <p className="text-sm text-amber-800 font-medium">
              Votre période d&apos;essai est terminée. Vous êtes en lecture seule.
            </p>
            <Link
              href="/api/stripe/checkout"
              className="text-sm font-semibold text-[#1B3A6B] underline"
            >
              S&apos;abonner — 9€/mois
            </Link>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#1B3A6B]">Tableau de bord</h1>
          {!isReadOnly && (
            <Link
              href="/closures/new"
              className="inline-flex items-center gap-2 bg-[#1B3A6B] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#15305a] transition-colors"
            >
              <span className="text-lg leading-none">+</span>
              Nouvelle clôture
            </Link>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
          {[
            { label: "Total", value: stats.total, color: "text-[#1B3A6B]" },
            { label: "Programmé", value: stats.scheduled, color: "text-[#6b7280]" },
            { label: "Email envoyé", value: stats.emailSent, color: "text-blue-600" },
            { label: "Retour privé", value: stats.privateFeedback, color: "text-[#C4923A]" },
            { label: "Témoignage public", value: stats.publicTestimonial, color: "text-green-600" },
          ].map((s) => (
            <Card key={s.label} className="text-center py-4 px-3">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-[#6b7280] mt-1">{s.label}</div>
            </Card>
          ))}
        </div>

        {/* Billing */}
        {therapist.subscriptionStatus === "TRIAL" && !isReadOnly && (
          <div className="mb-6 bg-white rounded-xl border border-[#e2e8f0] shadow-sm px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[#1B3A6B]">Période d&apos;essai</p>
              <p className="text-sm text-[#6b7280] mt-0.5">
                {daysRemaining > 0
                  ? `Il vous reste ${daysRemaining} jour${daysRemaining > 1 ? "s" : ""} d'essai gratuit.`
                  : "Votre essai se termine aujourd'hui."}
              </p>
            </div>
            <Link
              href="/api/stripe/checkout"
              className="shrink-0 inline-flex items-center justify-center bg-[#C4923A] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#b07e30] transition-colors"
            >
              S&apos;abonner — 9€/mois
            </Link>
          </div>
        )}

        {therapist.subscriptionStatus === "ACTIVE" && (
          <div className="mb-6 bg-white rounded-xl border border-[#e2e8f0] shadow-sm px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[#1B3A6B]">Abonnement actif</p>
              <p className="text-sm text-[#6b7280] mt-0.5">Votre abonnement Relais est en cours.</p>
            </div>
            <Link
              href="/api/stripe/portal"
              className="shrink-0 inline-flex items-center justify-center bg-white text-[#1B3A6B] border border-[#1B3A6B] px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#F4F7FD] transition-colors"
            >
              Gérer mon abonnement
            </Link>
          </div>
        )}

        {therapist.subscriptionStatus === "PAST_DUE" && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-red-700">Paiement en attente</p>
              <p className="text-sm text-red-600 mt-0.5">Un paiement a échoué. Mettez à jour votre moyen de paiement pour continuer.</p>
            </div>
            <Link
              href="/api/stripe/portal"
              className="shrink-0 inline-flex items-center justify-center bg-red-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
            >
              Mettre à jour le paiement
            </Link>
          </div>
        )}

        {/* Patient list */}
        {therapist.closures.length === 0 ? (
          <Card>
            <CardBody className="text-center py-16">
              <p className="text-[#6b7280] mb-4">Aucune clôture enregistrée pour l&apos;instant.</p>
              {!isReadOnly && (
                <Link
                  href="/closures/new"
                  className="inline-flex items-center gap-2 bg-[#1B3A6B] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#15305a] transition-colors"
                >
                  Enregistrer ma première clôture
                </Link>
              )}
            </CardBody>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {therapist.closures.map((closure) => (
              <Card key={closure.id}>
                <CardBody className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <span className="font-semibold text-[#1B3A6B]">
                        {closure.patientFirstName}
                      </span>
                      <ClosureStatusBadge status={closure.status} closureType={closure.closureType} />
                    </div>
                    <p className="text-sm text-[#6b7280]">
                      Fin de suivi :{" "}
                      {new Date(closure.closureDate).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                    {closure.email21SentAt && (
                      <p className="text-xs text-[#9ca3af] mt-0.5">
                        Email envoyé le{" "}
                        {new Date(closure.email21SentAt).toLocaleDateString("fr-FR")}
                      </p>
                    )}

                    {/* Private feedback */}
                    {closure.feedback && (
                      <div className="mt-4 bg-[#F4F7FD] rounded-lg p-4 text-sm">
                        <p className="font-medium text-[#1B3A6B] mb-3">Retour privé</p>
                        {[
                          closure.feedback.answer1,
                          closure.feedback.answer2,
                          closure.feedback.answer3,
                          closure.feedback.answer4,
                          closure.feedback.answer5,
                        ]
                          .filter(Boolean)
                          .map((answer, i) => (
                            <div key={i} className="mb-2">
                              <p className="text-[#6b7280] text-xs mb-0.5">Question {i + 1}</p>
                              <p className="text-[#374151]">{answer}</p>
                            </div>
                          ))}
                      </div>
                    )}

                    {/* Public testimonial link */}
                    {(closure.status === "PUBLIC_TESTIMONIAL" || closure.status === "BOTH_FEEDBACK") &&
                      therapist.reviewLink && (
                        <div className="mt-3">
                          <a
                            href={therapist.reviewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-[#C4923A] font-medium hover:underline"
                          >
                            → Voir sur {platformLabel}
                          </a>
                        </div>
                      )}
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
