const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  SCHEDULED: { label: "Programmé", className: "bg-gray-100 text-gray-600" },
  EMAIL_SENT: { label: "Email envoyé", className: "bg-blue-50 text-blue-700" },
  PRIVATE_FEEDBACK: { label: "Retour privé reçu", className: "bg-amber-50 text-amber-700" },
  PUBLIC_TESTIMONIAL: { label: "Témoignage public", className: "bg-green-50 text-green-700" },
  BOTH_FEEDBACK: { label: "Retour complet", className: "bg-purple-50 text-purple-700" },
  NO_FOLLOW_UP: { label: "Sans suite", className: "bg-gray-50 text-gray-400" },
};

export function ClosureStatusBadge({ status, closureType }: { status: string; closureType?: string }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.SCHEDULED;
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${config.className}`}>
        {config.label}
      </span>
      {closureType === "INTERRUPTED" && (
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-orange-50 text-orange-600">
          Interrompu
        </span>
      )}
    </span>
  );
}
