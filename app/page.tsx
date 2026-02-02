"use client";

import { useState } from "react";
import localFont from "next/font/local";
import RepCard from "./components/RepCard";
import OrgCard from "./components/OrgCard";
import TrendingIssues from "./components/TrendingIssues";
import PublicConcerns from "./components/PublicConcerns";
import organizationsData from "./data/organizations.json";
import localOrgsData from "./data/localOrganizations.json";

const qilka = localFont({
  src: "./fonts/Qilka-Bold.otf",
});

interface Representative {
  name: string;
  party: string;
  phone: string;
  url: string;
  photoURL: string;
  reason: string;
  area: string;
}

interface RepsByLevel {
  senators: Representative[];
  houseReps: Representative[];
  state: Representative[];
}

function categorizeReps(reps: Representative[]): RepsByLevel {
  const senators: Representative[] = [];
  const houseReps: Representative[] = [];
  const state: Representative[] = [];

  for (const rep of reps) {
    const reason = rep.reason?.toLowerCase() || "";
    const area = rep.area?.toLowerCase() || "";

    if (
      reason.includes("senator") ||
      reason.includes("senate") ||
      area.includes("us senate")
    ) {
      senators.push(rep);
    } else if (
      reason.includes("house") ||
      reason.includes("representative") ||
      area.includes("us house")
    ) {
      houseReps.push(rep);
    } else if (reason.includes("governor") || area.includes("governor")) {
      state.push(rep);
    } else if (rep.name) {
      state.push(rep);
    }
  }

  return { senators, houseReps, state };
}

function getTitleFromRep(rep: Representative): string {
  const reason = rep.reason?.toLowerCase() || "";
  const area = rep.area || "";

  if (reason.includes("senator") || reason.includes("senate")) {
    return `US Senator`;
  }
  if (reason.includes("house") || reason.includes("representative")) {
    return `US Representative`;
  }
  if (reason.includes("governor")) {
    return `Governor`;
  }
  return area || "Representative";
}

function getMetroFromZip(zip: string): { id: string; name: string } | null {
  const prefix = zip.substring(0, 3);
  for (const [metroId, metro] of Object.entries(localOrgsData.metros)) {
    if ((metro as { zipPrefixes: string[] }).zipPrefixes.includes(prefix)) {
      return { id: metroId, name: (metro as { name: string }).name };
    }
  }
  return null;
}

function getLocalOrgs(metroId: string, categoryId: string) {
  const match = localOrgsData.localOrgs.find(
    (item) => item.metro === metroId && item.category === categoryId
  );
  return match?.organizations || [];
}

export default function Home() {
  const [zipCode, setZipCode] = useState("");
  const [reps, setReps] = useState<RepsByLevel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedIssue, setSelectedIssue] = useState("");

  const selectedCategory = organizationsData.categories.find(
    (cat) => cat.id === selectedIssue
  );

  const userMetro = zipCode.length >= 3 ? getMetroFromZip(zipCode) : null;
  const localOrgs =
    userMetro && selectedIssue ? getLocalOrgs(userMetro.id, selectedIssue) : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setReps(null);

    const cleanZip = zipCode.trim();
    if (!/^\d{5}$/.test(cleanZip)) {
      setError("Please enter a valid 5-digit zip code");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `https://api.5calls.org/v1/reps?location=${cleanZip}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch representatives");
      }

      const data = await response.json();

      if (!data.representatives || data.representatives.length === 0) {
        setError("No representatives found for this zip code");
        return;
      }

      const categorized = categorizeReps(data.representatives);
      setReps(categorized);
    } catch {
      setError("Unable to find representatives. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const issueTiles = [
    { id: "environment", icon: "🌍", label: "Environment" },
    { id: "voting-rights", icon: "🗳️", label: "Voting Rights" },
    { id: "civil-rights", icon: "✊", label: "Civil Rights" },
    { id: "healthcare", icon: "🏥", label: "Healthcare" },
    { id: "education", icon: "📚", label: "Education" },
    { id: "housing", icon: "🏠", label: "Housing" },
  ];

  return (
    <main className="min-h-screen pb-12">
      {/* Header */}
      <header className="bg-slate-100 border-b-2 border-slate-300">
        <div className="max-w-xl mx-auto px-4 py-6">
          <h1 className={`${qilka.className} text-3xl text-slate-900 text-center`}>
            Talkto
          </h1>
          <p className="text-slate-500 text-center text-sm mt-1">
            Find your representatives. Make your voice heard.
          </p>
        </div>
      </header>

      <div className="max-w-xl mx-auto px-4 pt-6">
        {/* Zip Code Form */}
        <div className="card p-5 mb-6">
          <form onSubmit={handleSubmit}>
            <label
              htmlFor="zipcode"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Enter your zip code
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                id="zipcode"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                placeholder="e.g., 90210"
                maxLength={5}
                className="input flex-1"
              />
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary px-5"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Finding...</span>
                  </span>
                ) : (
                  "Find Your Representatives"
                )}
              </button>
            </div>
            {error && (
              <p className="mt-3 text-red-600 text-sm">{error}</p>
            )}
          </form>
        </div>

        {/* Results */}
        {reps && (
          <div className="space-y-6 mb-8">
            {/* US Senators */}
            {reps.senators.length > 0 && (
              <section>
                <div className="section-header">
                  <div className="section-icon bg-indigo-600">SEN</div>
                  <h2 className="section-title">Your US Senators</h2>
                </div>
                <div className="space-y-3">
                  {reps.senators.map((rep, index) => (
                    <RepCard
                      key={`senator-${index}`}
                      name={rep.name}
                      title="US Senator"
                      party={rep.party}
                      phone={rep.phone}
                      websiteUrl={rep.url}
                      photoUrl={rep.photoURL}
                      area={rep.area}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* US House Representative */}
            {reps.houseReps.length > 0 && (
              <section>
                <div className="section-header">
                  <div className="section-icon bg-violet-600">REP</div>
                  <h2 className="section-title">Your US Representative</h2>
                </div>
                <div className="space-y-3">
                  {reps.houseReps.map((rep, index) => (
                    <RepCard
                      key={`house-${index}`}
                      name={rep.name}
                      title="US Representative"
                      party={rep.party}
                      phone={rep.phone}
                      websiteUrl={rep.url}
                      photoUrl={rep.photoURL}
                      area={rep.area}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* State Officials */}
            {reps.state.length > 0 && (
              <section>
                <div className="section-header">
                  <div className="section-icon bg-emerald-600">GOV</div>
                  <h2 className="section-title">State Officials</h2>
                </div>
                <div className="space-y-3">
                  {reps.state.map((rep, index) => (
                    <RepCard
                      key={`state-${index}`}
                      name={rep.name}
                      title={getTitleFromRep(rep)}
                      party={rep.party}
                      phone={rep.phone}
                      websiteUrl={rep.url}
                      photoUrl={rep.photoURL}
                      area={rep.area}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-slate-300"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-slate-200 px-4 text-sm text-slate-500">
              Find organizations & non-profits in your area who are doing the work
            </span>
          </div>
        </div>

        {/* Change Makers Section */}
        <section>
          <div className="card p-5">
            <h2 className="font-semibold text-slate-900 mb-1">
              Change Makers Near You
            </h2>
            <p className="text-slate-500 text-sm mb-4">
              Find organizations making a difference on issues you care about.
            </p>

            <select
              value={selectedIssue}
              onChange={(e) => setSelectedIssue(e.target.value)}
              className="input select"
            >
              <option value="">Select an issue...</option>
              {organizationsData.categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            {/* Issue Quick Select */}
            {!selectedIssue && (
              <div className="mt-5">
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-3">
                  Popular Issues
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {issueTiles.map((tile) => (
                    <button
                      key={tile.id}
                      onClick={() => setSelectedIssue(tile.id)}
                      className="group flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 border-slate-300 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50 transition-all"
                    >
                      <span className="text-2xl">{tile.icon}</span>
                      <span className="text-xs font-medium text-slate-600 group-hover:text-indigo-700">
                        {tile.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Organization Results */}
          {selectedCategory && (
            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-slate-700">
                  {selectedCategory.name}
                  {userMetro && (
                    <span className="text-slate-400 font-normal ml-1">
                      in {userMetro.name}
                    </span>
                  )}
                </h3>
                <button
                  onClick={() => setSelectedIssue("")}
                  className="btn btn-ghost text-xs px-2 py-1"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Back
                </button>
              </div>

              {/* Local Organizations */}
              {localOrgs.length > 0 && (
                <>
                  <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide">
                    Local to {userMetro?.name}
                  </p>
                  {localOrgs.map((org, index) => (
                    <OrgCard
                      key={`local-${selectedCategory.id}-${index}`}
                      name={org.name}
                      mission={org.mission}
                      website={org.website}
                      hasLocalChapters={false}
                    />
                  ))}
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wide pt-3">
                    National Organizations
                  </p>
                </>
              )}

              {selectedCategory.organizations.map((org, index) => (
                <OrgCard
                  key={`${selectedCategory.id}-${index}`}
                  name={org.name}
                  mission={org.mission}
                  website={org.website}
                  hasLocalChapters={org.hasLocalChapters}
                  chapterFinderUrl={org.chapterFinderUrl}
                />
              ))}

              {/* Search for more */}
              <div className="text-center pt-4">
                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent(
                    selectedCategory.name +
                      " nonprofit organizations" +
                      (zipCode ? ` near ${zipCode}` : " near me")
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium inline-flex items-center gap-1 transition-colors"
                >
                  Search for more{" "}
                  {userMetro ? `in ${userMetro.name}` : "near you"}
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </div>
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="mt-12 text-center">
          <p className="text-slate-400 text-sm">
            Your voice matters. Speak. Volunteer. Make a difference.
          </p>
        </footer>

        {/* Pulse Section - What People Care About vs What Congress is Doing */}
        <div className="mt-8 space-y-6">
          <PublicConcerns />
          <TrendingIssues />
        </div>
      </div>
    </main>
  );
}
