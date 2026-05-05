export interface UserProfile {
  id: string;
  zenPoints: number;
}

export interface UserProfileData {
  getUserProfile: UserProfile;
}
