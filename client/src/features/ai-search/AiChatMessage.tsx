import Link from "next/link";
import cn from "classnames";
import ListingCard from "@/features/listings/ListingCard";
import { IListing } from "@/types/listings";

export interface IChatTurn {
  role: "user" | "assistant";
  text: string;
  listings?: IListing[];
}

const AiChatMessage = ({ turn }: { turn: IChatTurn }) => {
  const isUser = turn.role === "user";

  return (
    <div className={cn("flex flex-col gap-3", isUser ? "items-end" : "items-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-lg px-4 py-2 text-sm sm:text-base",
          isUser
            ? "bg-black/[.8] text-white dark:bg-white/[.8] dark:text-black"
            : "bg-black/[.05] dark:bg-white/[.1]"
        )}
      >
        {turn.text}
      </div>
      {turn.listings && turn.listings.length > 0 && (
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {turn.listings.map((listing) => (
            <Link href={`/listings/${listing.id}`} key={listing.id}>
              <ListingCard listing={listing} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default AiChatMessage;
