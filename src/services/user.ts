/**
 * User Service
 * Service untuk manage user profile dan data
 */

import { fetchWithAuth } from '@/lib/api/client';

// === Type Definitions ===

export interface IndividualProfile {
  full_name: string;
  gender: 'male' | 'female';

}

export interface InstitutionProfile {
  name: string;
 
  institution_type?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  phone_number: string | null;
  user_type: 'individu' | 'lembaga' | null;
  province: string | null;
  city: string | null;
  district: string | null;
  sub_district: string | null;
  is_profile_complete: boolean;
  is_asset_buildings_completed: boolean;
  is_asset_vehicles_completed: boolean;
  
  // Nested profiles based on user_type
  individual_profile?: IndividualProfile;
  institution_profile?: InstitutionProfile;
}

export interface UpdateProfilePayload {
  name?: string;
  email?: string;
  phone_number?: string;
  user_type?: 'individu' | 'lembaga';
  province?: string;
  city?: string;
  district?: string;
  sub_district?: string;
  postal_code?: string;
  address?: string;
  
  is_profile_complete?: boolean;
  is_asset_buildings_completed?: boolean;
  is_asset_vehicles_completed?: boolean;
  // Individu-specific fields
  gender?: 'male' | 'female';
  // Lembaga-specific fields
  institution_type?: string;
  // Nested profiles (optional) - allow sending nested profile objects
  individual_profile?: {
    full_name?: string;
    gender?: 'male' | 'female';
    
  };
  institution_profile?: {
    name?: string;
  };
}

// === User Service ===

export const userService = {
  /**
   * Get current user profile
   * @param token - Authentication token
   * @returns User profile data
   */
  async getMe(token: string): Promise<UserProfile> {
    return fetchWithAuth<UserProfile>('/user/me', token);
  },

  /**
   * Create user profile (first time complete profile)
   * @param payload - Profile data to create
   * @param token - Authentication token
   * @returns Created user profile
   */
    async createProfile(payload: UpdateProfilePayload, token: string): Promise<UserProfile> {
    // Use /user/me to update the current authenticated user's profile. Some
    // backend deployments expect PUT on /user/me rather than /user/ for
    // self-updates; use this endpoint to avoid 403s caused by admin-only
    // /user/ endpoints.
    return fetchWithAuth<UserProfile>('/user/', token, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  /** 
   * Update user profile (edit existing profile)
   * @param payload - Profile data to update
   * @param token - Authentication token
   * @returns Updated user profile
   */
    async updateProfile(payload: UpdateProfilePayload, token: string): Promise<UserProfile> {
    // Mirror createProfile: update current user's profile via /user/me
    return fetchWithAuth<UserProfile>('/user/', token, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Check if user profile is complete
   * @param user - User profile data
   * @returns true if profile is complete
   */
  isProfileComplete(user: UserProfile): boolean {
    return !!(
      user.phone_number &&
      user.user_type &&
      user.province &&
      user.city &&
      user.district &&
      user.sub_district
      // Note: 'active' is for soft-delete, not profile completion
    );
  },

  /**
   * Check if user has completed building assets
   * @param user - User profile data
   * @returns true if building assets are completed
   */
  isBuildingAssetsComplete(user: UserProfile): boolean {
    return user.is_asset_buildings_completed;
  },

  /**
   * Check if user has completed vehicle assets
   * @param user - User profile data
   * @returns true if vehicle assets are completed
   */
  isVehicleAssetsComplete(user: UserProfile): boolean {
    return user.is_asset_vehicles_completed;
  },

  /**
   * Check if user has completed all onboarding steps
   * (profile + buildings + vehicles)
   * @param user - User profile data
   * @returns true if all onboarding is complete
   */
  isOnboardingComplete(user: UserProfile): boolean {
    return (
      user.is_profile_complete &&
      user.is_asset_buildings_completed &&
      user.is_asset_vehicles_completed
    );
  },
};
