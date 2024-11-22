import { IListing } from "@/lib/database/models/listing";
import Image from "next/image";

const ListingCard = ({ listing }: { listing: IListing }) => {
  return (
    <div
      className="flex flex-col gap-4 p-4 border border-solid border-black/[.08] dark:border-white/[.145] rounded-md hover:shadow-md overflow-hidden"
      style={{ height: "420px" }}
    >
      <div className="relative h-56">
        <Image src={listing?.images?.[0] || ""} alt={listing.title} layout="fill" objectFit="cover" />
      </div>
      <h3 className="text-lg font-semibold">{listing.price}₱</h3>
      <p className="text-sm text-gray-500">{listing.title}</p>
      <p className="text-sm text-gray-500">Rooms: {listing.roomsNumber}</p>
      <p className="text-sm text-gray-500">
        {listing.location?.city?.label}, {listing.location?.addressLine1}, {listing.location?.addressLine2}
      </p>
    </div>
  );
};

export default ListingCard;
