import Link from "next/link";
import { getListings } from "@/lib/actions/listings";
import ListingCard from "@/components/common/listingCard";

const ListingsPage = async () => {
  const listings = await getListings();

  return (
    <div>
      <h1>Listings</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {listings?.map((listing) => (
          <Link href={`/listings/${listing._id}`} key={listing._id}>
            <ListingCard listing={listing} />
          </Link>
        ))}
      </div>
    </div>
  );
};
export default ListingsPage;
