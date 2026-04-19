import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

async function markDeclined(token: string) {
  const closure = await prisma.closure.findUnique({ where: { token } });
  if (!closure) return null;

  // Only set to NO_FOLLOW_UP if not already responded with public/private
  if (
    closure.status !== "PRIVATE_FEEDBACK" &&
    closure.status !== "PUBLIC_TESTIMONIAL"
  ) {
    // If J28 already sent (second decline), mark as final NO_FOLLOW_UP
    if (closure.email28SentAt) {
      await prisma.closure.update({
        where: { token },
        data: { status: "NO_FOLLOW_UP", respondedAt: new Date() },
      });
    }
    // If J21 was just sent, keep status so J28 follow-up still fires
    // The cron will send J28 since respondedAt is null
  }

  return closure;
}

export default async function DeclinedPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const closure = await markDeclined(token);

  if (!closure) notFound();

  return (
    <div className="min-h-screen bg-[#F4F7FD] flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        <div className="text-4xl mb-4">🤝</div>
        <h1 className="text-2xl font-bold text-[#1B3A6B] mb-3">
          Pas de souci
        </h1>
        <p className="text-[#6b7280] leading-relaxed">
          Votre choix est tout à fait respecté. Vous pourrez toujours partager votre expérience plus
          tard si vous le souhaitez.
        </p>
        <p className="text-xs text-[#9ca3af] mt-6">
          Relais — un espace de confiance entre patients et thérapeutes
        </p>
      </div>
    </div>
  );
}
