export interface ICityOption {
  id: number;
  label: string;
  adminName1?: string;
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
