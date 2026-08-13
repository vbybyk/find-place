import { getListingById } from "@/lib/actions/listings";
import { notFound } from "next/navigation";
import EditListingForm from "@/features/listings/forms/EditListingForm";
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
      {userId ? (
        <div className="mx-auto max-w-2xl">
          <h1 className="mb-6 text-lg font-semibold">{listing.title}</h1>
          <EditListingForm listing={listing} />
        </div>
      ) : (
        <ListingDetails listing={listing} />
      )}
    </div>
  );
};
export default Listing;
