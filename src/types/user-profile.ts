import type { Album, UserAlbum } from "@/types/album";
import type { ProfileRelationship } from "@/lib/users/profile-relationship";

export type PublicUserProfile = {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string;
};

export type AlbumInCommon = {
  album: Album;
  currentUserAlbum: UserAlbum;
  profileUserAlbum: UserAlbum;
};

export type UserProfilePayload = {
  user: PublicUserProfile;
  relationship: ProfileRelationship;
  albumsInCommon: AlbumInCommon[];
  albumsInCommonTotal: number;
};
