export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  createdAt: string;
};

export type Follow = {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
};
