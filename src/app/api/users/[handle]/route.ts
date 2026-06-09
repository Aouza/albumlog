import { NextResponse } from "next/server";
import { getCurrentAlbumLogUser } from "@/lib/auth/current-user";
import { getUserProfileByHandle } from "@/lib/repositories/user-profile-repository";

export async function GET(_request: Request, { params }: { params: Promise<{ handle: string }> }) {
  const currentUser = await getCurrentAlbumLogUser();
  const profile = await getUserProfileByHandle((await params).handle, currentUser?.id ?? null);

  if (!profile) {
    return NextResponse.json({ error: "user_not_found" }, { status: 404 });
  }

  return NextResponse.json(profile);
}
