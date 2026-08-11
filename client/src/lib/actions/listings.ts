"use server";

import { revalidatePath } from "next/cache";
import { IListing, IListingPayload } from "@/types/listings";
import { uploadBufferToCloudinary } from "@/lib/cloudinary";

// FastAPI backend (business logic + data).
const API_URL = process.env.API_URL;

const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // keep in sync with FileUploader client check
const ACCEPTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/jpg"]);

interface IListingsQuery {
  type?: string;
  houseType?: string;
  userId?: string;
  city?: string;
}

export const getListings = async (query: IListingsQuery = {}): Promise<IListing[]> => {
  const params = new URLSearchParams();
  if (query.type) params.set("type", query.type);
  if (query.houseType) params.set("house_type", query.houseType);
  if (query.userId) params.set("user_id", query.userId);
  if (query.city) params.set("city", query.city);

  try {
    const res = await fetch(`${API_URL}/listings?${params.toString()}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to fetch listings: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error("Error while getting listings", error);
    return [];
  }
};

export const getListingById = async (id: string): Promise<IListing | null> => {
  try {
    const res = await fetch(`${API_URL}/listings/${id}`, { cache: "no-store" });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Failed to fetch listing: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error("Error while getting listing by id", error);
    return null;
  }
};

export const createListing = async (listing: IListingPayload, path: string) => {
  try {
    const res = await fetch(`${API_URL}/listings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(listing),
    });
    if (!res.ok) throw new Error(`Failed to create listing: ${res.status}`);
    const data = await res.json();
    revalidatePath(path);
    return data;
  } catch (error) {
    console.error("Error while creating listing", error);
  }
};

export const updateListing = async (id: number, listing: Partial<IListingPayload>, path: string) => {
  try {
    const res = await fetch(`${API_URL}/listings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(listing),
    });
    if (!res.ok) throw new Error(`Failed to update listing: ${res.status}`);
    const data = await res.json();
    revalidatePath(path);
    return data;
  } catch (error) {
    console.error("Error while updating listing", error);
  }
};

export const uploadImage = async (formData: FormData): Promise<string | undefined> => {
  try {
    const file = formData.get("file");
    if (!(file instanceof Blob) || file.size === 0) {
      throw new Error("File not found");
    }
    if (file.size > MAX_IMAGE_BYTES) {
      throw new Error("Each photo must be 10 MB or smaller");
    }
    if (file.type && !ACCEPTED_IMAGE_TYPES.has(file.type)) {
      throw new Error("Only jpg and png files are allowed");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    return await uploadBufferToCloudinary(buffer, "listings");
  } catch (error) {
    console.error("Error while uploading image", error);
    throw error;
  }
};
