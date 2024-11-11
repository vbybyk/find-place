"use server";

import { connectToDatabase } from "../database";
import { revalidatePath } from "next/cache";
import Listing, { IListing } from "../database/models/listing";
import { formatGeoCities } from "../utils";

const BACKEND_URL = process.env.BACKEND_URL;

export const getListings = async () => {
  try {
    await connectToDatabase();

    const listings = await Listing.find();
    return listings;
  } catch (error) {
    console.error("Error while getting listings", error);
  }
};

export const getListingById = async (id: string) => {
  try {
    await connectToDatabase();

    const listing = await Listing.findById(id);
    return JSON.parse(JSON.stringify(listing));
  } catch (error) {
    console.error("Error while getting listing by id", error);
  }
};

export const createListing = async (listing: Partial<IListing>, path: string) => {
  try {
    await connectToDatabase();

    const newListing = await Listing.create(listing);
    revalidatePath(path);

    return JSON.parse(JSON.stringify(newListing));
  } catch (error) {
    console.error("Error while creating listing", error);
  }
};

export const uploadImage = async (formData: FormData) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/listings/upload-image`, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
      },
    });

    if (response.ok) {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        return data;
      } else {
        const text = await response.text();
        return text;
      }
    }
  } catch (error) {
    console.error("Error while uploading image", error);
  }
};

export const searchListingCity = async (search: string, country: string, maxRows: string) => {
  try {
    const response = await fetch(
      `${BACKEND_URL}/api/listings?maxRows=${maxRows}&country=${country}&name_startsWith=${search}`
    );
    if (response.ok) {
      const data = await response.json();
      console.log("data", data);
      return formatGeoCities(data);
    }
  } catch (error) {
    console.error("Error while searching city", error);
  }
};
