import { NextResponse } from "next/server";
import googleTrends from "google-trends-api";

interface TrendingTopic {
  id: string;
  title: string;
  searchVolume: string;
  intensity: number;
  icon: string;
  url: string;
}

// Key civic topics to track interest for
const civicTopics = [
  { term: "Immigration", icon: "🛂" },
  { term: "Economy inflation", icon: "💰" },
  { term: "Healthcare costs", icon: "🏥" },
  { term: "Climate change", icon: "🌍" },
  { term: "Education policy", icon: "📚" },
  { term: "Housing crisis", icon: "🏠" },
  { term: "Gun control", icon: "🚨" },
  { term: "Social Security", icon: "👴" },
  { term: "Student loans", icon: "🎓" },
  { term: "Minimum wage", icon: "💼" },
];

async function getInterestForTopic(topic: string): Promise<number> {
  try {
    const results = await googleTrends.interestOverTime({
      keyword: topic,
      geo: "US",
      startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
    });

    const parsed = JSON.parse(results);
    const timelineData = parsed?.default?.timelineData || [];

    if (timelineData.length === 0) return 50;

    // Get average interest over the period
    const values = timelineData.map((d: { value: number[] }) => d.value[0]);
    const avg = values.reduce((a: number, b: number) => a + b, 0) / values.length;

    return Math.round(avg);
  } catch {
    return 50; // Default if we can't fetch
  }
}

export async function GET() {
  try {
    // Try to get real-time trends first
    let trends: TrendingTopic[] = [];

    // Attempt to fetch interest data for each civic topic
    const topicPromises = civicTopics.slice(0, 6).map(async (topic) => {
      const interest = await getInterestForTopic(topic.term);
      return {
        id: topic.term.toLowerCase().replace(/\s+/g, "-"),
        title: topic.term.split(" ")[0], // Use first word as title
        searchVolume: interest >= 70 ? "High" : interest >= 40 ? "Medium" : "Low",
        intensity: interest,
        icon: topic.icon,
        url: `https://trends.google.com/trends/explore?q=${encodeURIComponent(topic.term)}&geo=US&date=now%207-d`,
      };
    });

    const results = await Promise.allSettled(topicPromises);

    trends = results
      .filter((r): r is PromiseFulfilledResult<TrendingTopic> => r.status === "fulfilled")
      .map((r) => r.value)
      .sort((a, b) => b.intensity - a.intensity);

    // If we got results, return them
    if (trends.length >= 4) {
      return NextResponse.json({
        trends: trends.slice(0, 6),
        updated: new Date().toISOString(),
        source: "Google Trends",
      });
    }

    // Fallback to static data with reasonable estimates
    throw new Error("Not enough trend data");
  } catch (error) {
    console.error("Error fetching Google Trends:", error);

    // Return curated fallback data based on typical civic interest levels
    const fallback: TrendingTopic[] = [
      { id: "economy", title: "Economy", searchVolume: "High", intensity: 82, icon: "💰", url: "https://trends.google.com/trends/explore?q=economy%20inflation&geo=US" },
      { id: "immigration", title: "Immigration", searchVolume: "High", intensity: 78, icon: "🛂", url: "https://trends.google.com/trends/explore?q=immigration&geo=US" },
      { id: "healthcare", title: "Healthcare", searchVolume: "High", intensity: 71, icon: "🏥", url: "https://trends.google.com/trends/explore?q=healthcare%20costs&geo=US" },
      { id: "housing", title: "Housing", searchVolume: "Medium", intensity: 64, icon: "🏠", url: "https://trends.google.com/trends/explore?q=housing%20crisis&geo=US" },
      { id: "education", title: "Education", searchVolume: "Medium", intensity: 55, icon: "📚", url: "https://trends.google.com/trends/explore?q=education%20policy&geo=US" },
      { id: "climate", title: "Climate", searchVolume: "Medium", intensity: 48, icon: "🌍", url: "https://trends.google.com/trends/explore?q=climate%20change&geo=US" },
    ];

    return NextResponse.json({
      trends: fallback,
      updated: new Date().toISOString(),
      source: "Curated",
    });
  }
}
