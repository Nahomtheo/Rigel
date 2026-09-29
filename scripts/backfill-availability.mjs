/**
 * One-off backfill: give every existing Listing an explicit `availability` value.
 *
 * Mongoose schema defaults only apply to documents created after the field was
 * added, so pre-existing listings have no `availability` field at all. Reads
 * already treat a missing field as "active", so this script is not strictly
 * required — it just makes the stored data consistent so future queries and
 * indexes do not have to reason about missing fields.
 *
 * Run with: npm run backfill:availability
 */
import { readFileSync, existsSync } from "node:fs";
import mongoose from "mongoose";

const ENV_FILES = [".env.local", ".env"];

for (const file of ENV_FILES) {
  if (!existsSync(file)) continue;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (process.env[key]) continue;
    process.env[key] = rawValue
      .trim()
      .replace(/^["'](.*)["']$/, "$1");
  }
}

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI is not set. Add it to .env.local before running.");
  process.exit(1);
}

const availabilitySchema = new mongoose.Schema(
  {
    availability: { type: String, enum: ["active", "sold", "rented"] },
    availabilityChangedAt: Date,
  },
  { strict: false }
);

const Listing =
  mongoose.models.ListingBackfill ||
  mongoose.model("ListingBackfill", availabilitySchema, "listings");

try {
  await mongoose.connect(uri);

  const before = await Listing.aggregate([
    {
      $group: {
        _id: { $ifNull: ["$availability", "<missing>"] },
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ]);

  console.log("Before:");
  for (const row of before) console.log(`  ${row._id}: ${row.count}`);

  const result = await Listing.updateMany(
    {
      $or: [
        { availability: { $exists: false } },
        { availability: null },
      ],
    },
    { $set: { availability: "active" } }
  );

  console.log(`\nUpdated ${result.modifiedCount} listing(s) to "active".`);

  const after = await Listing.aggregate([
    {
      $group: {
        _id: { $ifNull: ["$availability", "<missing>"] },
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ]);

  console.log("After:");
  for (const row of after) console.log(`  ${row._id}: ${row.count}`);
} finally {
  await mongoose.disconnect();
}
