import { NextRequest, NextResponse } from "next/server";
import { getCurrentAlbumLogUser } from "@/lib/auth/current-user";
import { searchConnectableUsers } from "@/lib/repositories/connection-repository";

export async function GET(request: NextRequest) {
  const user = await getCurrentAlbumLogUser();

  if (!user) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  const query = request.nextUrl.searchParams.get("q") ?? "";

  return NextResponse.json({ users: await searchConnectableUsers(user.id, query) });
}
