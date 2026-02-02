import { NextResponse } from "next/server";

interface CongressBill {
  congress: number;
  latestAction?: {
    actionDate: string;
    text: string;
  };
  number: string;
  title: string;
  type: string;
  url: string;
  originChamber: string;
}

interface CongressApiResponse {
  bills: CongressBill[];
}

// Map bill topics to user-friendly categories
function categorizeByTitle(title: string): { category: string; icon: string } {
  const titleLower = title.toLowerCase();

  if (titleLower.includes("appropriation") || titleLower.includes("funding") || titleLower.includes("budget")) {
    return { category: "Government Funding", icon: "💰" };
  }
  if (titleLower.includes("health") || titleLower.includes("medicare") || titleLower.includes("drug") || titleLower.includes("medical")) {
    return { category: "Healthcare", icon: "🏥" };
  }
  if (titleLower.includes("immigra") || titleLower.includes("border") || titleLower.includes("visa")) {
    return { category: "Immigration", icon: "🛂" };
  }
  if (titleLower.includes("climate") || titleLower.includes("energy") || titleLower.includes("environment") || titleLower.includes("emission")) {
    return { category: "Climate & Energy", icon: "🌍" };
  }
  if (titleLower.includes("education") || titleLower.includes("student") || titleLower.includes("school") || titleLower.includes("college")) {
    return { category: "Education", icon: "📚" };
  }
  if (titleLower.includes("veteran") || titleLower.includes("military") || titleLower.includes("defense") || titleLower.includes("armed forces")) {
    return { category: "Defense & Veterans", icon: "🎖️" };
  }
  if (titleLower.includes("tax") || titleLower.includes("revenue")) {
    return { category: "Taxes", icon: "📊" };
  }
  if (titleLower.includes("security") || titleLower.includes("cyber") || titleLower.includes("privacy")) {
    return { category: "Security & Privacy", icon: "🔒" };
  }
  if (titleLower.includes("housing") || titleLower.includes("rent") || titleLower.includes("mortgage")) {
    return { category: "Housing", icon: "🏠" };
  }
  if (titleLower.includes("infrastructure") || titleLower.includes("transport") || titleLower.includes("highway") || titleLower.includes("rail")) {
    return { category: "Infrastructure", icon: "🚧" };
  }
  if (titleLower.includes("social security") || titleLower.includes("retirement") || titleLower.includes("pension")) {
    return { category: "Social Security", icon: "👴" };
  }
  if (titleLower.includes("job") || titleLower.includes("employment") || titleLower.includes("labor") || titleLower.includes("worker") || titleLower.includes("wage")) {
    return { category: "Jobs & Labor", icon: "💼" };
  }

  return { category: "Legislation", icon: "📜" };
}

export async function GET() {
  const apiKey = process.env.CONGRESS_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Congress API key not configured" },
      { status: 500 }
    );
  }

  try {
    // Fetch recent bills with activity from both chambers
    const response = await fetch(
      `https://api.congress.gov/v3/bill?limit=50&sort=updateDate+desc&api_key=${apiKey}`,
      {
        headers: {
          Accept: "application/json",
        },
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    );

    if (!response.ok) {
      throw new Error(`Congress API error: ${response.status}`);
    }

    const data: CongressApiResponse = await response.json();

    // Group bills by category and count activity
    const categoryActivity: Record<string, { count: number; bills: string[]; icon: string; recentAction: string }> = {};

    for (const bill of data.bills) {
      const { category, icon } = categorizeByTitle(bill.title);

      if (!categoryActivity[category]) {
        categoryActivity[category] = { count: 0, bills: [], icon, recentAction: "" };
      }

      categoryActivity[category].count++;
      categoryActivity[category].bills.push(`${bill.type}.${bill.number}`);

      // Keep the most recent action text
      if (bill.latestAction?.text && !categoryActivity[category].recentAction) {
        categoryActivity[category].recentAction = bill.latestAction.text;
      }
    }

    // Convert to array and sort by activity count
    // Filter out the generic "Legislation" catch-all category
    const trending = Object.entries(categoryActivity)
      .filter(([category]) => category !== "Legislation")
      .map(([category, data]) => ({
        id: category.toLowerCase().replace(/\s+/g, "-"),
        title: category,
        subtitle: data.recentAction.length > 60
          ? data.recentAction.substring(0, 60) + "..."
          : data.recentAction,
        intensity: Math.min(100, Math.round((data.count / 10) * 100)), // Normalize to 0-100
        icon: data.icon,
        billCount: data.count,
        url: `https://www.congress.gov/search?q=${encodeURIComponent(category)}`,
      }))
      .sort((a, b) => b.billCount - a.billCount)
      .slice(0, 6); // Top 6

    return NextResponse.json({ trending, updated: new Date().toISOString() });
  } catch (error) {
    console.error("Error fetching from Congress API:", error);
    return NextResponse.json(
      { error: "Failed to fetch trending issues" },
      { status: 500 }
    );
  }
}
