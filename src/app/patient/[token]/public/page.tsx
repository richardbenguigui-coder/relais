import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

const PLATFORM_LABELS: Record<string, string> = {
  GOOGLE: "Google",
  TRUSTPILOT: "Trustpilot",
  AVIS_VERIFIES: "Avis Vérifiés",
};

async function markPublicFeedback(token: string) {
  const closure = await prisma.closure.findUnique({
    where: { token },
    include: { therapist: { select: { reviewLink: true, reviewPlatform: true, name: true } } },
  });
  if (!closure) return null;

  if (!closure.publicFeedbackAt) {
    await prisma.closure.update({
      where: { token },
      data: {
        status: closure.feedback ? "BOTH_FEEDBACK" : "PUBLIC_TESTIMONIAL",
        publicFeedbackAt: new Date(),
        respondedAt: closure.respondedAt ?? new Date(),
      },
    });
  }

  return closure;
}

export default async function PublicThankYouPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const closure = await markPublicFeedback(token);

  if (!closure) notFound();

  // Interrupted closures have no public review path
  if (closure.closureType === "INTERRUPTED") {
    redirect(`/patient/${token}/private`);
  }

  const { therapist } = closure;
  const platformLabel = PLATFORM_LABELS[therapist.reviewPlatform] ?? "avis";

  return (
    <div className="min-h-screen bg-[#F4F7FD] flex items-center justify-center px-4">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">🌱</div>
          <h1 className="text-2xl font-bold text-[#1B3A6B] mb-3">
            Merci de votre confiance
          </h1>
          <p className="text-[#6b7280] leading-relaxed">
            Votre témoignage peut aider d&apos;autres personnes à franchir le pas. C&apos;est un geste précieux.
          </p>
        </div>

        {therapist.reviewLink && (
          <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm p-8 text-center mb-4">
            <p className="text-[#374151] mb-6">
              Cliquez ci-dessous pour déposer votre avis sur {platformLabel} — cela prend moins de 2 minutes.
            </p>
            <a
              href={therapist.reviewLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-[#1B3A6B] text-white font-semibold px-8 py-3 rounded-lg hover:bg-[#15305a] transition-colors"
            >
              Laisser un avis {platformLabel}
            </a>
            <p className="text-xs text-[#9ca3af] mt-4">
              Vous serez redirigé vers {platformLabel}. Votre avis est entièrement libre et vous appartient.
            </p>
          </div>
        )}

        {/* Double feedback: also offer private comment */}
        {!closure.feedback && (
          <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm p-6 text-center">
            <p className="text-sm text-[#6b7280] mb-3">
              Vous souhaitez aussi partager quelque chose en privé avec votre thérapeute ?
            </p>
            <Link
              href={`/patient/${token}/private`}
              className="inline-block text-sm font-semibold text-[#1B3A6B] border border-[#1B3A6B] px-6 py-2.5 rounded-lg hover:bg-[#F4F7FD] transition-colors"
            >
              Laisser un retour privé
            </Link>
            <p className="text-xs text-[#9ca3af] mt-3">
              Strictement confidentiel — visible uniquement par votre thérapeute.
            </p>
          </div>
        )}

        <p className="text-center text-xs text-[#9ca3af] mt-6">
          Relais — un espace de confiance entre patients et thérapeutes
        </p>
      </div>
    </div>
  );
}
