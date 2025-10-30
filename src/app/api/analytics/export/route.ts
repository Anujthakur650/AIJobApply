import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export const GET = async (request: Request) => {
  try {
    const { userId } = await requireUser();
    const url = new URL(request.url);
    const format = url.searchParams.get("format") ?? "csv";

    const applications = await prisma.jobApplication.findMany({
      where: { userId },
      include: {
        jobPosting: true,
      },
      orderBy: { createdAt: "desc" },
    });

    if (format === "csv") {
      const header = [
        "Application ID",
        "Job Title",
        "Company",
        "Status",
        "Created At",
        "Submitted At",
      ];

      const rows = applications.map((application) => [
        application.id,
        application.jobPosting?.title ?? "",
        application.jobPosting?.company ?? "",
        application.status,
        application.createdAt.toISOString(),
        application.appliedAt ? application.appliedAt.toISOString() : "",
      ]);

      const csv = [header, ...rows].map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n");

      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="ai-job-apply-analytics.csv"`,
        },
      });
    }

    return NextResponse.json({ error: "Unsupported format" }, { status: 400 });
  } catch (error) {
    if ((error as Error).message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    console.error("Failed to export analytics", error);
    return NextResponse.json({ error: "Unable to export analytics" }, { status: 500 });
  }
};
