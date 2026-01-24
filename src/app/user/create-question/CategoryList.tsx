import Loader from "@/components/shared/Loader";
import { useDebounce } from "@/hooks/use-debounce";
import { useRTL } from "@/hooks/use-rtl";
import {
  useGetUserChapterQuery,
  useGetUserQuestionsQuery,
} from "@/redux/services/userService";
import * as Accordion from "@radix-ui/react-accordion";
import { ArrowLeftRight, ChevronDown, PlusCircle, Search, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import ObjectiveView from "./components/ObjectiveView";
import PassageView from "./components/PassageView";
import GroupedQuestionsRenderer from "./components/GroupedQuestionsRenderer";
import TextWithFractions from "./components/TextWithFractions";

// Inline utility to render stack-fraction vertically (same as print/export)
export function renderStackFractionInline(question: string) {
  if (!question) return null;
  // Try split by new separator first, then fallback to old
  let parts = question.split(";;");
  if (parts.length !== 2) {
    parts = question.split("//");
  }

  if (parts.length === 2) {
    const numerator = parts[0].trim();
    const denominator = parts[1].trim();

    // Don't render if empty placeholder
    if (numerator === "[]" || denominator === "[]") {
      return null;
    }

    return (
      <span className="inline-flex items-center gap-2">
        <span><TextWithFractions text={numerator} /></span>
        <span className="font-bold">--------</span>
        <span><TextWithFractions text={denominator} /></span>
      </span>
    );
  }
  return <span><TextWithFractions text={question} /></span>;
}

// Utility to render stack-fraction vertically (side by side layout)
export function renderStackFractionVertical(question: string) {
  if (!question) return null;
  // Try split by new separator first, then fallback to old
  let parts = question.split(";;");
  if (parts.length !== 2) {
    parts = question.split("//");
  }

  if (parts.length === 2) {
    const numerator = parts[0] || "";
    const denominator = parts[1]?.trim() || "";
    const numeratorLines = numerator.split(/\r?\n/).map((l) => l.trim());
    const denominatorLines = denominator.split(/\r?\n/).map((l) => l.trim());

    return (
      <span
        className="mr-6 inline-flex flex-col align-top"
        style={{ minWidth: "40px" }}
      >
        {/* Numerator */}
        <div className="w-full font-semibold text-gray-900 dark:text-white">
          {numeratorLines.length > 0 ? (
            numeratorLines.map((line, idx) => (
              <div key={idx} className="min-h-[1rem] text-center">
                {line === "[]" ? "" : <TextWithFractions text={line} />}
              </div>
            ))
          ) : (
            <div className="min-h-[1rem]"></div>
          )}
        </div>
        {/* Fraction Bar - plain solid line */}
        <div
          className="w-full border-t-2 border-gray-400"
          style={{ minWidth: "40px" }}
        />
        {/* Denominator */}
        <div className="min-h-[1rem] w-full text-center font-semibold text-gray-900 dark:text-white">
          {denominatorLines.length > 0 ? (
            denominatorLines.map((line, idx) => (
              <div key={idx} className="min-h-[1rem] text-center">
                {line === "[]" ? "" : <TextWithFractions text={line} />}
              </div>
            ))
          ) : (
            <div className="min-h-[1rem]"></div>
          )}
        </div>
      </span>
    );
  }
  return <span><TextWithFractions text={question} /></span>;
}

const generateId = () => {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
};

type Question = {
  id: number;
  text: string;
};
type QuestionGroup = {
  id: number;
  category: string;
  title: string;
  questions: Question[];
};

export default function CategoryList({
  questionList,
  onChange,
  canAddQuestions = true,
  canSearch = true,
  canFilter = true,
  onLockedFeature,
  addedBooks = [],
  activeBookId,
  onBookChange,
  activeBookName,
}: {
  questionList: any[];
  onChange: (d: any) => void;
  canAddQuestions?: boolean;
  canSearch?: boolean;
  canFilter?: boolean;
  onLockedFeature?: (featureName: string, featureKey: string) => void;
  addedBooks?: any[];
  activeBookId?: string;
  onBookChange?: (id: string) => void;
  activeBookName?: string;
}) {
  const [search, setSearch] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const debouncedSearch = useDebounce(search, 300); // Debounce search by 300ms
  const [lessonId, setLessonId] = useState("");
  const [chapter, setChapter] = useState<any>();
  const { isRTL } = useRTL();
  const [categoryRTLStates, setCategoryRTLStates] = useState<Record<string, boolean>>({});

  const toggleCategoryRTL = (categoryId: string) => {
    setCategoryRTLStates((prev) => {
      const currentState =
        prev[categoryId] !== undefined ? prev[categoryId] : isRTL;
      return {
        ...prev,
        [categoryId]: !currentState,
      };
    });
  };

  const getRTLState = (categoryId: string) => {
    // Check if category has explicit RTL setting from DB
    const category = data?.find((c) => c.id === categoryId);
    if (category?.isRTL) return true;

    if (categoryRTLStates[categoryId] !== undefined) {
      return categoryRTLStates[categoryId];
    }
    return isRTL;
  };
  const query = useSearchParams();
  const urlBookId = query.get("bookId");
  const setId = query.get("set_id");

  // Use passed activeBookId or fallback to URL bookId
  const currentBookId = activeBookId || urlBookId;

  const { data, isLoading, error } = useGetUserQuestionsQuery(
    {
      search: debouncedSearch || "", // Use debounced value
      lessonId: chapter?.id ? (lessonId ?? "") : "",
      chapterId: chapter?.id || "",
      bookId: currentBookId || "",
    },
    { refetchOnMountOrArgChange: true, pollingInterval: 3000 },
  );
  //console.log(data);
  const { data: chapters, isLoading: chapterLoading } = useGetUserChapterQuery(
    currentBookId as string,
    { refetchOnMountOrArgChange: true },
  );
  //console.log(data);
  // const addQuestion = (doc: any) => {
  //   const existingCategory = questionList.find((cat) => cat.id === doc.id);

  //   if (existingCategory) {
  //     // Check if this question already exists in that category
  //     const alreadyExists = Array.isArray(doc.questions)
  //       ? doc.questions?.some((newQ: any) =>
  //         existingCategory.questions?.some(
  //           (existingQ: any) => existingQ.id === newQ.id,
  //         ),
  //       )
  //       : existingCategory.questions?.some(
  //         (q: any) => q.id === doc.questions.id,
  //       );
  //     if (alreadyExists) return;

  //     const updatedList = questionList.map((cat) => {
  //       if (cat.id === doc.id) {
  //         return {
  //           ...cat,
  //           questions: [...cat.questions, doc.questions],
  //         };
  //       }
  //       return cat;
  //     });

  //     onChange(updatedList);
  //   } else {
  //     const newCategory = {
  //       ...doc,
  //       questions: Array.isArray(doc.questions)
  //         ? doc.questions
  //         : [doc.questions], // wrap the single question in array
  //     };
  //     onChange([...questionList, newCategory]);
  //   }
  // };

  const addQuestion = (doc: any) => {
    // Check if user can add questions
    if (!canAddQuestions) {
      onLockedFeature?.("Adding Questions", "addingquestions");
      return;
    }

    console.log(doc);
    if (!doc || !doc.id) return;

    // WORKING LIST: Use this for all operations
    let currentList = [...questionList];

    // AUTO SECTION BREAKER LOGIC
    if (activeBookName) {
      let sectionBreakerNeeded = true;
      // Check if the very last item is a section breaker with the same name
      // OR if we are currently "under" this section breaker (no other section breaker after it)
      for (let i = currentList.length - 1; i >= 0; i--) {
        const g = currentList[i];
        if (g.type === "section-breaker") {
          if (g.name === activeBookName) {
            sectionBreakerNeeded = false;
          }
          break; // Found the nearest preceding section breaker
        }
      }

      // If we found duplicates or just want to be strict: 
      // Ensure we don't add it if the list is empty ? No, add it.

      if (sectionBreakerNeeded) {
        const newSectionBreaker = {
          id: `${Date.now()}-sb-${Math.random().toString(36).substr(2, 9)}`,
          type: "section-breaker",
          name: activeBookName,
          questions: [],
          isRTL: isRTL,
        };
        currentList.push(newSectionBreaker);
      }
    }

    const isMainBook = !activeBookId || activeBookId === urlBookId;
    let categoryId = doc.id;
    let categoryName = doc.name ?? "";

    if (!isMainBook && activeBookId) {
      categoryId = `${doc.id}_${activeBookId}`;

    }

    const ensureArray = (v: any) => (Array.isArray(v) ? v : v ? [v] : []);

    const incomingQuestionsRaw = Array.isArray(doc.questions)
      ? doc.questions
      : doc.questions
        ? [doc.questions]
        : [];

    // if (incomingQuestionsRaw.length === 0) return;

    // --- TOGGLE LOGIC: Check if we should remove instead of add ---
    const getDeepIds = (list: any[]): string[] => {
      const ids: string[] = [];
      list.forEach((item) => {
        if (item.questions && Array.isArray(item.questions)) {
          // Check if it's a question or a context
          if (item.questions.length > 0 && typeof item.questions[0] === 'object' && 'questions' in item.questions[0]) {
            // It's a context/category, recurse
            ids.push(...getDeepIds(item.questions));
          } else {
            // It's a list of questions
            item.questions.forEach((q: any) => ids.push(q.id));
          }
        } else {
          // It might be a direct question object in some structures, or flat list
          // But usually questionList is Category[] -> Question[]/Context[]
          // Use safe check
          if (item.id) ids.push(item.id);
        }
      });
      return ids;
    };

    // Helper to find question IDs in a generic nested structure (incoming doc)
    const extractIds = (items: any[]): string[] => {
      const ids: string[] = [];
      items.forEach(item => {
        if (item.questions && Array.isArray(item.questions)) {
          // Recurse for contexts
          ids.push(...extractIds(item.questions));
        } else if (item.id) {
          ids.push(item.id);
        }
      });
      return ids;
    };

    const incomingIds = extractIds(incomingQuestionsRaw);
    const existingIds = new Set(getDeepIds(currentList));

    const allIncomingExist = incomingIds.length > 0 && incomingIds.every(id => existingIds.has(id));

    if (allIncomingExist) {
      // REMOVE LOGIC
      const removeRecursive = (list: any[]): any[] => {
        return list.map(item => {
          if (item.questions && Array.isArray(item.questions)) {
            // Filter questions
            const filteredQuestions = item.questions.filter((q: any) => !incomingIds.includes(q.id));

            // If items were removed, or we need to recurse (for contexts)
            const deepFiltered = removeRecursive(filteredQuestions);

            return { ...item, questions: deepFiltered };
          }
          return item;
        }).filter(item => {
          // Remove empty groups/contexts if they became empty
          if (item.questions && Array.isArray(item.questions) && item.questions.length === 0) {
            if (item.type === "section-breaker" || item.type === "settings") return true;
            return false;
          }
          return true;
        });
      };

      const updatedList = removeRecursive(currentList);
      onChange(updatedList);
      return;
    }


    const incomingIsNested =
      incomingQuestionsRaw.length > 0 &&
      typeof incomingQuestionsRaw[0] === "object" &&
      "questions" in incomingQuestionsRaw[0];

    const isPassageBased = doc.type === "passage-based" || incomingIsNested;

    const normalizeContext = (ctx: any) => {
      const qs = ensureArray(ctx.questions);
      return {
        id:
          ctx.id ?? ctx.name ?? `ctx_${Math.random().toString(36).slice(2, 8)}`,
        name: ctx.name ?? "",
        // preserve child's own type (or derive from first question if missing)
        type: ctx.type ?? qs[0]?.type ?? "unknown",
        isRTL: ctx.isRTL !== undefined ? ctx.isRTL : (doc.isRTL ? true : undefined),
        questions: qs,
      };
    };

    const existingCategory = currentList.find((c: any) => c.id === categoryId);

    // --- CASE: existing category ---
    if (existingCategory) {
      const existingIsNested =
        Array.isArray(existingCategory.questions) &&
        existingCategory.questions.length > 0 &&
        typeof existingCategory.questions[0] === "object" &&
        "questions" in existingCategory.questions[0];

      // If either incoming OR existing is nested, work in nested-context mode
      if (isPassageBased || existingIsNested) {
        // Normalize existing contexts:
        const existingContexts = existingIsNested
          ? existingCategory.questions.map((c: any) =>
            // if they already look like contexts, normalize them
            typeof c === "object" && "questions" in c
              ? normalizeContext(c)
              : {
                id: c.id ?? `${categoryId}__ctx`,
                name: c.name ?? "",
                type: c.type ?? existingCategory.type ?? "unknown",
                questions: Array.isArray(c.questions)
                  ? c.questions
                  : ensureArray(c),
              },
          )
          : // convert flat list into a default context so we can merge nested incoming cleanly
          [
            {
              id: `${categoryId}__default`,
              name: existingCategory.name ?? "",
              type: existingCategory.type ?? "unknown",
              questions: Array.isArray(existingCategory.questions)
                ? existingCategory.questions
                : ensureArray(existingCategory.questions),
            },
          ];

        // normalize incoming contexts
        const incomingContexts = incomingQuestionsRaw.map((c: any) =>
          typeof c === "object" && "questions" in c
            ? normalizeContext(c)
            : normalizeContext({ questions: c }),
        );

        const mergedContexts = existingContexts.slice();

        incomingContexts.forEach((incCtx: any) => {
          // match by id first, then by name fallback
          const idx = mergedContexts.findIndex(
            (c: any) =>
              c.id === incCtx.id ||
              (c.name && incCtx.name && c.name === incCtx.name),
          );

          if (idx === -1) {
            // insert whole incoming context (preserves incCtx.type)
            mergedContexts.push(incCtx);
          } else {
            const existingNestedQs = Array.isArray(
              mergedContexts[idx].questions,
            )
              ? mergedContexts[idx].questions
              : [];
            const incomingQs = Array.isArray(incCtx.questions)
              ? incCtx.questions
              : ensureArray(incCtx.questions);

            // avoid duplicates by question id
            const newQs = incomingQs.filter(
              (iq: any) => !existingNestedQs.some((eq: any) => eq.id === iq.id),
            );

            if (newQs.length > 0) {
              mergedContexts[idx] = {
                ...mergedContexts[idx],
                // keep existing context type if present, otherwise use incoming context type
                type:
                  mergedContexts[idx].type ??
                  incCtx.type ??
                  incomingQs[0]?.type ??
                  "unknown",
                questions: [...existingNestedQs, ...newQs],
              };
            }
          }
        });

        const updated = currentList.map((c: any) =>
          c.id === categoryId ? { ...c, questions: mergedContexts } : c,
        );
        onChange(updated);
        return;
      }

      // --- existing is flat & incoming is flat ---
      const existingQs = Array.isArray(existingCategory.questions)
        ? existingCategory.questions
        : ensureArray(existingCategory.questions);

      const incomingQs = incomingQuestionsRaw.flatMap((x: any) =>
        Array.isArray(x.questions)
          ? x.questions
          : x.questions
            ? [x.questions]
            : [x],
      );

      const newQs = incomingQs.filter(
        (iq: any) => !existingQs.some((eq: any) => eq.id === iq.id),
      );
      if (newQs.length === 0) return;

      const updated = currentList.map((c: any) =>
        c.id === categoryId
          ? { ...c, questions: [...existingQs, ...newQs] }
          : c,
      );
      onChange(updated);
      return;
    }

    // --- CASE: create new category ---
    if (isPassageBased) {
      const incomingContexts = incomingQuestionsRaw.map((ctx: any) =>
        typeof ctx === "object" && "questions" in ctx
          ? normalizeContext(ctx)
          : normalizeContext({ questions: ctx }),
      );

      const newCategory = {
        id: categoryId,
        name: categoryName,
        type: doc.type ?? "passage-based",
        text: doc.text ?? "",
        isRTL: doc.isRTL ? true : undefined,
        questions: incomingContexts, // each context keeps its own .type
      };
      onChange([...currentList, newCategory]);
      return;
    } else {
      const flatIncomingQs = incomingQuestionsRaw.flatMap((x: any) =>
        Array.isArray(x.questions)
          ? x.questions
          : x.questions
            ? [x.questions]
            : [x],
      );

      const newCategory = {
        id: categoryId,
        name: categoryName,
        // derive type from doc or from first question if doc.type missing
        type: doc.type ?? flatIncomingQs[0]?.type ?? "unknown",
        isRTL: doc.isRTL ? true : undefined,
        questions: flatIncomingQs,
      };
      onChange([...currentList, newCategory]);
      return;
    }

    // --- CASE: handle new category type ---
    if (doc.type === "stack-fraction") {
      const flatIncomingQs = incomingQuestionsRaw.flatMap((x: any) =>
        Array.isArray(x.questions)
          ? x.questions
          : x.questions
            ? [x.questions]
            : [x],
      );

      const newCategory = {
        id: categoryId,
        name: categoryName,
        type: "stack-fraction",
        isRTL: doc.isRTL ? true : undefined,
        questions: flatIncomingQs,
      };

      const updated = existingCategory
        ? currentList.map((c: any) =>
          c.id === categoryId
            ? {
              ...c,
              questions: [
                ...ensureArray(c.questions),
                ...flatIncomingQs.filter(
                  (iq: any) =>
                    !ensureArray(c.questions).some(
                      (eq: any) => eq.id === iq.id,
                    ),
                ),
              ],
            }
            : c,
        )
        : [...currentList, newCategory];

      onChange(updated);
      return;
    }
  };

  if (chapterLoading) return <Loader />;
  return (
    <aside className="flex h-[80vh] w-full flex-col rounded-xl bg-white p-5 shadow-md lg:fixed lg:h-[calc(100vh-100px)] lg:w-[420px] lg:overflow-hidden">
      {/* Fixed Header Section */}
      <div className="shrink-0 space-y-2 border-b border-gray-100 pb-3">
        {addedBooks && addedBooks.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto px-1 pb-2 scrollbar-none">
            <button
              onClick={() => onBookChange?.(urlBookId || "")}
              className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold transition-colors ${currentBookId === urlBookId
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
            >
              Main Book
            </button>
            {addedBooks.map((book) => (
              <button
                key={book.id}
                onClick={() => onBookChange?.(book.id)}
                className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold transition-colors ${currentBookId === book.id
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
              >
                {book.name.slice(0, 15)}...
              </button>
            ))}
          </div>
        )}
        <div className="flex h-10 items-center gap-2">
          {/* Search Section */}
          <div
            className={`relative flex items-center transition-all duration-300 ease-in-out ${isSearchOpen ? "w-full" : "w-10"
              }`}
          >
            {isSearchOpen ? (
              // Expanded Search Input
              <div className="relative w-full">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  disabled={!canSearch}
                  autoFocus
                  type="text"
                  placeholder="Search..."
                  className="w-full rounded-full border border-gray-300 bg-gray-50 py-2 pl-4 pr-9 text-sm text-black focus:border-blue-500 focus:outline-none"
                />
                <button
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearch("");
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              // Collapsed Search Icon
              <button
                onClick={() => canSearch && setIsSearchOpen(true)}
                className={`flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200 ${!canSearch ? "cursor-not-allowed opacity-50" : ""
                  }`}
                title={canSearch ? "Search" : "Search Locked"}
              >
                {canSearch ? <Search size={20} /> : <span className="text-xs">🔒</span>}
              </button>
            )}
          </div>

          {/* Filter Dropdowns (Hidden when search is open) */}
          {!isSearchOpen && (
            <div className="flex flex-1 items-center gap-2 overflow-hidden transition-all duration-300">
              {/* Chapter Select */}
              <div className="relative min-w-0 flex-1">
                <select
                  value={chapter?.id || ""}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    const selectedChapter = chapters?.find(
                      (d: any) => String(d.id) === selectedId
                    );
                    setChapter(selectedChapter);
                    setLessonId("");
                  }}
                  disabled={!canFilter}
                  className="w-full appearance-none truncate rounded-full bg-gray-100 px-3 py-2 pr-8 text-sm text-black focus:outline-none disabled:opacity-50"
                >
                  <option value="">{canFilter ? "Chapter" : "Locked"}</option>
                  {chapters?.map((chap: any) => (
                    <option value={chap.id} key={chap.id}>
                      {chap.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              </div>

              {/* Lesson Select (Conditionally rendered) */}
              {chapter && (
                <div className="relative min-w-0 flex-1">
                  <select
                    value={lessonId}
                    onChange={(e) => setLessonId(e.target.value)}
                    disabled={!canFilter}
                    className="w-full appearance-none truncate rounded-full bg-gray-100 px-3 py-2 pr-8 text-sm text-black focus:outline-none disabled:opacity-50"
                  >
                    <option value="">{canFilter ? "Lesson" : "Locked"}</option>
                    {chapter?.lesson?.map((lesson: any) => (
                      <option value={lesson.id} key={lesson.id}>
                        {lesson.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Scrollable List Section */}
      <div className="flex-1 overflow-y-auto pr-1">
        {isLoading ? (
          <Loader />
        ) : (
          <Accordion.Root
            type="single"
            collapsible
            className="space-y-2"
          >
            {data?.map((category) => (
              <Accordion.Item
                key={category.id}
                value={category.id}
                className="flex-1 rounded-md border shadow-sm"
              >
                <Accordion.Header
                  className={`sticky top-0 z-30 flex w-[calc(100%-25px)] !flex-row items-center justify-between border-b border-gray-100 bg-white/95 p-3 font-medium text-gray-900 backdrop-blur-sm hover:bg-gray-50 ${isRTL ? "text-rtl" : ""
                    }`}
                  dir={isRTL ? "rtl" : "ltr"}
                  style={{
                    direction: isRTL ? "rtl" : "ltr",
                    flexDirection: "row",
                    textAlign: isRTL ? "right" : "left",
                  }}
                >
                  <Accordion.Trigger className={`flex-1 ${isRTL ? "!text-right" : "!text-left"}`} style={{ textAlign: isRTL ? "right" : "left" }}>
                    {category.name} ({category.questions?.length || 0})
                  </Accordion.Trigger>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCategoryRTL(category.id);
                      }}
                      className={`rounded p-1 ${getRTLState(category.id) ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                      title={getRTLState(category.id) ? "Switch to LTR" : "Switch to RTL"}
                    >
                      <ArrowLeftRight className="h-4 w-4" />
                    </button>
                    <Accordion.Trigger>
                      <ChevronDown className="AccordionChevron h-4 w-4 transition-transform duration-200" />
                    </Accordion.Trigger>
                  </div>
                </Accordion.Header>
                <Accordion.Content className={`space-y-1 px-4 py-3 text-sm text-gray-700 ${getRTLState(category.id) ? "text-right" : "text-left"}`} dir={getRTLState(category.id) ? "rtl" : "ltr"}>
                  <GroupedQuestionsRenderer
                    category={category}
                    questionList={questionList}
                    addQuestion={addQuestion}
                    renderStackFractionVertical={renderStackFractionVertical}
                    generateId={generateId}
                  />
                </Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        )}
      </div>
    </aside>
  );
}
