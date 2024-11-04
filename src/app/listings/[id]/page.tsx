import { getListingById } from "@/lib/actions/listings";
import CreateListingForm from "@/app/forms/createListingForm";

const Listing = async ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const listing = await getListingById(id);

  return (
    <div className="p-10">
      <h1 className="text-lg font-semibold">{listing?.title}</h1>
      <CreateListingForm listing={listing} />
    </div>
  );
};
export default Listing;
