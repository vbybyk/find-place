export interface ICityOption {
  id: number;
  label: string;
  adminName1?: string;
}

export interface IListing {
  id: number;
  user_id: number;
  title: string;
  description: string;
  price: number | null;
  type: number;
  house_type: number;
  country: string | null;
  city_id: number | null;
  city_label: string | null;
  admin_name1: string | null;
  address_line1: string | null;
  address_line2: string | null;
  latitude: number | null;
  longitude: number | null;
  rooms_number: number | null;
  floors_number: number | null;
  floor: number | null;
  area_total: number | null;
  images: string[] | null;
  created_at: string;
}

export interface IListingPayload {
  user_id: number;
  title: string;
  description: string;
  type: number;
  house_type: number;
  price?: number | null;
  country?: string | null;
  city_id?: number | null;
  city_label?: string | null;
  admin_name1?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  rooms_number?: number | null;
  images?: string[] | null;
}

export interface IListingFormValues {
  userId: number;
  title: string;
  description: string;
  price: number;
  roomsNumber: number;
  type: number;
  houseType: number;
  images: string[];
  location: {
    country: string;
    city: ICityOption | null;
    addressLine1: string;
    addressLine2: string;
  };
}
