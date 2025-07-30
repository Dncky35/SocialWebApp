export interface PublicAccount{
    id: string
    username: string;
    bio?: string;
    avatar_url?: string;
    is_following?: boolean;
    followers_count: number;
    following_count: number;
    created_at: string; // Assuming ISO 8601 string (datetime)
}

export interface PrivateAccount extends PublicAccount {
  email: string;
  full_name?: string;
  is_verified: boolean;
  updated_at: string;
}