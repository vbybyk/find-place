"use server";

import { connectToDatabase } from "../database";
import { revalidatePath } from "next/cache";
import Listing, { IListing } from "../database/models/listing";

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
