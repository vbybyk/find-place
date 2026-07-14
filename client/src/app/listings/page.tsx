import Link from "next/link";
import { getListings } from "@/lib/actions/listings";
import ListingCard from "@/features/listings/ListingCard";
import FilterSelect from "@/features/search/FilterSelect";
import { ListingTypes, PropertyTypes } from "@/constants/listings";

interface ISearchParams {
  houseType?: string;
  type?: string;
  city?: string;
  adminName1?: string;
  userId?: string;
}

const ListingsPage = async ({ searchParams }: { searchParams: ISearchParams }) => {
  const { houseType, type, city, adminName1, userId } = await searchParams;

  const listings = await getListings({
    ...(houseType && { houseType }),
    ...(type && { type }),
    ...(city && { "location.city.label": city }),
    ...(adminName1 && { "location.city.adminName1": adminName1 }),
    ...(userId && { userId: Number(userId) }),
  });

  const query = userId ? `?userId=${userId}` : "";

  return (
    <div className="p-6">
      <div className="mb-4 flex gap-4">
        <FilterSelect options={ListingTypes} queryKey="type" placeholder="Select Listings Type" />
        <FilterSelect options={PropertyTypes} queryKey="houseType" placeholder="Select House Type" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {listings?.map((listing) => (
          <Link href={`/listings/${listing._id}${query}`} key={listing._id}>
            <ListingCard listing={listing} />
          </Link>
        ))}
      </div>
    </div>
  );
};
export default ListingsPage;
