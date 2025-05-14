export interface Role {
  id: number;
  created_at: string;
  updated_at: string;
  name: string;
  description: string;
  for_organization: boolean;
}

export interface IUser {
  id: string;
  created_at: string;
  updated_at: string;
  activated_at: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string;
  birthday: string | null;
  roles: Role[];
}
