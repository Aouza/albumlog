import { NextResponse } from "next/server";
import { getCurrentAlbumLogUser } from "@/lib/auth/current-user";
import { getConnectionErrorResponse } from "@/lib/connections/connection-errors";
import { createConnectionRequest, listConnections } from "@/lib/repositories/connection-repository";

export async function GET() {
  const user = await getCurrentAlbumLogUser();

  if (!user) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  return NextResponse.json(await listConnections(user.id));
}

export async function POST(request: Request) {
  const user = await getCurrentAlbumLogUser();

  if (!user) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { receiverId?: unknown } | null;

  if (typeof body?.receiverId !== "string") {
    return NextResponse.json(
      { error: "invalid_receiver", message: "Informe um usuario valido." },
      { status: 400 },
    );
  }

  try {
    const connection = await createConnectionRequest(user.id, body.receiverId);

    return NextResponse.json({ connection }, { status: 201 });
  } catch (error) {
    const response = getConnectionErrorResponse(error);

    return NextResponse.json(response.body, { status: response.status });
  }
}
