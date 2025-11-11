export interface Province {
  Code: string;
  Name: string;
}

export interface Regency {
  Code: string;
  Name: string;
  ProvinceCode: string;
}

export interface District {
  Code: string;
  Name: string;
  RegencyCode: string;
}

export interface Village {
  Code: string;
  Name: string;
  DistrictCode: string;
}
