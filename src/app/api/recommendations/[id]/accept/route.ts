import { NextResponse } from "next/server";
import { getCurrentAlbumLogUser } from "@/lib/auth/current-user";
import { getRecommendationErrorResponse } from "@/lib/recommendations/recommendation-errors";
import { acceptRecommendation } from "@/lib/repositories/recommendation-repository";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentAlbumLogUser();

  if (!user) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  try {
    await acceptRecommendation((await params).id, user.id);

    return NextResponse.json({ ok: true });
  } catch (error) {
    const response = getRecommendationErrorResponse(error);

    return NextResponse.json(response.body, { status: response.status });
  }
}
