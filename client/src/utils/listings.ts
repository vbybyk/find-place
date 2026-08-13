import { uploadImage } from "@/lib/actions/listings";
import { ListingTypes, PropertyTypes } from "@/constants/listings";
import {
  IListing,
  IListingFormImage,
  IListingFormValues,
  IListingPayload,
  remoteImagesToForm,
} from "@/types/listings";

export const emptyListingFormValues = (): IListingFormValues => ({
  userId: 0,
  title: "",
  description: "",
  price: 0,
  discount: 0,
  type: 0,
  houseType: 0,
  furnished: 0,
  roomsNumber: 0,
  bathrooms: 0,
  parking: 0,
  areaTotal: 0,
  amenities: [],
  images: [],
  location: {
    placeId: null,
    country: "PH",
    city: "",
    admin1: "",
    barangay: "",
    postalCode: "",
    addressLine1: "",
    addressLine2: "",
    latitude: null,
    longitude: null,
  },
});

export const listingToFormValues = (listing: IListing): IListingFormValues => ({
  userId: listing.user_id,
  title: listing.title,
  description: listing.description,
  price: listing.price || 0,
  discount: listing.discount || 0,
  type: ListingTypes.find((t) => t.id === listing.type)?.id || 0,
  houseType: PropertyTypes.find((t) => t.id === listing.house_type)?.id || 0,
  furnished: listing.furnished || 0,
  roomsNumber: listing.rooms_number || 0,
  bathrooms: listing.bathrooms || 0,
  parking: listing.parking || 0,
  areaTotal: listing.area_total || 0,
  amenities: listing.amenities ?? [],
  images: remoteImagesToForm(listing.images),
  location: {
    placeId: listing.place_id ?? null,
    country: listing.country ?? "PH",
    city: listing.city_label ?? "",
    admin1: listing.admin_name1 ?? "",
    barangay: listing.barangay ?? "",
    postalCode: listing.postal_code ?? "",
    addressLine1: listing.address_line1 ?? "",
    addressLine2: listing.address_line2 ?? "",
    latitude: listing.latitude ?? null,
    longitude: listing.longitude ?? null,
  },
});

export const formValuesToPayload = (data: IListingFormValues, imageUrls: string[]): IListingPayload => ({
  user_id: 1,
  title: data.title,
  description: data.description,
  type: Number(data.type),
  house_type: Number(data.houseType),
  price: data.price ? Number(data.price) : null,
  discount: data.discount ? Number(data.discount) : null,
  furnished: data.furnished ? Number(data.furnished) : null,
  rooms_number: Number(data.roomsNumber) || null,
  bathrooms: Number(data.bathrooms) || null,
  parking: Number(data.parking) || null,
  area_total: data.areaTotal ? Number(data.areaTotal) : null,
  amenities: data.amenities ?? [],
  country: data.location.country || null,
  place_id: data.location.placeId,
  city_label: data.location.city || null,
  admin_name1: data.location.admin1 || null,
  barangay: data.location.barangay || null,
  postal_code: data.location.postalCode || null,
  address_line1: data.location.addressLine1 || null,
  address_line2: data.location.addressLine2 || null,
  latitude: data.location.latitude,
  longitude: data.location.longitude,
  images: imageUrls,
});

export const resolveListingImageUrls = async (images: IListingFormImage[]): Promise<string[]> => {
  const urls: string[] = [];
  for (const image of images) {
    if (image.kind === "remote") {
      urls.push(image.url);
      continue;
    }
    const formData = new FormData();
    formData.append("file", image.file);
    const url = await uploadImage(formData);
    if (!url) throw new Error("Failed to upload image");
    urls.push(url);
  }
  return urls;
};
