export type UserType = 'individu' | 'lembaga';

export interface IndividualProfile {
  full_name: string;
  gender: 'male' | 'female';
}

export interface InstitutionProfile {
  name: string;
}

export interface UserTypes {
  id: string;
  email: string;
  phone_number: string;
  user_type: UserType;
  province: string;
  city: string;
  district: string;
  sub_district: string;
  active: boolean;
  individual_profile?: IndividualProfile;
  institution_profile?: InstitutionProfile;
}

export interface UserWithRegion extends UserTypes {
  province_name: string;
  city_name: string;
  district_name: string;
  sub_district_name: string;
}
