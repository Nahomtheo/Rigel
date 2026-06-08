"use client";

const filterConfig: any = {
  car: ["brand", "year", "fuel"],
  house: ["location", "rooms"],
  clothe: ["size", "brand", "condition"],
};

export default function FilterSidebar({
  category,
  filters,
  setFilters,
}: any) {
  const fields = filterConfig[category];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-5 sticky top-20">
      {/* Header */}
      <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
      </div>

      {/* Filter Fields */}
      <div className="space-y-4">
        {fields ? (
        fields.map((field: string) => (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
              {field}
            </label>
            <input
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder={`Enter ${field}`}
              onChange={(e) =>
                setFilters((prev: any) => ({
                  ...prev,
                  [field]: e.target.value,
                }))
              }
            />
          </div>
        ))) : (
          <p className="text-sm text-gray-500">Select a category to see filters</p>
        )}
      </div>

      {/* Clear Filters */}
      {Object?.keys(filters).length > 0 && (
        <button
          onClick={() => setFilters({})}
          className="w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Clear all filters
        </button>
      )}
    </div>
  );
}