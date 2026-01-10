export default function StackFractionView({ doc }: { doc: any }) {
  // Parse the question string: split by "//" to separate numerator and denominator
  const parts = doc.question.split("//");
  const numerator = parts[0] || "";
  const denominator = parts[1]?.trim() || "";

  // Split numerator by line breaks (preserve natural line breaks from input)
  const numeratorLines = numerator
    .split(/\r?\n/)
    .map((line: any) => line.trim());

  return (
    <div className="mb-4 rounded-sm bg-purple-100 p-4 shadow-md dark:bg-purple-900">
      {/* Stacked Fraction Display */}
      <div className="inline-block">
        {/* Numerator */}
        <div className="whitespace-nowrap text-right font-semibold text-gray-900 dark:text-white">
          {numeratorLines.length > 0 ? (
            numeratorLines.map((line: any, index: any) => (
              <div key={index} className="min-h-[.5rem]">
                {line === "[]" ? "" : line}
              </div>
            ))
          ) : (
            <div className="min-h-[.5rem]"></div>
          )}
        </div>
        {/* Fraction Bar - Only as wide as needed */}
        <div
          className="border-t border-gray-400"
          style={{ minWidth: "30px" }}
        />
        {/* Denominator */}
        <div className="min-h-[1rem] whitespace-nowrap text-right font-semibold text-gray-900 dark:text-white">
          {denominator === "[]" ? "" : denominator || ""}
        </div>
      </div>
    </div>
  );
}
