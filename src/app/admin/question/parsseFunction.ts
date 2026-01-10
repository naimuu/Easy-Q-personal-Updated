interface QUESTION_TYPE {
  question: string;
  categoryId: string;
  table: string | undefined;
  lessonId: string;
  option: string[] | undefined;
  isRTL?: boolean;
}
const purseText = (
  text: string,
  type: string,
  categoryId: string,
  lessonId: string,
  isRTL?: boolean,
) => {
  if (type === "word") {
    return parseWord(text, categoryId, lessonId, isRTL);
  }
  if (
    type === "right-wrong" ||
    type === "fill-gap" ||
    type === "single-question" ||
    type === "no" ||
    type === "stack-fraction"
  ) {
    return parseLine(text, categoryId, lessonId, type, isRTL);
  } else if (type === "table") {
    return parseTable(text, categoryId, lessonId, isRTL);
  } else if (type === "objective") {
    return parseObjective(text, categoryId, lessonId, isRTL);
  }
  return undefined;
};
const parseWord = (text: string, categoryId: string, lessonId: string, isRTL?: boolean) => {
  if (text) {
    const parse = text.split(", ");
    const arr: QUESTION_TYPE[] = parse.map((d) => {
      return {
        categoryId: categoryId,
        lessonId: lessonId,
        question: d,
        table: undefined,
        option: [],
        isRTL,
      };
    });
    return arr;
  }
  return undefined;
};
const parseLine = (
  text: string,
  categoryId: string,
  lessonId: string,
  type: string,
  isRTL?: boolean,
) => {
  if (text.trim()) {
    if (type === "stack-fraction") {
      // Split by commas first (each comma-separated block is a question)
      const blocks = text.split(",").map((block) => block.trim());

      const arr: QUESTION_TYPE[] = blocks.map((block) => {
        return {
          categoryId,
          lessonId,
          question: block, // Keep line breaks within each block
          table: undefined,
          option: [],
          isRTL,
        };
      });

      return arr;
    } else {
      // Default behavior for other types
      const lines = text.split(/\r?\n/).filter((line) => line.trim() !== "");
      const arr: QUESTION_TYPE[] = lines.map((line) => ({
        categoryId,
        lessonId,
        question: line.trim(),
        table: undefined,
        option: [],
        isRTL,
      }));
      return arr;
    }
  }
  return undefined;
};
const parseTable = (text: string, categoryId: string, lessonId: string, isRTL?: boolean) => {
  if (!text.trim()) return undefined;

  // Parse HTML string into DOM
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, "text/html");

  // Get all <table> elements
  const tables = Array.from(doc.querySelectorAll("table"));
  if (tables.length === 0) return undefined;

  const arr: QUESTION_TYPE[] = tables.map((table) => {
    return {
      categoryId,
      lessonId,
      question: "-", // keep empty if storing table in `table` field
      table: table.outerHTML.trim(), // full HTML of the <table>
      option: [],
      isRTL,
    };
  });

  return arr.length > 0 ? arr : undefined;
};
const parseObjective = (
  text: string,
  categoryId: string,
  lessonId: string,
  isRTL?: boolean,
): QUESTION_TYPE[] | undefined => {
  if (!text.trim()) return undefined;

  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const result: QUESTION_TYPE[] = [];

  for (let i = 0; i < lines.length; i++) {
    const questionLine = lines[i];
    const nextLine = lines[i + 1];

    if (questionLine.endsWith("?") && nextLine) {
      const options = nextLine
        .split(",")
        .map((opt) => opt.trim())
        .filter(Boolean);

      result.push({
        categoryId,
        lessonId,
        question: questionLine,
        option: options,
        table: undefined,
        isRTL,
      });

      i++; // skip next line (already processed as options)
    }
  }

  return result.length > 0 ? result : undefined;
};

export default purseText;

interface QUESTION_TYPEs {
  question: string;
  categoryId: string;
  table: string | undefined;
  lessonId: string;
  options: any[] | undefined;
}

export const stringifyQuestions = (
  questions: QUESTION_TYPEs[],
  type: string,
): string => {
  if (!questions || questions.length === 0) return "";

  switch (type) {
    case "word":
      return questions.map((q) => q.question).join(", ");

    case "right-wrong":
    case "fill-gap":
    case "single-question":
    case "no":
      return questions.map((q) => q.question).join("\n");

    case "stack-fraction":
      return questions.map((q) => q.question).join(", ");

    case "table":
      return questions.map((q) => q.table || "").join("\n\n");

    case "objective":
      return questions
        .map((q) => {
          const opts = q.options?.map((s) => s.name).join(", ") || "";
          return `${q.question}\n${opts}`;
        })
        .join("\n\n");

    default:
      return "";
  }
};
