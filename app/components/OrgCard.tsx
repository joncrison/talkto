"use client";

interface OrgCardProps {
  name: string;
  mission: string;
  website: string;
  hasLocalChapters: boolean;
  chapterFinderUrl?: string;
}

export default function OrgCard({
  name,
  mission,
  website,
  hasLocalChapters,
  chapterFinderUrl,
}: OrgCardProps) {
  return (
    <div className="card card-interactive p-4">
      <div className="flex justify-between items-start gap-3 mb-2">
        <h3 className="font-semibold text-slate-900">{name}</h3>
        {hasLocalChapters && (
          <span className="badge badge-success shrink-0">Local Chapters</span>
        )}
      </div>

      <p className="text-slate-500 text-sm mb-4 leading-relaxed">{mission}</p>

      <div className="flex gap-2 flex-wrap">
        <a
          href={website}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Visit Website
        </a>
        {hasLocalChapters && chapterFinderUrl && (
          <a
            href={chapterFinderUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Find Local
          </a>
        )}
      </div>
    </div>
  );
}
