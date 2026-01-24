import TextWithFractions from "./TextWithFractions";

export default function StackFractionView({ doc }: { doc: any }) {
  // Parse the question string: split by ";;" (fallback to "//") to separate numerator and denominator
  let parts = doc.question.split(";;");
  if (parts.length !== 2) {
    parts = doc.question.split("//");
  }
  const numerator = parts[0] || "";
  const denominator = parts[1]?.trim() || "";

  // Split numerator and denominator by line breaks
  const numeratorLines = numerator
    .split(/\r?\n/)
    .map((line: any) => line.trim());
  const denominatorLines = denominator
    .split(/\r?\n/)
    .map((line: any) => line.trim());

  return (
    <div className="mb-3 rounded-xl bg-white dark:bg-gray-800/40 p-3 border border-gray-100 dark:border-gray-700 shadow-sm antialiased group">
      {/* Stacked Fraction Display */}
      <div className="inline-block">
        {/* Numerator */}
        <div className="whitespace-nowrap text-right text-gray-900 dark:text-white">
          {numeratorLines.length > 0 ? (
            numeratorLines.map((line: any, index: any) => (
              <div key={index} className="min-h-[.5rem]">
                {line === "[]" ? "" : <TextWithFractions text={line} />}
              </div>
            ))
          ) : (
            <div className="min-h-[.5rem]"></div>
          )}
        </div>
        {/* Fraction Bar - Only as wide as needed */}
        <div
          className="border-t border-black dark:border-white"
          style={{ minWidth: "30px", borderTopWidth: "1px" }}
        />
        {/* Denominator */}
        <div className="min-h-[1rem] whitespace-nowrap text-right text-gray-900 dark:text-white">
          {denominatorLines.length > 0 ? (
            denominatorLines.map((line: any, index: any) => (
              <div key={index} className="min-h-[.5rem]">
                {line === "[]" ? "" : <TextWithFractions text={line} />}
              </div>
            ))
          ) : (
            <div className="min-h-[.5rem]"></div>
          )}
        </div>
      </div>
    </div>
  );
}
