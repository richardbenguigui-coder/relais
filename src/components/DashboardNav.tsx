"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "./ui/Button";

interface DashboardNavProps {
  therapistName: string | null;
  subscriptionStatus: string;
  trialEndsAt: Date | null;
}

export function DashboardNav({ therapistName, subscriptionStatus, trialEndsAt }: DashboardNavProps) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  const daysLeft = trialEndsAt
    ? Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <header className="bg-white border-b border-[#e2e8f0] sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/dashboard" className="text-xl font-bold text-[#1B3A6B]">
          Relais
        </Link>

        <div className="flex items-center gap-4">
          {subscriptionStatus === "TRIAL" && daysLeft !== null && (
            <span className="text-xs bg-[#FEF3C7] text-[#92400E] px-3 py-1 rounded-full font-medium">
              Essai — {daysLeft}j restants
            </span>
          )}
          {(subscriptionStatus === "CANCELED" || subscriptionStatus === "PAST_DUE") && (
            <Link href="/api/stripe/checkout">
              <Button size="sm" variant="primary">
                S&apos;abonner — 9€/mois
              </Button>
            </Link>
          )}
          <span className="text-sm text-[#6b7280]">{therapistName}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-[#6b7280] hover:text-[#1B3A6B] transition-colors"
          >
            Déconnexion
          </button>
        </div>
      </div>
    </header>
  );
}
