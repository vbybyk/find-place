import Image from "next/image";
import { IListing } from "@/lib/database/models/listing";

const ListingDetails = ({ listing }: { listing: IListing }) => {
  return (
    <div className="px-4">
      <div className="grid gap-4 grid-cols-4 grid-rows-2 mb-4">
        {listing?.images?.map((image, index) => (
          <div key={image} className={`relative ${index === 0 ? "col-span-2 row-span-2 h-96" : ""}`}>
            <Image
              key={image}
              src={image}
              alt={listing.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        ))}
      </div>
      <h1 className="text-xl font-semibold">{listing?.title}</h1>
      <h2 className="text-lg font-semibold">{listing?.price}₱</h2>
      <p>
        {listing?.location?.city?.label}, {listing?.location?.addressLine1}, {listing?.location?.addressLine2}
      </p>
      <p>Rooms: {listing?.roomsNumber}</p>
      <h3 className="text-base font-semibold mt-4">Description</h3>
      <p>{listing?.description}</p>
    </div>
  );
};

export default ListingDetails;
