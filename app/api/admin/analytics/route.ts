import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/index";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ success: false, message: "Not authorized" }, { status: 401 });
    }

    const db = await getDb();
    const [donations, volunteers] = await Promise.all([
      db.getDonations(),
      db.getVolunteers(),
    ]);

    const statusCounts = { pending: 0, approved: 0, rejected: 0, distributed: 0 };
    donations.forEach((d) => {
      const status = d.status as keyof typeof statusCounts;
      if (statusCounts[status] !== undefined) {
        statusCounts[status]++;
      }
    });

    const analytics = {
      overview: {
        totalDonations: donations.length,
        totalUsers: 0, // Implement user count if needed
        totalVolunteers: volunteers.length,
        recentDonations: donations.filter((d) => {
          const created = new Date(d.created_at || Date.now());
          return created > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        }).length,
        growthRate: 0,
      },
      donationsByStatus: statusCounts,
      impactMetrics: {
        livesHelped: donations.length * 3,
        co2Saved: donations.length * 2,
        wasteReduced: donations.length * 0.5,
        uniqueMedicines: new Set(donations.map((d) => d.medicine_name)).size,
      },
    };

    return NextResponse.json({ success: true, data: analytics });
  } catch (error: any) {
    console.error("Analytics API Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
