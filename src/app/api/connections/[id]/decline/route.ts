import { NextResponse } from "next/server";
import { getCurrentAlbumLogUser } from "@/lib/auth/current-user";
import { getConnectionErrorResponse } from "@/lib/connections/connection-errors";
import { declineConnection } from "@/lib/repositories/connection-repository";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentAlbumLogUser();

  if (!user) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  try {
    await declineConnection((await params).id, user.id);

    return NextResponse.json({ ok: true });
  } catch (error) {
    const response = getConnectionErrorResponse(error);

    return NextResponse.json(response.body, { status: response.status });
  }
}
