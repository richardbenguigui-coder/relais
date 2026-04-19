import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

async function markPublicTestimonial(token: string) {
  const closure = await prisma.closure.findUnique({ where: { token } });
  if (!closure) return null;

  if (!closure.respondedAt) {
    await prisma.closure.update({
      where: { token },
      data: {
        status: "PUBLIC_TESTIMONIAL",
        respondedAt: new Date(),
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
  const closure = await markPublicTestimonial(token);

  if (!closure) notFound();

  const therapist = await prisma.therapist.findUnique({
    where: { id: closure.therapistId },
    select: { googleReviewLink: true, name: true },
  });

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

        {therapist?.googleReviewLink && (
          <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm p-8 text-center">
            <p className="text-[#374151] mb-6">
              Cliquez ci-dessous pour déposer votre avis directement sur Google — cela prend moins de 2 minutes.
            </p>
            <a
              href={therapist.googleReviewLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-[#1B3A6B] text-white font-semibold px-8 py-3 rounded-lg hover:bg-[#15305a] transition-colors"
            >
              Laisser un avis Google
            </a>
            <p className="text-xs text-[#9ca3af] mt-4">
              Vous serez redirigé vers Google. Votre avis est entièrement libre et vous appartient.
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
