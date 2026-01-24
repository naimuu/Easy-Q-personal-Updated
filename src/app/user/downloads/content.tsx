import ReactDOMServer from "react-dom/server";
import {
  arabicAlphabet,
  banglaAlphabet,
  englishAlphabet,
  romanNumerals,
} from "../create-question/components/alphabet";
import {
  ContextCategory,
  QuestionItemsType,
  QuestionType,
} from "../create-question/components/QuestionContext";
import { getFormattedNumber, getAnyLabel } from "../create-question/components/numberingUtils";

// --- Utility Functions (Hoisted manually to avoid temporal dead zone) ---

const toBanglaNumber = (num: number | string): string => {
  const parsed = Number(num);
  if (isNaN(parsed)) return "";
  const display = Number.isInteger(parsed) ? parsed.toString() : parsed.toFixed(1);
  return display.replace(/[0-9.]/g, (char) =>
    char === "." ? "." : "০১২৩৪৫৬৭৮৯"[parseInt(char)]
  );
};

const toArabicNumber = (num: number | string): string => {
  const parsed = Number(num);
  if (isNaN(parsed)) return "";
  const display = Number.isInteger(parsed) ? parsed.toString() : parsed.toFixed(1);
  return display.replace(/[0-9.]/g, (char) =>
    char === "." ? "." : "٠١٢٣٤٥٦٧٨٩"[parseInt(char)]
  );
};

const subject = (lang: string) =>
  lang === "bn" ? `বিষয়ঃ ` : lang === "ar" ? `الموضوع: ` : `Subject: `;

const time = (lang: string, hour: string, minute: string) => {
  if (lang === "bn") return `সময়ঃ ${hour} ঘন্টা ${minute} মিঃ`;
  if (lang === "ar") return `الوقت: ${hour} ساعة ${minute} دقيقة`;
  return `Time: ${hour} hour ${minute} minute`;
};

const mark = (lang: string, mark: number) =>
  lang === "bn" ? `পূর্ণমানঃ ${mark}` : lang === "ar" ? `الدرجة: ${mark}` : `Mark: ${mark}`;

const convertIndex = (lang: string, num: number, isRTL: boolean = false) =>
  isRTL || lang === "ar" ? `${toArabicNumber(num)}.` : lang === "bn" ? `${toBanglaNumber(num)}|` : `${num}.`;

const convertNumber = (lang: string | undefined, num: number) => {
  const formatted = num % 1 === 0 ? `${num}` : `${num.toFixed(1)}`;
  if (lang === "bn" || lang?.endsWith("_bn")) return toBanglaNumber(formatted);
  if (lang === "ar" || lang?.endsWith("_ar")) return toArabicNumber(formatted);
  return formatted;
};

// Helper function to format number for display (convert *, x, X to ×)
function formatNumberForDisplay(text: string) {
  if (!text) return text;
  return text.replace(/([*xX])([\d০-৯٠-٩])/gi, "×$2");
}

const renderEquationPart = (set: any, group: any) => {
  const count = getAnswerCount(group);
  const markVal = parseFloat(group.mark || "1");
  const total = count * markVal;
  const targetLang = group.anyMode || set?.type;

  if (group.any) {
    return `${convertNumber(targetLang, count)} × ${convertNumber(targetLang, markVal)} = ${convertNumber(targetLang, total)}`;
  }
  if (group.mark) {
    return `${convertNumber(targetLang, markVal)}`;
  }
  return null;
};

const getAnswerCount = (group: any) => {
  if (group.any === "All") return group.questions.length;
  return parseFloat(group.any);
};

function wrapSentences(content: React.ReactNode): React.ReactNode {
  if (typeof content === "string") {
    const sentences = content.split(/([.!?]\s+|[.!?]$)/g).filter((s) => s.trim());
    return (
      <>
        {sentences.map((sentence, idx) => (
          <span key={idx} style={{ pageBreakInside: "avoid", orphans: 2, widows: 2, display: "inline" }}>
            {sentence}
          </span>
        ))}
      </>
    );
  }
  return content;
}

function renderTextWithFractions(text: string | null | undefined): React.ReactNode {
  if (!text || typeof text !== "string") return <>{text}</>;
  const textStr: string = String(text);
  if (!textStr || textStr.trim() === "") return <>{textStr}</>;

  const fractionRegex = /([+\-*xX]?[\d০-৯٠-٩]+)\/\/([\d০-৯٠-٩]+)/g;
  const parts: Array<{ type: string; content?: string; numerator?: string; denominator?: string }> = [];
  let lastIndex = 0;
  let match;

  fractionRegex.lastIndex = 0;
  while ((match = fractionRegex.exec(textStr)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", content: textStr.substring(lastIndex, match.index) });
    }
    parts.push({ type: "fraction", numerator: match[1], denominator: match[2] });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < textStr.length) parts.push({ type: "text", content: textStr.substring(lastIndex) });

  if (parts.length === 0) return <>{textStr}</>;

  return (
    <>
      {parts.map((part, index) => {
        if (part.type === "fraction") {
          const numerator = formatNumberForDisplay(part.numerator || "");
          const denominator = formatNumberForDisplay(part.denominator || "");
          return (
            <table key={`frac-${index}`} cellPadding="0" cellSpacing="0" style={{ display: "inline-table", verticalAlign: "middle", marginLeft: "2px", marginRight: "2px", borderCollapse: "collapse", fontSize: "0.8em" }}>
              <tbody>
                <tr><td style={{ textAlign: "center", fontWeight: "600", lineHeight: "1.2", padding: "0 2px 5px 2px", whiteSpace: "nowrap" }}>{numerator}</td></tr>
                <tr><td style={{ borderTop: "2px solid #000000", padding: "0", height: "1px" }}></td></tr>
                <tr><td style={{ textAlign: "center", fontWeight: "600", lineHeight: "1", padding: "0 2px 0 2px", whiteSpace: "nowrap" }}>{denominator}</td></tr>
              </tbody>
            </table>
          );
        }
        return <span key={`text-${index}`} style={{ pageBreakInside: "avoid", orphans: 2, widows: 2 }}>{part.content}</span>;
      })}
    </>
  );
}

export function renderStackFractionInline(question: string) {
  if (!question) return null;
  const parts = question.split("//");
  if (parts.length === 2) {
    const numerator = parts[0].trim();
    const denominator = parts[1].trim();
    if (numerator === "[]" || denominator === "[]") return null;
    return (
      <span className="inline-flex items-center gap-1">
        <span>{formatNumberForDisplay(numerator)}</span>
        <span className="font-bold">--------</span>
        <span>{formatNumberForDisplay(denominator)}</span>
      </span>
    );
  }
  return <span>{question}</span>;
}

export function renderStackFractionVertical(question: string) {
  if (!question) return null;
  const parts = question.split("//");
  if (parts.length === 2) {
    const numerator = parts[0] || "";
    const denominator = parts[1]?.trim() || "";
    const numeratorLines = numerator.split(/\r?\n/).map((l) => (l.trim() === "[]" ? "" : l.trim()));
    const cleanDenominator = denominator === "[]" ? "" : denominator;
    const allLines = [...numeratorLines, cleanDenominator];
    const maxLen = Math.max(...allLines.map((l) => l.length));
    return (
      <span className="mr-2 inline-block align-top">
        <div className="w-full whitespace-nowrap text-right font-semibold text-gray-900 border-none">
          {numeratorLines.length > 0 ? numeratorLines.map((line, idx) => (
            <div key={idx} style={{ minHeight: "0", lineHeight: "1", marginBottom: "0", paddingBottom: "0" }}>
              <span style={{ display: "inline-block", minWidth: `${maxLen}ch`, textAlign: "right" }}>{formatNumberForDisplay(line)}</span>
            </div>
          )) : <div style={{ minHeight: "0", lineHeight: "1" }}></div>}
        </div>
        <div className="border-t border-gray-700" style={{ minWidth: `${maxLen + 1}ch`, marginTop: "-1px", marginBottom: "2px", height: "1px" }} />
        <div className="w-full whitespace-nowrap text-right font-semibold text-gray-900" style={{ minHeight: "0", lineHeight: "1", marginTop: "1px" }}>
          <span style={{ display: "inline-block", minWidth: `${maxLen}ch`, textAlign: "right" }}>{formatNumberForDisplay(cleanDenominator)}</span>
        </div>
      </span>
    );
  }
  return <span>{question}</span>;
}

// --- Main Components ---

// New helper to render the group header with the specific layout requirements
const renderGroupHeader = (set: any, group: any, visualIndex: number, isRTL: boolean) => {
  const count = getAnswerCount(group);
  const equation = renderEquationPart(set, group);

  const label = group.any && group.anyMode ? getAnyLabel(group.anyMode, count) : "";

  return (
    <div className="flex flex-wrap items-baseline w-full">
      <div className="font-bold">
        {convertIndex(set?.type, visualIndex, isRTL)} {group?.name}&nbsp;{label}
      </div>
      {equation && (
        <div className="ml-auto whitespace-nowrap" style={{ direction: "ltr" }}>
          {equation}
        </div>
      )}
    </div>
  );
};

export const QuestionComponent = ({ isRTL, ...set }: any) => {
  let visualIndex = 0;
  return (
    <div className="w-full space-y-0.5 text-black">
      <div className={`avoid-break text-center font-semibold text-black ${set?.institute?.name.length > 80 ? "text-xl" : set?.institute?.name.length > 50 ? "text-2xl" : "text-3xl"}`}>
        {set?.institute?.name}
      </div>
      <div className="avoid-break text-center text-lg font-semibold text-black">{set?.examName?.examName}</div>
      <div className="avoid-break text-center text-xl text-black">{set?.className ?? set?.class?.name}</div>
      <div className="avoid-break text-center text-lg text-black">{subject(set?.type)}{set?.subject}</div>
      <div className="flex items-start justify-between text-center text-lg">
        <div>{time(set?.type, set?.durationHour, set?.durationMinute)}</div>
        <div>{mark(set?.type, set?.totalMarks)}</div>
      </div>
      <div />
      <div className={`space-y-0 text-lg leading-tight ${isRTL ? "text-rtl" : ""}`} style={isRTL ? { direction: "rtl", textAlign: "right" } : { textAlign: "left", direction: "ltr" }}>
        {set?.questions
          ?.filter((g: any) => g.id !== "settings") // Ignore settings group
          ?.map((group: QuestionType, i: number) => {
            if (group.type !== "section-breaker") {
              visualIndex++;
            }
            const currentVisualIndex = visualIndex;

            return group.type === "passage-based" ? (
              <div className={`flex flex-col gap-0 ${isRTL ? "text-rtl" : ""}`} style={isRTL ? { direction: "rtl", textAlign: "right" } : { textAlign: "left", direction: "ltr" }} key={i}>
                {renderGroupHeader(set, group, currentVisualIndex, isRTL)}
                <div className="page-break" />
                <div className="mx-1">
                  <div className={`avoid-break text-justify ${group?.isRTL ? "text-rtl" : ""}`} style={group?.isRTL ? { direction: "rtl", textAlign: "right" } : { direction: "ltr", textAlign: "left" }}>
                    {group.text}
                  </div>
                </div>
                <div className="flex flex-col gap-0">
                  {(group.questions as ContextCategory[])?.map((item: ContextCategory, index) => (
                    <div className={`ml-[16px] space-y-0 leading-tight ${group?.isRTL ? "text-rtl" : ""}`} style={group?.isRTL ? { direction: "rtl", textAlign: "right" } : { direction: "ltr", textAlign: "left" }} key={item.id}>
                      <div className="avoid-break">
                        <div className="flex flex-wrap items-baseline gap-2 w-full justify-between">
                          <div className="flex items-baseline">
                            <p style={{ pageBreakInside: "avoid", orphans: 2, widows: 2, margin: 0 }}>
                              {set?.type === "bn" ? `${banglaAlphabet[index]})` : set?.type === "ar" ? `${arabicAlphabet[index]})` : `${englishAlphabet[index]})`} {renderTextWithFractions(item?.name)}
                            </p>
                            {item.any && item.anyMode && <span className="mx-1 font-bold">{getAnyLabel(item.anyMode, getAnswerCount(item))}</span>}
                          </div>
                          {renderEquationPart(set, item) && (
                            <div className="ml-auto whitespace-nowrap" style={{ direction: "ltr" }}>
                              {renderEquationPart(set, item)}
                            </div>
                          )}
                        </div>
                      </div>
                      {item.type === "word" ? (
                        <div className="avoid-break">
                          <div className="ml-[16px] mt-0 flex flex-wrap gap-1 leading-tight">
                            {item.questions.map((ques, q) => (
                              <div key={q} style={{ pageBreakInside: "avoid", orphans: 2, widows: 2 }}>
                                {renderTextWithFractions(ques.question)}{item.questions.length - 1 !== q && `,`}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : item.type === "objective" ? (
                        <div className="mt-0">
                          <div className="page-break" />
                          {item?.questions?.map((qs: any, s) => (
                            <div key={s} className="ml-[14px]">
                              <div className={`avoid-break space-y-0 ${s === item?.questions?.length - 1 ? "leading-normal" : "leading-tight"}`}>
                                <div className="flex items-start gap-1 font-semibold">
                                  {item.numbering === "bangla" || (set?.type === "bn" && item.numbering !== "roman") ? `${banglaAlphabet[s]})` : item.numbering === "english" || (set?.type === "en" && item.numbering !== "roman") ? `${englishAlphabet[s]})` : item.numbering === "arabic" || (set?.type === "ar" && item.numbering !== "roman") ? `${arabicAlphabet[s]})` : `(${romanNumerals[s]})`}
                                  <p style={{ pageBreakInside: "avoid", orphans: 2, widows: 2, margin: 0 }}>{renderTextWithFractions(qs?.question)}</p>
                                </div>
                                <div className={`grid ${(() => {
                                  const maxLen = Math.max(...(qs?.options?.map((o: any) => (o.name || "").length) || [0]));
                                  if (maxLen > 40) return "grid-cols-1";
                                  if (maxLen < 15) return "grid-cols-4";
                                  return "grid-cols-2";
                                })()}`}>
                                  {qs?.options?.map((rs: any, q: number) => (
                                    <div className="ml-[14px] mt-0 flex items-start gap-1" key={q}>
                                      {getFormattedNumber(q, item.optionNumbering || item.numbering || "roman")}
                                      <p style={{ pageBreakInside: "avoid", orphans: 2, widows: 2, margin: 0 }}>{renderTextWithFractions(rs?.name)}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : item.type === "table" ? (
                        <div className="mt-0 flex flex-col gap-0">
                          <div className="page-break" />
                          {item.questions.map((tab, i) => (
                            <div key={i} className="avoid-break"><div dangerouslySetInnerHTML={{ __html: tab.table || "" }} className="custom-table ml-1"></div></div>
                          ))}
                        </div>
                      ) : item.type === "stack-fraction" ? (
                        <div className="ml-[14px] space-y-0 leading-tight">
                          {Array.from({ length: Math.ceil(item.questions.length / 6) }).map((_, rowIndex) => {
                            const rowQuestions = item.questions.slice(rowIndex * 6, rowIndex * 6 + 6) as QuestionItemsType[];
                            return (
                              <div key={rowIndex} className="flex items-start justify-between">
                                <div className="flex items-start gap-4">
                                  {rowQuestions.map((ques, localQ) => {
                                    const q = rowIndex * 6 + localQ;
                                    return (
                                      <div key={q} className="flex items-start gap-1">
                                        <span className="font-bold text-gray-700">{getFormattedNumber(q, item.numbering || "roman")}</span>
                                        {renderStackFractionVertical(ques.question ?? "")}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div>
                          {item.questions.map((ques, q) => (
                            <div key={q} className={`avoid-break space-y-0 ${q === item?.questions?.length - 1 ? "leading-normal" : "leading-tight"}`}>
                              <div className="ml-[16px] mt-0 flex gap-1">
                                {getFormattedNumber(q, item.numbering || "roman")}
                                <p className="" style={{ margin: 0 }}>{renderStackFractionInline(ques.question ?? "")}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : group.type === "table" ? (
              <div className={`space-y-0 leading-tight ${isRTL ? "text-rtl" : ""}`} style={isRTL ? { direction: "rtl", textAlign: "right" } : { textAlign: "left", direction: "ltr" }} key={i}>
                <div className="avoid-break">
                  {renderGroupHeader(set, group, currentVisualIndex, isRTL)}
                </div>
                <div className="page-break" />
                <div className={group?.isRTL ? "text-rtl" : ""} style={group?.isRTL ? { direction: "rtl", textAlign: "right" } : { direction: "ltr", textAlign: "left" }}>
                  {group?.questions?.map((ques: QuestionItemsType, ind) => (
                    <div key={ind} className="avoid-break">
                      <div dangerouslySetInnerHTML={{ __html: ques.table || "" }} className="custom-table ml-1"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : group.type === "objective" ? (
              <div className={`flex flex-col gap-0 ${isRTL ? "text-rtl" : ""}`} style={isRTL ? { direction: "rtl", textAlign: "right" } : { textAlign: "left", direction: "ltr" }} key={i}>
                <div className="avoid-break">
                  {renderGroupHeader(set, group, currentVisualIndex, isRTL)}
                </div>
                <div className="page-break" />
                <div className={group?.isRTL ? "text-rtl" : ""} style={group?.isRTL ? { direction: "rtl", textAlign: "right" } : { direction: "ltr", textAlign: "left" }}>
                  {group?.questions?.map((qs: any, s) => (
                    <div key={s} className="ml-[16px] mb-[8px]">
                      <div className={`avoid-break space-y-0 ${s === group?.questions?.length - 1 ? "leading-normal" : "leading-tight"}`}>
                        <div className="flex items-start gap-1 font-semibold">
                          {getFormattedNumber(s, group.numbering || "roman")}
                          <p style={{ pageBreakInside: "avoid", orphans: 2, widows: 2, margin: 0 }}>{renderTextWithFractions(qs?.question)}</p>
                        </div>
                        <div className={`grid ${(() => {
                          const maxLen = Math.max(...(qs?.options?.map((o: any) => (o.name || "").length) || [0]));
                          if (maxLen > 40) return "grid-cols-1";
                          if (maxLen < 15) return "grid-cols-4";
                          return "grid-cols-2";
                        })()}`}>
                          {qs?.options?.map((rs: any, q: number) => (
                            <div className="ml-[16px] flex items-start gap-1" key={q}>
                              {getFormattedNumber(q, group.optionNumbering || group.numbering || "roman")}
                              <p style={{ pageBreakInside: "avoid", orphans: 2, widows: 2, margin: 0 }}>{renderTextWithFractions(rs?.name)}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : group.type === "word" ? (
              <div className={`flex flex-col gap-0 ${isRTL ? "text-rtl" : ""}`} style={isRTL ? { direction: "rtl", textAlign: "right" } : { textAlign: "left", direction: "ltr" }} key={i}>
                <div className="avoid-break">
                  {renderGroupHeader(set, group, currentVisualIndex, isRTL)}
                </div>
                <div className="page-break" />
                <div className="avoid-break">
                  <div className={`ml-[14px] flex flex-wrap gap-1 leading-tight ${group?.isRTL ? "text-rtl" : ""}`} style={group?.isRTL ? { direction: "rtl", textAlign: "right" } : { direction: "ltr", textAlign: "left" }}>
                    {group.questions.map((ques: any, q) => (
                      <div key={q} style={{ pageBreakInside: "avoid", orphans: 2, widows: 2 }}>{renderTextWithFractions(ques.question)}{group.questions.length - 1 !== q && `,`}</div>
                    ))}
                  </div>
                </div>
              </div>
            ) : group.type === "no" ? (
              <div key={i} className={`avoid-break space-y-0 leading-tight ${isRTL ? "text-rtl" : ""}`} style={isRTL ? { direction: "rtl", textAlign: "right" } : { textAlign: "left", direction: "ltr" }}>
                {renderGroupHeader(set, group, currentVisualIndex, isRTL)}
              </div>
            ) : group.type === "section-breaker" ? (
              <div
                key={i}
                className={`avoid-break py-2 text-center text-lg font-bold underline ${isRTL ? "text-rtl" : ""
                  }`}
                style={isRTL ? { direction: "rtl" } : { direction: "ltr" }}
              >
                {group.name}
              </div>
            ) : group.type === "stack-fraction" ? (
              <div className={`space-y-0 leading-tight ${isRTL ? "text-rtl" : ""}`} style={isRTL ? { direction: "rtl", textAlign: "right" } : { textAlign: "left", direction: "ltr" }} key={i}>
                <div className="avoid-break">
                  {renderGroupHeader(set, group, currentVisualIndex, isRTL)}
                </div>
                <div className="page-break" />
                <div className={`ml-[16px] space-y-0 leading-tight ${group?.isRTL ? "text-rtl" : ""}`} style={group?.isRTL ? { direction: "rtl", textAlign: "right" } : { direction: "ltr", textAlign: "left" }}>
                  {Array.from({ length: Math.ceil(group.questions.length / 6) }).map((_, rowIndex) => {
                    const rowQuestions = (group.questions as QuestionItemsType[]).slice(rowIndex * 6, rowIndex * 6 + 6);
                    return (
                      <div key={rowIndex} className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          {rowQuestions.map((ques, localQ) => {
                            const q = rowIndex * 6 + localQ;
                            return (
                              <div key={q} className="flex items-start gap-1">
                                <span className="font-bold text-gray-700">{getFormattedNumber(q, group.numbering || "roman")}</span>
                                {renderStackFractionVertical(ques.question ?? "")}
                              </div>
                            );
                          })}
                        </div>
                        {rowQuestions.some((q) => q.answer && q.mark) && (
                          <span className="whitespace-nowrap text-lg text-black">{rowQuestions[0].answer && rowQuestions[0].mark && `${convertNumber(set?.type, parseFloat(rowQuestions[0].answer))} x ${convertNumber(set?.type, parseFloat(rowQuestions[0].mark))} = ${convertNumber(set?.type, parseFloat(rowQuestions[0].answer) * parseFloat(rowQuestions[0].mark))}`}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className={`space-y-0 leading-tight ${isRTL ? "text-rtl" : ""}`} style={isRTL ? { direction: "rtl", textAlign: "right" } : { textAlign: "left", direction: "ltr" }} key={i}>
                <div className="avoid-break">
                  {renderGroupHeader(set, group, currentVisualIndex, isRTL)}
                </div>
                <div className="page-break" />
                <div className={group?.isRTL ? "text-rtl" : ""} style={group?.isRTL ? { direction: "rtl", textAlign: "right" } : { direction: "ltr", textAlign: "left" }}>
                  {group.questions.map((ques: any, q) => (
                    <div key={q} className={`avoid-break space-y-0 ${q === group?.questions?.length - 1 ? "leading-normal" : "leading-tight"}`}>
                      <div className="ml-[16px] mt-0 flex gap-1">
                        {getFormattedNumber(q, group.numbering || "roman")}
                        <p className="" style={{ pageBreakInside: "avoid", orphans: 2, widows: 2, margin: 0 }}>{renderTextWithFractions(ques.question)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
      </div>
      {/* Spacer to prevent cut-off at bottom of page */}
      <div className="h-12 w-full" style={{ visibility: "hidden" }}>&nbsp;</div>
    </div>
  );
};

const content = (set: any, isRTL: boolean = false): string => {
  return `${ReactDOMServer.renderToString(<QuestionComponent {...set} isRTL={isRTL} />)}`;
};

export default content;
