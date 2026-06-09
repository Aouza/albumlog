export type AlbumSocialConnection = {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string;
};

export type AlbumSocialContext = {
  connections: AlbumSocialConnection[];
  total: number;
};

export type AlbumSocialContextPayload = {
  albums: Record<string, AlbumSocialContext>;
};
