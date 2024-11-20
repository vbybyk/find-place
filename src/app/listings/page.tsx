import Link from "next/link";
import { getListings } from "@/lib/actions/listings";
import ListingCard from "@/components/common/listingCard";
import FilterSelect from "@/components/filterSelect";

interface ISearchParams {
  houseType?: string;
  type?: string;
  city?: string;
  adminName1?: string;
}

const ListingTypes = [
  { id: 1, name: "Rent" },
  { id: 2, name: "Sale" },
];

const PropertyTypes = [
  { id: 1, name: "Apartment" },
  { id: 2, name: "House" },
];

const ListingsPage = async ({ searchParams }: { searchParams: ISearchParams }) => {
  const houseType = searchParams?.houseType;
  const type = searchParams?.type;
  const city = searchParams?.city;
  const adminName1 = searchParams?.adminName1;

  const listings = await getListings({
    ...(houseType && { houseType }),
    ...(type && { type }),
    ...(city && { "location.city.label": city }),
    ...(adminName1 && { "location.city.adminName1": adminName1 }),
  });

  return (
    <div className="p-6">
      <div className="mb-4 flex gap-4">
        <FilterSelect options={ListingTypes} queryKey="type" placeholder="Select Listings Type" />
        <FilterSelect options={PropertyTypes} queryKey="houseType" placeholder="Select House Type" />
      </div>
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
