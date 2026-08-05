import { getListingById } from "@/lib/actions/listings";
import { notFound } from "next/navigation";
import CreateListingForm from "@/features/listings/forms/CreateListingForm";
import ListingDetails from "@/features/listings/ListingDetails";

const Listing = async ({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ userId: string }>;
}) => {
  const { id } = await params;
  const { userId } = await searchParams;
  const listing = await getListingById(id);

  if (!listing) {
    notFound();
  }

  return (
    <div className="py-8">
      {userId && <h1 className="text-lg font-semibold">{listing.title}</h1>}
      {userId ? <CreateListingForm listing={listing} type="edit" /> : <ListingDetails listing={listing} />}
    </div>
  );
};
export default Listing;
