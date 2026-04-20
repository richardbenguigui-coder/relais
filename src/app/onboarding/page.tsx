"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const PLATFORMS = [
  {
    id: "GOOGLE",
    label: "Google",
    description: "Fiche Google Business / Maps",
    placeholder: "https://g.page/r/VOTRE_ID/review",
  },
  {
    id: "TRUSTPILOT",
    label: "Trustpilot",
    description: "Page Trustpilot de votre cabinet",
    placeholder: "https://fr.trustpilot.com/evaluate/votre-cabinet.fr",
  },
  {
    id: "AVIS_VERIFIES",
    label: "Avis Vérifiés",
    description: "Page Avis Vérifiés de votre cabinet",
    placeholder: "https://www.avis-verifies.com/avis-clients/votre-cabinet.fr",
  },
] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [reviewPlatform, setReviewPlatform] = useState<"GOOGLE" | "TRUSTPILOT" | "AVIS_VERIFIES">("GOOGLE");
  const [reviewLink, setReviewLink] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedPlatform = PLATFORMS.find((p) => p.id === reviewPlatform)!;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!reviewLink.startsWith("http")) {
      setError("Veuillez entrer un lien valide (commençant par http).");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, reviewPlatform, reviewLink }),
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
            vers votre page d&apos;avis.
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

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[#374151]">
                Plateforme d&apos;avis
              </label>
              <div className="flex flex-col gap-2">
                {PLATFORMS.map((p) => (
                  <label
                    key={p.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      reviewPlatform === p.id
                        ? "border-[#1B3A6B] bg-[#F4F7FD]"
                        : "border-[#e2e8f0] hover:border-[#1B3A6B]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="reviewPlatform"
                      value={p.id}
                      checked={reviewPlatform === p.id}
                      onChange={() => {
                        setReviewPlatform(p.id as typeof reviewPlatform);
                        setReviewLink("");
                      }}
                      className="accent-[#1B3A6B]"
                    />
                    <div>
                      <div className="text-sm font-medium text-[#1B3A6B]">{p.label}</div>
                      <div className="text-xs text-[#6b7280]">{p.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <Input
                label={`Votre lien ${selectedPlatform.label}`}
                type="url"
                value={reviewLink}
                onChange={(e) => setReviewLink(e.target.value)}
                placeholder={selectedPlatform.placeholder}
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
