import { FunctionDeclaration } from "@google/generative-ai";
import {
  searchListingsDeclaration,
  executeSearchListings,
} from "./searchListings";
import {
  getListingDeclaration,
  executeGetListing,
} from "./getListing";
import {
  topListingsDeclaration,
  executeTopListings,
} from "./topListings";
import {
  topUsersDeclaration,
  executeTopUsers,
} from "./topUsers";

export const toolDeclarations: FunctionDeclaration[] = [
  searchListingsDeclaration as FunctionDeclaration,
  getListingDeclaration as FunctionDeclaration,
  topListingsDeclaration as FunctionDeclaration,
  topUsersDeclaration as FunctionDeclaration,
];

export type ToolName =
  | "search_listings"
  | "get_listing"
  | "get_top_rated_listings"
  | "get_top_rated_users";

export async function executeTool(
  name: ToolName,
  args: Record<string, unknown>
): Promise<unknown> {
  switch (name) {
    case "search_listings":
      return executeSearchListings(
        args as Parameters<typeof executeSearchListings>[0]
      );
    case "get_listing":
      return executeGetListing(
        args as Parameters<typeof executeGetListing>[0]
      );
    case "get_top_rated_listings":
      return executeTopListings(
        args as Parameters<typeof executeTopListings>[0]
      );
    case "get_top_rated_users":
      return executeTopUsers(
        args as Parameters<typeof executeTopUsers>[0]
      );
    default:
      return { error: `Unknown tool: ${name}` };
  }
}
