"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { QUESTIONS } from "@/lib/questions";

export default function PrivateFeedbackPage() {
  const params = useParams();
  const token = params.token as string;

  const [answers, setAnswers] = useState<string[]>(Array(5).fill(""));
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [alreadyDone, setAlreadyDone] = useState(false);

  useEffect(() => {
    // Check if already submitted
    fetch(`/api/patient/${token}/status`)
      .then((r) => r.json())
      .then((data) => {
        if (data.status === "PRIVATE_FEEDBACK" || data.status === "PUBLIC_TESTIMONIAL") {
          setAlreadyDone(true);
        }
      })
      .catch(() => {});
  }, [token]);

  function setAnswer(index: number, value: string) {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/patient/${token}/private`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      const data = await res.json();
      if (!res.ok) {
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

  if (alreadyDone) {
    return (
      <div className="min-h-screen bg-[#F4F7FD] flex items-center justify-center px-4">
        <div className="max-w-lg w-full text-center">
          <div className="text-4xl mb-4">✓</div>
          <h1 className="text-2xl font-bold text-[#1B3A6B] mb-3">Retour déjà enregistré</h1>
          <p className="text-[#6b7280]">Votre retour a déjà été pris en compte. Merci.</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F4F7FD] flex items-center justify-center px-4">
        <div className="max-w-lg w-full text-center">
          <div className="text-4xl mb-4">💙</div>
          <h1 className="text-2xl font-bold text-[#1B3A6B] mb-3">
            Merci pour votre retour
          </h1>
          <p className="text-[#6b7280] leading-relaxed">
            Votre témoignage est précieux et confidentiel. Il sera transmis à votre thérapeute pour
            nourrir sa pratique — jamais rendu public.
          </p>
          <p className="text-xs text-[#9ca3af] mt-6">
            Relais — un espace de confiance entre patients et thérapeutes
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7FD] py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="text-2xl font-bold text-[#1B3A6B] mb-2">Relais</div>
          <h1 className="text-xl font-semibold text-[#1B3A6B] mb-2">Retour privé</h1>
          <p className="text-[#6b7280] text-sm leading-relaxed max-w-md mx-auto">
            Ce que vous partagez ici reste strictement confidentiel. Seul votre thérapeute pourra le
            lire — jamais rendu public, jamais partagé.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {QUESTIONS.map((question, i) => (
              <div key={i}>
                <Textarea
                  label={`${i + 1}. ${question}`}
                  value={answers[i]}
                  onChange={(e) => setAnswer(i, e.target.value)}
                  placeholder="Votre réponse (facultatif)…"
                  rows={3}
                />
              </div>
            ))}

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <Button type="submit" loading={loading} size="lg" className="w-full">
              Envoyer mon retour
            </Button>

            <p className="text-xs text-[#9ca3af] text-center">
              Toutes les réponses sont facultatives. Seules celles que vous remplissez seront transmises.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
