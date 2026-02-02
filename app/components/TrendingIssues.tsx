"use client";

import { useEffect, useState } from "react";

interface CongressIssue {
  id: string;
  title: string;
  subtitle?: string;
  intensity: number;
  icon: string;
  billCount: number;
  url?: string;
}

// Fallback data in case API fails
const fallbackIssues: CongressIssue[] = [
  { id: "1", title: "Government Funding", subtitle: "Appropriations activity", intensity: 85, icon: "💰", billCount: 8, url: "https://www.congress.gov/search?q=%7B%22source%22%3A%22legislation%22%2C%22congress%22%3A%22119%22%2C%22search%22%3A%22appropriations%22%7D" },
  { id: "2", title: "Healthcare", subtitle: "Healthcare legislation", intensity: 70, icon: "🏥", billCount: 6, url: "https://www.congress.gov/search?q=%7B%22source%22%3A%22legislation%22%2C%22congress%22%3A%22119%22%2C%22search%22%3A%22healthcare%22%7D" },
  { id: "3", title: "Defense & Veterans", subtitle: "Military and veterans affairs", intensity: 60, icon: "🎖️", billCount: 5, url: "https://www.congress.gov/search?q=%7B%22source%22%3A%22legislation%22%2C%22congress%22%3A%22119%22%2C%22search%22%3A%22veterans%22%7D" },
  { id: "4", title: "Climate & Energy", subtitle: "Environmental policy", intensity: 55, icon: "🌍", billCount: 4, url: "https://www.congress.gov/search?q=%7B%22source%22%3A%22legislation%22%2C%22congress%22%3A%22119%22%2C%22search%22%3A%22climate%22%7D" },
  { id: "5", title: "Education", subtitle: "Education policy", intensity: 45, icon: "📚", billCount: 3, url: "https://www.congress.gov/search?q=%7B%22source%22%3A%22legislation%22%2C%22congress%22%3A%22119%22%2C%22search%22%3A%22education%22%7D" },
  { id: "6", title: "Immigration", subtitle: "Border and immigration", intensity: 40, icon: "🛂", billCount: 3, url: "https://www.congress.gov/search?q=%7B%22source%22%3A%22legislation%22%2C%22congress%22%3A%22119%22%2C%22search%22%3A%22immigration%22%7D" },
];

function getIntensityColor(intensity: number): string {
  if (intensity >= 80) return "bg-red-500";
  if (intensity >= 60) return "bg-orange-500";
  if (intensity >= 40) return "bg-amber-500";
  return "bg-emerald-500";
}

// Build a URL that searches current congress (119th) legislation
function buildCongressSearchUrl(category: string): string {
  const searchQuery = {
    source: "legislation",
    congress: "119",
    search: category,
  };
  return `https://www.congress.gov/search?q=${encodeURIComponent(JSON.stringify(searchQuery))}`;
}

export default function TrendingIssues() {
  const [issues, setIssues] = useState<CongressIssue[]>(fallbackIssues);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTrending() {
      try {
        const response = await fetch("/api/trending");
        if (response.ok) {
          const data = await response.json();
          if (data.trending && data.trending.length > 0) {
            // Update URLs to point to current congress
            const withFixedUrls = data.trending.map((issue: CongressIssue) => ({
              ...issue,
              url: buildCongressSearchUrl(issue.title),
            }));
            setIssues(withFixedUrls);
            setLastUpdated(data.updated);
          }
        }
      } catch (error) {
        console.error("Failed to fetch trending issues:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTrending();
  }, []);

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xl">🏛️</span>
        <h2 className="font-semibold text-slate-900">Active in Congress</h2>
        {loading && (
          <span className="text-xs text-slate-400 ml-auto">Loading...</span>
        )}
      </div>
      <p className="text-slate-500 text-sm mb-5">
        Legislative topics with recent bill activity
      </p>

      <div className="space-y-4">
        {issues.map((issue, index) => (
          <a
            key={issue.id}
            href={issue.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block group"
          >
            <div className="flex items-center gap-3">
              {/* Rank */}
              <span className="text-slate-400 text-sm font-medium w-4 shrink-0">
                {index + 1}
              </span>

              {/* Icon */}
              <span className="text-lg shrink-0">{issue.icon}</span>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-medium text-slate-800 group-hover:text-indigo-600 transition-colors">
                    {issue.title}
                  </span>
                  <span className="text-slate-400 text-xs">
                    {issue.billCount} bill{issue.billCount !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Bar */}
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${getIntensityColor(issue.intensity)}`}
                    style={{ width: `${issue.intensity}%` }}
                  />
                </div>
              </div>

              {/* Arrow */}
              <svg
                className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </a>
        ))}
      </div>

      <p className="text-slate-400 text-xs mt-4 pt-4 border-t border-slate-200">
        Data from Congress.gov (119th Congress)
        {lastUpdated && (
          <span className="ml-1">
            · Updated {new Date(lastUpdated).toLocaleDateString()}
          </span>
        )}
      </p>
    </div>
  );
}
