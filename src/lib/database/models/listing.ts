import { Document, Schema, model, models } from "mongoose";

export interface IListing extends Document {
  _id: string;
  title: string;
  description: string;
  price?: number;
  type: number;
  houseType: number;
  location?: {
    country: string;
    city: string;
    district: string;
    street: string;
  };
  roomsNumber?: number;
  floorsNumber?: number;
  floor?: number;
  areaTotal?: number;
  images?: string[];
}

const listingSchema = new Schema<IListing>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: false },
  type: { type: Number, required: true },
  houseType: { type: Number, required: true },
  location: {
    country: { type: String, required: false },
    city: { type: String, required: false },
    district: { type: String, required: false },
    street: { type: String, required: false },
  },
  roomsNumber: { type: Number, required: false },
  floorsNumber: { type: Number, required: false },
  floor: { type: Number, required: false },
  areaTotal: { type: Number, required: false },
  images: { type: [String], required: false },
});

const Listing = models.Listing || model<IListing>("Listing", listingSchema);

export default Listing;
