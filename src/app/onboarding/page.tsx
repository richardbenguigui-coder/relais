"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [googleReviewLink, setGoogleReviewLink] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!googleReviewLink.startsWith("http")) {
      setError("Veuillez entrer un lien Google valide (commençant par http).");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, googleReviewLink }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Une erreur est survenue.");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F7FD] px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#1B3A6B]">Relais</h1>
          <p className="text-[#6b7280] mt-2">Configurez votre espace en 2 minutes</p>
        </div>

        <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm p-8">
          <h2 className="text-xl font-semibold text-[#1B3A6B] mb-2">Bienvenue !</h2>
          <p className="text-[#6b7280] text-sm mb-6">
            Ces informations permettent à Relais de personnaliser les emails et de rediriger vos patients
            vers votre fiche Google.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input
              label="Votre prénom et nom"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Marie Dupont"
              required
            />

            <div className="flex flex-col gap-1">
              <Input
                label="Votre lien Google Business"
                type="url"
                value={googleReviewLink}
                onChange={(e) => setGoogleReviewLink(e.target.value)}
                placeholder="https://g.page/r/VOTRE_ID/review"
                required
              />
              <p className="text-xs text-[#6b7280]">
                Ce lien est partagé uniquement aux patients qui choisissent de laisser un avis public.
              </p>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <Button type="submit" loading={loading} size="lg" className="w-full mt-1">
              Accéder à mon tableau de bord
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
