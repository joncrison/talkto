"use client";

import Image from "next/image";

interface RepCardProps {
  name: string;
  title: string;
  party: string;
  phone?: string;
  websiteUrl?: string;
  photoUrl?: string;
  area?: string;
}

function getPartyColor(party: string): string {
  const partyLower = party.toLowerCase();
  if (partyLower.includes("democrat")) {
    return "bg-blue-600";
  }
  if (partyLower.includes("republican")) {
    return "bg-red-600";
  }
  if (partyLower.includes("independent")) {
    return "bg-purple-600";
  }
  return "bg-gray-600";
}

function getFullPartyName(party: string): string {
  const partyLower = party.toLowerCase();
  if (partyLower.includes("democrat")) return "Democrat";
  if (partyLower.includes("republican")) return "Republican";
  if (partyLower.includes("independent")) return "Independent";
  if (partyLower.includes("libertarian")) return "Libertarian";
  if (partyLower.includes("green")) return "Green";
  // Return original if it's already a full name or unknown
  return party || "Unknown";
}

function formatPhoneForDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits.startsWith("1")) {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return phone;
}

function getContactUrl(websiteUrl: string): string {
  try {
    const url = new URL(websiteUrl);
    // For congressional websites, append /contact
    if (
      url.hostname.endsWith(".senate.gov") ||
      url.hostname.endsWith(".house.gov")
    ) {
      // Remove trailing slash if present, then add /contact
      return websiteUrl.replace(/\/$/, "") + "/contact";
    }
    // For other government sites, just return the base URL
    return websiteUrl;
  } catch {
    return websiteUrl;
  }
}

export default function RepCard({
  name,
  title,
  party,
  phone,
  websiteUrl,
  photoUrl,
}: RepCardProps) {
  const partyName = getFullPartyName(party);
  const partyColor = getPartyColor(party);

  return (
    <div className="bg-white rounded-xl shadow-md card-hover p-5 flex gap-4">
      {/* Photo */}
      <div className="shrink-0">
        <div className="w-20 h-24 rounded-lg overflow-hidden bg-gray-100 relative">
          {photoUrl ? (
            <Image
              src={photoUrl}
              alt={`Photo of ${name}`}
              fill
              className="object-cover"
              sizes="80px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg
                className="w-10 h-10"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 mb-1 flex-wrap">
          <h3 className="font-semibold text-gray-900 text-lg">{name}</h3>
          <span
            className={`${partyColor} text-white text-xs font-semibold px-2.5 py-0.5 rounded-full shrink-0`}
          >
            {partyName}
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-3">{title}</p>

        {/* Contact Buttons */}
        <div className="flex gap-2 flex-wrap items-center">
          {phone && (
            <a
              href={`tel:${phone.replace(/\D/g, "")}`}
              className="btn-phone inline-flex items-center gap-1.5 text-white text-sm font-medium px-3 py-2 rounded-lg"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
              </svg>
              Call
            </a>
          )}
          {websiteUrl && (
            <a
              href={getContactUrl(websiteUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-email inline-flex items-center gap-1.5 text-white text-sm font-medium px-3 py-2 rounded-lg"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
              Write
            </a>
          )}
          {phone && (
            <span className="text-gray-500 text-sm">
              {formatPhoneForDisplay(phone)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
