"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Une erreur est survenue.");
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F7FD] px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#1B3A6B]">Relais</h1>
          </div>
          <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm p-8 text-center">
            <div className="text-4xl mb-4">📬</div>
            <h2 className="text-xl font-semibold text-[#1B3A6B] mb-3">Email envoyé</h2>
            <p className="text-sm text-[#6b7280] leading-relaxed">
              Si un compte existe pour <strong>{email}</strong>, vous recevrez un lien de
              réinitialisation dans les prochaines minutes. Pensez à vérifier vos spams.
            </p>
            <Link
              href="/login"
              className="inline-block mt-6 text-sm text-[#1B3A6B] font-medium hover:underline"
            >
              ← Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F7FD] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#1B3A6B]">Relais</h1>
          <p className="text-[#6b7280] mt-2">Réinitialisez votre mot de passe</p>
        </div>

        <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm p-8">
          <p className="text-sm text-[#6b7280] mb-6">
            Entrez votre adresse email et nous vous enverrons un lien pour créer un nouveau mot de
            passe.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input
              label="Adresse email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@exemple.fr"
              required
              autoComplete="email"
            />

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <Button type="submit" loading={loading} size="lg" className="w-full">
              Envoyer le lien
            </Button>
          </form>

          <p className="text-center text-sm text-[#6b7280] mt-6">
            <Link href="/login" className="text-[#1B3A6B] font-medium hover:underline">
              ← Retour à la connexion
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
