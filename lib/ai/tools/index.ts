import { FunctionDeclaration } from "@google/generative-ai";
import {
  searchListingsDeclaration,
  executeSearchListings,
} from "./searchListings";
import {
  getListingDeclaration,
  executeGetListing,
} from "./getListing";

export const toolDeclarations: FunctionDeclaration[] = [
  searchListingsDeclaration as FunctionDeclaration,
  getListingDeclaration as FunctionDeclaration,
];

export type ToolName = "search_listings" | "get_listing";

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
    default:
      return { error: `Unknown tool: ${name}` };
  }
}
