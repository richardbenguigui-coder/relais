const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  SCHEDULED: { label: "Programmé", className: "bg-gray-100 text-gray-600" },
  EMAIL_SENT: { label: "Email envoyé", className: "bg-blue-50 text-blue-700" },
  PRIVATE_FEEDBACK: { label: "Retour privé reçu", className: "bg-amber-50 text-amber-700" },
  PUBLIC_TESTIMONIAL: { label: "Témoignage public", className: "bg-green-50 text-green-700" },
  NO_FOLLOW_UP: { label: "Sans suite", className: "bg-gray-50 text-gray-400" },
};

export function ClosureStatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.SCHEDULED;
  return (
    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${config.className}`}>
      {config.label}
    </span>
  );
}
