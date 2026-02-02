"use client";

import { useEffect, useState } from "react";

interface TrendingTopic {
  id: string;
  title: string;
  searchVolume: string;
  intensity: number;
  icon: string;
  url: string;
}

const fallbackTopics: TrendingTopic[] = [
  { id: "economy", title: "Economy", searchVolume: "High", intensity: 80, icon: "💰", url: "https://trends.google.com/trends/explore?q=economy&geo=US" },
  { id: "immigration", title: "Immigration", searchVolume: "High", intensity: 75, icon: "🛂", url: "https://trends.google.com/trends/explore?q=immigration&geo=US" },
  { id: "healthcare", title: "Healthcare", searchVolume: "Medium", intensity: 65, icon: "🏥", url: "https://trends.google.com/trends/explore?q=healthcare&geo=US" },
  { id: "climate", title: "Climate", searchVolume: "Medium", intensity: 55, icon: "🌍", url: "https://trends.google.com/trends/explore?q=climate&geo=US" },
  { id: "education", title: "Education", searchVolume: "Medium", intensity: 50, icon: "📚", url: "https://trends.google.com/trends/explore?q=education&geo=US" },
  { id: "housing", title: "Housing", searchVolume: "Medium", intensity: 45, icon: "🏠", url: "https://trends.google.com/trends/explore?q=housing&geo=US" },
];

function getIntensityColor(intensity: number): string {
  if (intensity >= 80) return "bg-rose-500";
  if (intensity >= 60) return "bg-pink-500";
  if (intensity >= 40) return "bg-fuchsia-500";
  return "bg-purple-500";
}

export default function PublicConcerns() {
  const [topics, setTopics] = useState<TrendingTopic[]>(fallbackTopics);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrends() {
      try {
        const response = await fetch("/api/public-trends");
        if (response.ok) {
          const data = await response.json();
          if (data.trends && data.trends.length > 0) {
            setTopics(data.trends);
          }
        }
      } catch (error) {
        console.error("Failed to fetch public trends:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTrends();
  }, []);

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xl">📣</span>
        <h2 className="font-semibold text-slate-900">What's on People's Minds</h2>
        {loading && (
          <span className="text-xs text-slate-400 ml-auto">Loading...</span>
        )}
      </div>
      <p className="text-slate-500 text-sm mb-5">
        Trending civic topics people are searching for
      </p>

      <div className="space-y-4">
        {topics.map((topic, index) => (
          <a
            key={topic.id}
            href={topic.url}
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
              <span className="text-lg shrink-0">{topic.icon}</span>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-medium text-slate-800 group-hover:text-fuchsia-600 transition-colors">
                    {topic.title}
                  </span>
                  <span className="text-slate-400 text-xs">
                    {topic.searchVolume} searches
                  </span>
                </div>

                {/* Bar - using different colors to distinguish from Congress section */}
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${getIntensityColor(topic.intensity)}`}
                    style={{ width: `${topic.intensity}%` }}
                  />
                </div>
              </div>

              {/* Arrow */}
              <svg
                className="w-4 h-4 text-slate-300 group-hover:text-fuchsia-500 transition-colors shrink-0"
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
        Data from Google Trends
      </p>
    </div>
  );
}
