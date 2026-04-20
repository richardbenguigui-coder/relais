"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function NewClosurePage() {
  const router = useRouter();
  const [patientFirstName, setPatientFirstName] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [closureDate, setClosureDate] = useState("");
  const [closureType, setClosureType] = useState<"STANDARD" | "INTERRUPTED">("STANDARD");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/closures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientFirstName, patientEmail, closureDate, closureType }),
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
    <div className="min-h-screen bg-[#F4F7FD]">
      <header className="bg-white border-b border-[#e2e8f0]">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center">
          <Link href="/dashboard" className="text-xl font-bold text-[#1B3A6B]">
            Relais
          </Link>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-10">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="text-sm text-[#6b7280] hover:text-[#1B3A6B] transition-colors"
          >
            ← Retour au tableau de bord
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm p-8">
          <h1 className="text-xl font-bold text-[#1B3A6B] mb-2">Nouvelle clôture</h1>
          <p className="text-sm text-[#6b7280] mb-6">
            Un email sera automatiquement envoyé au patient 21 jours après la date de fin de suivi.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input
              label="Prénom du patient"
              type="text"
              value={patientFirstName}
              onChange={(e) => setPatientFirstName(e.target.value)}
              placeholder="Marie"
              required
            />
            <Input
              label="Email du patient"
              type="email"
              value={patientEmail}
              onChange={(e) => setPatientEmail(e.target.value)}
              placeholder="marie@exemple.fr"
              required
            />
            <div className="flex flex-col gap-1">
              <Input
                label="Date de fin de suivi"
                type="date"
                value={closureDate}
                onChange={(e) => setClosureDate(e.target.value)}
                max={today}
                required
              />
              <p className="text-xs text-[#6b7280]">
                L&apos;email J+21 sera envoyé le{" "}
                {closureDate
                  ? new Date(
                      new Date(closureDate).getTime() + 21 * 24 * 60 * 60 * 1000
                    ).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "…"}
              </p>
            </div>

            {/* Closure type */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[#374151]">Type de fin de suivi</label>
              <div className="flex flex-col gap-2">
                <label
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    closureType === "STANDARD"
                      ? "border-[#1B3A6B] bg-[#F4F7FD]"
                      : "border-[#e2e8f0] hover:border-[#1B3A6B]"
                  }`}
                >
                  <input
                    type="radio"
                    name="closureType"
                    value="STANDARD"
                    checked={closureType === "STANDARD"}
                    onChange={() => setClosureType("STANDARD")}
                    className="mt-0.5 accent-[#1B3A6B]"
                  />
                  <div>
                    <div className="text-sm font-medium text-[#1B3A6B]">Fin de suivi ordinaire</div>
                    <div className="text-xs text-[#6b7280]">
                      Le patient et vous avez convenu ensemble de clore le suivi.
                    </div>
                  </div>
                </label>
                <label
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    closureType === "INTERRUPTED"
                      ? "border-[#1B3A6B] bg-[#F4F7FD]"
                      : "border-[#e2e8f0] hover:border-[#1B3A6B]"
                  }`}
                >
                  <input
                    type="radio"
                    name="closureType"
                    value="INTERRUPTED"
                    checked={closureType === "INTERRUPTED"}
                    onChange={() => setClosureType("INTERRUPTED")}
                    className="mt-0.5 accent-[#1B3A6B]"
                  />
                  <div>
                    <div className="text-sm font-medium text-[#1B3A6B]">Suivi interrompu</div>
                    <div className="text-xs text-[#6b7280]">
                      Le patient a cessé de venir sans prévenir. L&apos;email envoyé sera plus doux, sans demande d&apos;avis public.
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <div className="flex gap-3 mt-1">
              <Link href="/dashboard" className="flex-1">
                <Button type="button" variant="ghost" className="w-full">
                  Annuler
                </Button>
              </Link>
              <Button type="submit" loading={loading} className="flex-1">
                Enregistrer la clôture
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
