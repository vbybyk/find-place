import { IListing } from "@/types/listings";
import ListingGallery from "@/features/listings/ListingGallery";

const ListingDetails = ({ listing }: { listing: IListing }) => {
  return (
    <div>
      <ListingGallery images={listing?.images} title={listing?.title} />
      <div className="mt-6">
        <h1 className="text-2xl font-semibold">{listing?.title}</h1>
        <h2 className="text-lg font-semibold">{listing?.price}₱</h2>
        <p className="text-gray-600">
          {listing?.city_label}, {listing?.address_line1}, {listing?.address_line2}
        </p>
        <p className="mt-1">Rooms: {listing?.rooms_number}</p>
        <h3 className="mt-4 text-base font-semibold">Description</h3>
        <p>{listing?.description}</p>
      </div>
    </div>
  );
};

export default ListingDetails;
