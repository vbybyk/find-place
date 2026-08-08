import { IListing } from "@/types/listings";
import { Amenities, FurnishedTypes } from "@/constants/listings";
import ListingGallery from "@/features/listings/ListingGallery";

const ListingDetails = ({ listing }: { listing: IListing }) => {
  const price = listing?.price;
  const discount = listing?.discount || 0;
  const finalPrice = price != null && discount ? Math.round(price * (1 - discount / 100)) : price;

  const furnishedLabel = FurnishedTypes.find((f) => f.id === listing?.furnished)?.name;
  const amenityLabel = (key: string) => Amenities.find((a) => a.key === key)?.name ?? key;

  const facts = [
    listing?.rooms_number != null && `${listing.rooms_number} bedrooms`,
    listing?.bathrooms != null && `${listing.bathrooms} bathrooms`,
    listing?.parking != null && `${listing.parking} parking`,
    listing?.area_total != null && `${listing.area_total} m²`,
    furnishedLabel,
  ].filter(Boolean);

  return (
    <div>
      <ListingGallery images={listing?.images} title={listing?.title} />
      <div className="mt-6">
        <h1 className="text-2xl font-semibold">{listing?.title}</h1>

        {discount ? (
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-semibold">{finalPrice}₱</span>
            <span className="text-gray-400 line-through">{price}₱</span>
            <span className="text-sm font-medium text-green-600">−{discount}%</span>
          </div>
        ) : (
          <h2 className="text-lg font-semibold">{price}₱</h2>
        )}

        <p className="mt-1 text-gray-600">
          {listing?.city_label}, {listing?.address_line1}, {listing?.address_line2}
        </p>

        {facts.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-x-2 gap-y-1 text-sm text-gray-700">
            {facts.map((f, i) => (
              <span key={i}>
                {i > 0 && <span className="mr-2 text-gray-300">·</span>}
                {f}
              </span>
            ))}
          </div>
        )}

        {listing?.amenities?.length ? (
          <div className="mt-4">
            <h3 className="text-base font-semibold">Amenities</h3>
            <ul className="mt-2 flex flex-wrap gap-2">
              {listing.amenities.map((key) => (
                <li key={key} className="rounded-full border border-gray-200 px-3 py-1 text-sm text-gray-700">
                  {amenityLabel(key)}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <h3 className="mt-4 text-base font-semibold">Description</h3>
        <p>{listing?.description}</p>
      </div>
    </div>
  );
};

export default ListingDetails;
