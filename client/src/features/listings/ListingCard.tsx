import { IListing } from "@/types/listings";
import Image from "next/image";

const ListingCard = ({ listing }: { listing: IListing }) => {
  return (
    <div
      className="flex flex-col gap-4 p-4 border border-solid border-black/[.08] dark:border-white/[.145] rounded-md hover:shadow-md overflow-hidden"
      style={{ height: "420px" }}
    >
      <div className="relative h-56">
        <Image
          src={listing?.images?.[0] || ""}
          alt={listing.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <h3 className="text-lg font-semibold">{listing.price}₱</h3>
      <p className="text-sm text-gray-500">{listing.title}</p>
      <p className="text-sm text-gray-500">Rooms: {listing.rooms_number}</p>
      <p className="text-sm text-gray-500">
        {listing.city_label}, {listing.address_line1}, {listing.address_line2}
      </p>
    </div>
  );
};

export default ListingCard;
