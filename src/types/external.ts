export interface IProvince {
  code: number;
  codename: string;
  districts: IDistrict[];
  division_type: string;
  name: string;
  phone_code: number;
}

export interface IDistrict {
  code: number;
  codename: string;
  division_type: string;
  name: string;
  province_code: number;
  wards: IWard[];
}

export interface IWard {
  code: number;
  codename: string;
  district_code: number;
  division_type: string;
  name: string;
}
