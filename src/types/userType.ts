export type UserType = 'individu' | 'lembaga';

export interface UserTypes {
  user_id: string;
  name: string;
  user_type: UserType;
  email: string;
  phone_number: string;
  address: string;
  is_active: boolean;
}

export interface UserFilters {
  user_type?: 'individu' | 'lembaga' | 'semua';
  search?: string;
  page?: number;
  per_page?: number;
}

export interface UserPagination {
  current_page: number;
  per_page: number;
  total_pages: number;
  total_items: number;
  has_previous: boolean;
  has_next: boolean;
  first_page: number;
  last_page: number;
}

export interface UserLinks {
  self: string;
  first: string;
  last: string;
  next: string | null;
  prev: string | null;
}

export interface UserListResponse {
  reqId: string;
  meta: {
    success: boolean;
    message: string;
  };
  data: UserTypes[];
  pagination: UserPagination;
  links: UserLinks;
}
