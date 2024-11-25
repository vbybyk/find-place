import { getListingById } from "@/lib/actions/listings";
import CreateListingForm from "@/app/forms/createListingForm";
import ListingDetails from "@/components/listingDetails";

const Listing = async ({ params, searchParams }: { params: { id: string }; searchParams: { userId: string } }) => {
  const { id } = params;
  const { userId } = searchParams;
  const listing = await getListingById(id);

  return (
    <div className="p-8">
      {userId && <h1 className="text-lg font-semibold">{listing?.title}</h1>}
      {userId ? <CreateListingForm listing={listing} type="edit" /> : <ListingDetails listing={listing} />}
    </div>
  );
};
export default Listing;
