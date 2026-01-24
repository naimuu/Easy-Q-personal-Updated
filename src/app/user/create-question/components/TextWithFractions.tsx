"use client";

// Component to render text with inline fractions (e.g., 3//2 becomes fraction)
export default function TextWithFractions({
  text,
}: {
  text: string | number | null | undefined;
}) {
  // Handle null, undefined, or non-string values
  if (text === null || text === undefined) return null;
  const textStr: string = String(text);
  if (!textStr || textStr.trim() === "") return <>{textStr}</>;

  // Regex to match fraction patterns: optional sign (+-*xX) followed by digits, then //, then digits
  // Matches: 3//2, +5//3, -10//4, *2//5, x3//2, X4//6, 23//23, 2//2
  // Also handles Bangla (০-৯) and Arabic (٠-٩) digits
  const fractionRegex = /([+\-*xX]?[\d০-৯٠-٩]+)\/\/([\d০-৯٠-٩]+)/g;

  const parts = [];
  let lastIndex = 0;
  let match;

  // Reset regex lastIndex
  fractionRegex.lastIndex = 0;

  while ((match = fractionRegex.exec(textStr)) !== null) {
    // Add text before the fraction
    if (match.index > lastIndex) {
      parts.push({
        type: "text",
        content: textStr.substring(lastIndex, match.index),
      });
    }

    // Add the fraction
    parts.push({
      type: "fraction",
      numerator: match[1], // includes sign if present
      denominator: match[2],
    });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < textStr.length) {
    parts.push({
      type: "text",
      content: textStr.substring(lastIndex),
    });
  }

  // If no fractions found, return the original text
  if (parts.length === 0) {
    return <>{textStr}</>;
  }

  return (
    <>
      {parts.map((part, index) => {
        if (part.type === "fraction") {
          const numerator = part.numerator || "";
          const denominator = part.denominator || "";

          // Use table layout for consistent rendering
          return (
            <table
              key={`frac-${index}`}
              cellPadding="0"
              cellSpacing="0"
              style={{
                display: "inline-table",
                verticalAlign: "middle",
                marginLeft: "2px",
                marginRight: "2px",
                borderCollapse: "collapse",
                fontSize: "0.8em",
              }}
            >
              <tbody>
                {/* Numerator */}
                <tr>
                  <td
                    style={{
                      textAlign: "center",
                      fontWeight: "600",
                      lineHeight: "1.2",
                      padding: "0 2px 5px 2px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {numerator}
                  </td>
                </tr>
                {/* Fraction Bar */}
                <tr>
                  <td
                    style={{
                      borderTop: "2px solid #000000",
                      padding: "0",
                      height: "2px",
                    }}
                  ></td>
                </tr>
                {/* Denominator */}
                <tr>
                  <td
                    style={{
                      textAlign: "center",
                      fontWeight: "600",
                      lineHeight: "",
                      padding: "0 2px 0 2px",
                      whiteSpace: "nowrap",
                      marginTop: "-3px",
                    }}
                  >
                    {denominator}
                  </td>
                </tr>
              </tbody>
            </table>
          );
        }
        // Regular text
        return <span key={`text-${index}`}>{part.content}</span>;
      })}
    </>
  );
}
