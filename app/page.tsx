"use client";

import { useState } from "react";
import localFont from "next/font/local";
import RepCard from "./components/RepCard";
import OrgCard from "./components/OrgCard";
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

    // US Senators
    if (
      reason.includes("senator") ||
      reason.includes("senate") ||
      area.includes("us senate")
    ) {
      senators.push(rep);
    }
    // US House Representatives
    else if (
      reason.includes("house") ||
      reason.includes("representative") ||
      area.includes("us house")
    ) {
      houseReps.push(rep);
    }
    // State: Governor
    else if (reason.includes("governor") || area.includes("governor")) {
      state.push(rep);
    }
    // Default to state for other officials
    else if (rep.name) {
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
  const localOrgs = userMetro && selectedIssue
    ? getLocalOrgs(userMetro.id, selectedIssue)
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setReps(null);

    // Validate zip code
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

  return (
    <main className="min-h-screen">
      {/* Header Banner */}
      <div className="py-10 px-4 mb-8" style={{ backgroundColor: "#427aa1" }}>
        <div className="max-w-2xl mx-auto text-center">
          <h1 className={`${qilka.className} text-5xl text-white mb-2`}>
            Talkto
          </h1>
          <p className="text-blue-100 text-lg font-medium">
            Find Your Representatives, Speak Your Mind!
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4">

        {/* Zip Code Form */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <label
              htmlFor="zipcode"
              className="block text-gray-700 font-medium mb-2"
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
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-lg"
              />
              <button
                type="submit"
                disabled={loading}
                className="btn-primary text-white font-semibold px-6 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
                    Loading
                  </span>
                ) : (
                  "Find My Reps"
                )}
              </button>
            </div>
            {error && (
              <p className="mt-3 text-red-600 text-sm font-medium">{error}</p>
            )}
          </div>
        </form>

        {/* Results */}
        {reps && (
          <div className="space-y-8">
            {/* US Senators */}
            {reps.senators.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-10 h-10 bg-blue-900 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    SEN
                  </span>
                  Your US Senators
                </h2>
                <div className="space-y-4">
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
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-10 h-10 bg-indigo-700 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    REP
                  </span>
                  Your US Representative
                </h2>
                <div className="space-y-4">
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
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-10 h-10 bg-emerald-700 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    STATE
                  </span>
                  State Officials
                </h2>
                <div className="space-y-4">
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

        {/* Change Makers Section */}
        <section className="mt-12 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Change Makers Near You
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              Find organizations making a difference on issues you care about.
            </p>

            <select
              value={selectedIssue}
              onChange={(e) => setSelectedIssue(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-lg bg-white"
            >
              <option value="">Select an issue that matters to you...</option>
              {organizationsData.categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            {/* Featured Issue Tiles - shown when no issue selected */}
            {!selectedIssue && (
              <div className="mt-6">
                <p className="text-gray-500 text-sm mb-3">Or choose a popular issue:</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "environment", emoji: "🌍", label: "Environment", bg: "bg-teal-700" },
                    { id: "voting-rights", emoji: "🗳️", label: "Voting Rights", bg: "bg-sky-700" },
                    { id: "civil-rights", emoji: "✊", label: "Civil Rights", bg: "bg-amber-700" },
                    { id: "healthcare", emoji: "🏥", label: "Healthcare", bg: "bg-rose-700" },
                    { id: "education", emoji: "📚", label: "Education", bg: "bg-violet-700" },
                    { id: "housing", emoji: "🏠", label: "Housing", bg: "bg-cyan-800" },
                  ].map((tile) => (
                    <button
                      key={tile.id}
                      onClick={() => setSelectedIssue(tile.id)}
                      className={`${tile.bg} aspect-square rounded-xl flex flex-col items-center justify-center text-white hover:opacity-90 transition-opacity shadow-md`}
                    >
                      <span className="text-3xl mb-1">{tile.emoji}</span>
                      <span className="text-xs font-medium text-center px-1">{tile.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Organization Results */}
          {selectedCategory && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-700">
                  Organizations working on {selectedCategory.name}
                  {userMetro && <span className="text-sm font-normal text-gray-500 ml-2">in {userMetro.name}</span>}
                </h3>
                <button
                  onClick={() => setSelectedIssue("")}
                  className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to all issues
                </button>
              </div>

              {/* Local Organizations */}
              {localOrgs.length > 0 && (
                <>
                  <p className="text-sm text-emerald-700 font-medium">Local to {userMetro?.name}</p>
                  {localOrgs.map((org, index) => (
                    <OrgCard
                      key={`local-${selectedCategory.id}-${index}`}
                      name={org.name}
                      mission={org.mission}
                      website={org.website}
                      hasLocalChapters={false}
                    />
                  ))}
                </>
              )}

              {/* National Organizations */}
              {localOrgs.length > 0 && (
                <p className="text-sm text-gray-500 font-medium pt-4 border-t">National Organizations</p>
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
                    selectedCategory.name + " nonprofit organizations" + (zipCode ? ` near ${zipCode}` : " near me")
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center gap-1"
                >
                  Search for more {userMetro ? `in ${userMetro.name}` : "near you"}
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
        <footer className="mt-12 mb-8 text-center text-gray-500 text-sm">
          <p>Your voice matters. Make a difference today.</p>
        </footer>
      </div>
    </main>
  );
}
