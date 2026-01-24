"use client";
import Button from "@/components/shared/Button";
import Editor from "@/components/shared/Editor";
import TextArea from "@/components/shared/TextArea";
import {
  ArrowLeftRight,
  Search,
  CheckCircle2,
  Bookmark,
  Layers,
  FileText,
  Hash,
  Plus as PlusIcon,
  Table as TableIcon,
  HelpCircle,
  LucideIcon
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import { useGetCategoriesQuery } from "./CategoryList";
import { useGetBookCategoriesQuery } from "@/redux/services/adminServices/chapterLesson";
import purseText, { stringifyQuestions } from "./parsseFunction";
import {
  useCreateQuestionMutation,
  useUpdateQuestionMutation,
} from "@/redux/services/adminServices/questionService";
import { cn } from "@/lib/utils";
import ObjectiveView from "./ObjectiveView";
import StackFractionView from "./StackFractionView";
import TextWithFractions from "./TextWithFractions";
import PassageView from "./PassageView";

// Mapping category types to icons and colors
const typeMeta: Record<string, { icon: LucideIcon; color: string; bgColor: string }> = {
  objective: { icon: HelpCircle, color: "text-purple-600", bgColor: "bg-purple-50" },
  "single-question": { icon: FileText, color: "text-blue-600", bgColor: "bg-blue-50" },
  table: { icon: TableIcon, color: "text-orange-600", bgColor: "bg-orange-50" },
  "fill-gap": { icon: Hash, color: "text-emerald-600", bgColor: "bg-emerald-50" },
  "passage-based": { icon: Layers, color: "text-amber-600", bgColor: "bg-amber-50" },
  word: { icon: HelpCircle, color: "text-indigo-600", bgColor: "bg-indigo-50" },
  "stack-fraction": { icon: Hash, color: "text-rose-600", bgColor: "bg-rose-50" },
  "right-wrong": { icon: CheckCircle2, color: "text-red-600", bgColor: "bg-red-50" },
  no: { icon: HelpCircle, color: "text-gray-600", bgColor: "bg-gray-50" },
};

const placeholders: Record<string, { en: string; ar: string }> = {
  "single-question": {
    en: "Question 1\nQuestion 2\n(Each line is a separate question)",
    ar: "السؤال 1\nالسؤال 2\n(كل سطر هو سؤال منفصل)"
  },
  "fill-gap": {
    en: "Sentence 1 [gap/options]\nSentence 2 [gap/options]\n(Each line is one question)",
    ar: "الجملة 1 [فجوة/خيارات]\nالجملة 2 [فجوة/خيارات]\n(كل سطر هو سؤال واحد)"
  },
  "right-wrong": {
    en: "Statement 1\nStatement 2\n(Each line is one statement)",
    ar: "عبارة 1\nعبارة 2\n(كل سطر عبارة واحدة)"
  },
  no: {
    en: "Instruction 1\nInstruction 2\n(Each line is one instruction/step)",
    ar: "تعليمة 1\nتعليمة 2\n(كل سطر هو تعليمة/خطوة واحدة)"
  },
  objective: {
    en: "First line is the Question?\nOption 1, Option 2, Option 3, Option 4\n(Next line: Options separated by comma)",
    ar: "السطر الأول هو السؤال؟\nالخيار 1، الخيار 2، الخيار 3، الخيار 4\n(السطر التالي: الخيارات مفصولة بفواصل)"
  },
  "stack-fraction": {
    en: "Numerator 1;; Denominator 1\n//\nNumerator 2;; Denominator 2\n(Format: ;; devider, // for new question on new line)",
    ar: "البسط 1;; المقام 1\n//\nالبسط 2;; المقام 2\n(التنسيق: ;; للفصل، // للسؤال الجديد في سطر جديد)"
  },
  word: {
    en: "word1, word2, word3\n(Format: Comma separated list of words)",
    ar: "كلمة1، كلمة2، كلمة3\n(التنسيق: قائمة كلمات مفصولة بفواصل)"
  },
};

const PreviewList = ({ items, type }: { items: any[]; type: string }) => (
  <div className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-300">
    {items.map((item, idx) => (
      <div key={idx} className="relative group/preview">
        <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-4 h-px bg-gray-200 dark:bg-gray-800" />
        <div className="absolute -left-12 top-1/2 -translate-y-1/2 text-[9px] font-black text-gray-300 group-hover/preview:text-blue-500 transition-colors uppercase">
          {items.length - idx}
        </div>
        {type === "objective" ? (
          <ObjectiveView doc={item} />
        ) : type === "stack-fraction" ? (
          <StackFractionView doc={item} />
        ) : (
          <div className="bg-white dark:bg-gray-900 p-3 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm antialiased text-black text-[13px] font-bold">
            <TextWithFractions text={item.question} />
          </div>
        )}
      </div>
    ))}
  </div>
);

const QuestionForm = ({
  close,
  lessonId,
  bookId,
  data,
}: {
  close: () => void;
  lessonId: string;
  bookId: string;
  data: any;
}) => {
  const { data: allCategories = [], isLoading: loadingAll } = useGetCategoriesQuery();
  const { data: bookCategories = [], isLoading: loadingBook } = useGetBookCategoriesQuery(bookId);

  const isSidebarLoading = loadingAll || loadingBook;

  const [categoryId, setCategoryId] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [error, setError] = useState("");
  const [isRTL, setIsRTL] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [addQuestion, { isLoading }] = useCreateQuestionMutation();
  const [updateQuestion, { isLoading: loading }] = useUpdateQuestionMutation();

  const filteredAll = useMemo(() =>
    allCategories.filter((cat) =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    ), [allCategories, searchTerm]
  );

  const filteredShortcuts = useMemo(() =>
    bookCategories.filter((cat) =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    ), [bookCategories, searchTerm]
  );

  const selectedCategory = useMemo(() =>
    allCategories.find((d) => d.id === categoryId) || bookCategories.find((d) => d.id === categoryId),
    [allCategories, bookCategories, categoryId]
  );
  const type = selectedCategory?.type;

  const itemsOutPassage = useMemo(() => {
    const merged = [...allCategories];
    bookCategories.forEach(bc => {
      if (!merged.some(ac => ac.id === bc.id)) merged.push(bc);
    });
    return merged
      ?.filter((d) => d.type !== "passage-based" && d.type !== "no")
      .map((d) => ({
        label: d.name,
        value: d.id,
        type: d.type,
      }));
  }, [allCategories, bookCategories]);

  useEffect(() => {
    if (data) {
      if (!data?.categoryId) {
        setCategoryId(data?.id);
        const ds = stringifyQuestions(data.questions, data.type);
        setQuestionText(ds);
      } else {
        setCategoryId(data.categoryId);
      }
    }
  }, [data]);

  const handleSingleSubmit = async () => {
    if (!categoryId) {
      toast.error("Please select a category from the sidebar");
      return;
    }
    if (!type) {
      toast.error("Category configuration error. Please try again or pick another.");
      return;
    }
    if (!questionText.trim()) {
      setError("Question is required");
      return;
    }
    const payload = {
      context: undefined,
      question: purseText(questionText, type || "", categoryId, lessonId, isRTL),
      categoryId,
      lessonId,
    };
    try {
      await addQuestion(payload).unwrap();
      toast.success("Added successful");
      setError("");
      close();
    } catch (error: any) {
      toast.error(error?.data?.message);
    }
  };

  const handleSingleUpdateSubmit = async () => {
    if (!questionText.trim()) {
      setError("Question is required");
      return;
    }
    const payload = {
      context: undefined,
      question: purseText(questionText, type || "", categoryId, lessonId, isRTL),
      categoryId,
      lessonId,
    };
    try {
      await updateQuestion({ categoryId, lessonId, body: payload }).unwrap();
      toast.success("Updated successful");
      setError("");
      close();
    } catch (error: any) {
      toast.error(error?.data?.message);
    }
  };


  const livePreviewData = useMemo(() => {
    if (!questionText.trim() || !type || !categoryId) return [];
    const parsed = purseText(questionText, type, categoryId, lessonId, isRTL);
    if (!parsed) return [];
    // Transform to match view component expectations if necessary
    const transformed = parsed.map(q => ({
      ...q,
      options: q.option?.map(o => ({ name: o })) // For ObjectiveView
    }));
    return transformed.reverse(); // Show last first
  }, [questionText, type, categoryId, lessonId, isRTL]);

  return (
    <div className="flex flex-col h-[85vh] -m-6 overflow-hidden bg-gray-50 dark:bg-gray-950 antialiased tracking-tight">
      {/* Sleek Header Section */}
      <div className="flex items-center justify-between px-8 py-4 border-b bg-white dark:bg-gray-900 shadow-sm z-20">
        <div className="flex flex-col">
          <h2 className="text-lg font-black text-black dark:text-white flex items-center gap-2 tracking-tighter">
            {data ? (
              <span className="flex items-center gap-2"><FileText className="h-4 w-4 text-blue-600" /> Update Question</span>
            ) : (
              <span className="flex items-center gap-2"><PlusIcon className="h-4 w-4 text-emerald-600" /> Draft New Question</span>
            )}
          </h2>
          <p className="text-[10px] text-gray-800 font-black uppercase tracking-widest opacity-80">Content Studio</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <Button
              type="button"
              mode="outline"
              onClick={() => setIsRTL(false)}
              className={cn(
                "px-3 h-8 text-[10px] font-bold rounded-md border-none transition-all",
                !isRTL ? "bg-white text-blue-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
              )}
            >
              LTR
            </Button>
            <Button
              type="button"
              mode="outline"
              onClick={() => setIsRTL(true)}
              className={cn(
                "px-3 h-8 text-[10px] font-bold rounded-md border-none transition-all",
                isRTL ? "bg-white text-blue-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
              )}
            >
              RTL
            </Button>
          </div>

          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1" />

          <Button
            mode="outline"
            onClick={close}
            className="h-10 px-5 text-xs font-bold border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Button>

          {type && type !== "passage-based" && (
            <Button
              loading={data ? loading : isLoading}
              onClick={data ? handleSingleUpdateSubmit : handleSingleSubmit}
              className="h-10 px-8 text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/25"
            >
              {data ? "Commit Changes" : "Create Now"}
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Organized Sidebar */}
        <div className="w-80 flex flex-col border-r bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
          <div className="p-5 border-b bg-gray-50/30">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 h-4 w-4 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Find category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-[12px] border-gray-300 dark:border-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:bg-gray-950 font-bold text-black"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-8 custom-scrollbar">
            {/* Book Shortcuts */}
            {filteredShortcuts.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <Bookmark className="h-3 w-3 text-blue-600 fill-blue-600" />
                    <span className="text-[10px] font-black text-blue-800 uppercase tracking-widest">Book History</span>
                  </div>
                  <span className="text-[8px] font-bold bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">{filteredShortcuts.length}</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {filteredShortcuts.map((cat) => {
                    const Meta = typeMeta[cat.type] || { icon: HelpCircle, color: "text-gray-400", bgColor: "bg-gray-50" };
                    return (
                      <button
                        key={`shortcut-${cat.id}`}
                        onClick={() => setCategoryId(cat.id)}
                        className={cn(
                          "w-full flex items-center gap-2 px-3 py-2 text-[12px] font-bold rounded-lg transition-all border text-left group",
                          categoryId === cat.id
                            ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                            : "bg-white border-gray-200 text-black hover:border-blue-300 hover:bg-blue-50/30 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                        )}
                      >
                        <div className={cn("p-1.5 rounded-md shrink-0", categoryId === cat.id ? "bg-white/20" : Meta.bgColor)}>
                          <Meta.icon className={cn("h-3 w-3", categoryId === cat.id ? "text-white" : Meta.color)} />
                        </div>
                        <span className="truncate flex-1">{cat.name}</span>
                        {categoryId === cat.id && <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Catalog List */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <Layers className="h-3 w-3 text-gray-700" />
                <span className="text-[10px] font-black text-gray-800 uppercase tracking-widest">Master Catalog</span>
              </div>
              <div className="space-y-1">
                {filteredAll.map((cat) => {
                  if (bookCategories.some(bc => bc.id === cat.id) && !searchTerm) return null;
                  const Meta = typeMeta[cat.type] || { icon: HelpCircle, color: "text-gray-400", bgColor: "bg-gray-50" };

                  return (
                    <button
                      key={cat.id}
                      onClick={() => setCategoryId(cat.id)}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all text-left",
                        categoryId === cat.id
                          ? "bg-blue-600 text-white shadow-sm dark:bg-blue-600"
                          : "text-black opacity-70 hover:opacity-100 hover:bg-gray-100 hover:text-blue-700 dark:text-gray-400 dark:hover:bg-gray-800"
                      )}
                    >
                      <div className={cn("h-5 w-5 rounded flex items-center justify-center shrink-0", categoryId === cat.id ? "bg-white/10" : "bg-gray-200 dark:bg-gray-800")}>
                        <Meta.icon className={cn("h-2.5 w-2.5", categoryId === cat.id ? "text-white" : "text-gray-600")} />
                      </div>
                      <span className="truncate flex-1">{cat.name}</span>
                      {categoryId === cat.id && <CheckCircle2 className="h-3 w-3" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {isSidebarLoading ? (
              <div className="flex flex-col items-center justify-center py-20 animate-pulse space-y-4">
                <div className="h-10 w-10 bg-gray-100 dark:bg-gray-800 rounded-full" />
                <div className="h-2 w-24 bg-gray-100 dark:bg-gray-800 rounded" />
              </div>
            ) : filteredAll.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-300 space-y-2">
                <Search className="h-8 w-8 stroke-1" />
                <p className="text-[10px] font-bold uppercase tracking-tighter italic">Zero matches</p>
              </div>
            ) : null}
          </div>
        </div>

        {/* Clean Main Content Area */}
        <div className="flex-1 flex flex-col items-center overflow-hidden h-full">
          {!categoryId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 space-y-6 max-w-md text-center p-10 animate-in fade-in zoom-in duration-500">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-100 dark:bg-blue-900/30 blur-3xl rounded-full" />
                <div className="relative bg-white dark:bg-gray-900 p-10 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-2xl">
                  <Bookmark className="h-20 w-20 text-blue-500 stroke-[1]" />
                </div>
              </div>
              <div className="space-y-2 relative">
                <p className="text-xl font-black text-black dark:text-white tracking-tighter">Initialize Editor</p>
                <p className="text-[11px] font-bold leading-relaxed text-gray-700 dark:text-gray-400 max-w-[280px]">Pick a category to begin drafting your content with pattern-specific guidance.</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 w-full max-w-4xl flex flex-col gap-6 overflow-y-auto px-8 py-6 custom-scrollbar">
              {/* Active Context Card - Compact Version */}
              <div className="bg-blue-50/50 dark:bg-blue-900/20 px-5 py-3 rounded-2xl border border-blue-100 dark:border-blue-900/50 shadow-sm flex items-center gap-4 antialiased">
                <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0 shadow-inner", typeMeta[type || ""]?.bgColor || "bg-gray-100")}>
                  {(() => {
                    const ActiveIcon = typeMeta[type || ""]?.icon || HelpCircle;
                    return <ActiveIcon className={cn("h-5 w-5", typeMeta[type || ""]?.color || "text-gray-400")} />;
                  })()}
                </div>
                <div className="flex-1">
                  <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-0.5 opacity-70">Active Pattern</p>
                  <h3 className="text-base font-black text-black dark:text-white tracking-tighter leading-none uppercase">
                    {selectedCategory?.name}
                  </h3>
                </div>
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-[8px] font-black bg-gray-100 dark:bg-gray-800 text-black px-2 py-0.5 rounded-md uppercase tracking-widest border border-gray-300 dark:border-gray-700">{type}</span>
                </div>
              </div>

              {type === "passage-based" ? (
                <div className="animate-in slide-in-from-bottom-4 duration-500">
                  <TypeFormatter
                    categoryId={categoryId}
                    lessonId={lessonId}
                    data={data}
                    category={itemsOutPassage}
                    close={close}
                    isRTL={isRTL}
                    setIsRTL={setIsRTL}
                  />
                </div>
              ) : (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                  {type === "table" ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between px-2">
                        <label className="text-[10px] font-black text-gray-800 uppercase tracking-widest">Structured Content Editor</label>
                        <TableIcon className="h-4 w-4 text-gray-700" />
                      </div>
                      <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm min-h-[550px]">
                        <Editor value={questionText} onChange={setQuestionText} />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-[1.3fr_0.7fr] gap-8 items-start">
                      <div className="space-y-4 sticky top-0">
                        <div className="flex items-center justify-between px-2">
                          <label className="text-[10px] font-black text-gray-800 uppercase tracking-widest">Question Repository</label>
                          <div className="flex items-center gap-3">
                            {questionText && (
                              <button
                                onClick={() => setQuestionText("")}
                                className="text-[9px] font-black text-red-500 uppercase hover:underline"
                              >
                                Clear Draft
                              </button>
                            )}
                            {error && <span className="text-[10px] text-red-600 font-black uppercase bg-red-50 px-2 py-0.5 rounded">{error}</span>}
                          </div>
                        </div>
                        <TextArea
                          link="/"
                          rows={12}
                          placeholder={
                            type && placeholders[type]
                              ? (isRTL ? placeholders[type].ar : placeholders[type].en)
                              : (isRTL ? "اكتب السؤال هنا بوضوح تام..." : "Enter the question content...")
                          }
                          value={questionText}
                          onChange={(e) => setQuestionText(e.target.value)}
                          error={""}
                          className={cn(
                            "text-base leading-relaxed font-bold p-6 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-800 rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-500/5 transition-all outline-none min-h-[300px] text-black antialiased",
                            isRTL ? "text-right" : "text-left"
                          )}
                        />
                        <p className="px-6 text-[10px] text-gray-500 font-bold italic">Tip: Use `[1/2]` for vertical fractions.</p>
                      </div>

                      <div className="space-y-6">
                        <div className="flex items-center gap-3 px-2">
                          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                          <label className="text-[10px] font-black text-gray-800 uppercase tracking-widest">Live Evolution Preview</label>
                        </div>

                        {livePreviewData.length > 0 ? (
                          <div className="pl-12 border-l-2 border-dashed border-gray-100 dark:border-gray-800 py-1">
                            <PreviewList items={livePreviewData} type={type} />
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-3xl opacity-40">
                            <FileText className="h-10 w-10 text-gray-300 mb-3" />
                            <p className="text-[10px] font-black text-gray-400 uppercase">Awaiting Draft Entry</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionForm;

// Optimized Sub-Question Form for Passage Based
type QuestionItem = {
  type: string;
  question: string;
  id: string;
};
interface PROPS {
  category: { label: string; value: string; type: string }[];
  categoryId: string;
  lessonId: string;
  close: () => void;
  data: any | undefined;
  isRTL: boolean;
  setIsRTL: (value: boolean) => void;
}

const TypeFormatter = ({
  category,
  categoryId,
  lessonId,
  data,
  close,
  isRTL,
  setIsRTL,
}: PROPS) => {
  const [context, setContext] = useState("");
  const [questions, setQuestions] = useState<QuestionItem[]>([
    { id: "", question: "", type: "word" },
  ]);
  const [addQuestion, { isLoading }] = useCreateQuestionMutation();
  const [updateQuestion, { isLoading: loading }] = useUpdateQuestionMutation();
  const [errors, setErrors] = useState<{
    context?: string;
    questions?: string[];
  }>({});

  useEffect(() => {
    if (data) {
      setContext(data.text);
      let arr: QuestionItem[] = [];
      data.questions?.map((d: any) => {
        const ds = stringifyQuestions(d.questions, d.type);
        arr.push({ id: d.id, question: ds, type: d.type });
      });
      setQuestions(arr);
    }
  }, [data]);

  const handleChangeQuestion = (
    index: number,
    key: keyof QuestionItem,
    value: string,
  ) => {
    const updated = [...questions];
    updated[index][key] = value;
    setQuestions(updated);
  };

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      { type: "single-question", question: "", id: "" },
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    if (window.confirm("Delete this sub-question draft?")) {
      const updated = [...questions];
      updated.splice(index, 1);
      setQuestions(updated);
    }
  };

  const validate = () => {
    const errs: { context?: string; questions?: string[] } = {};
    if (!context.trim()) errs.context = "Passage is required";

    const qErrors: string[] = [];
    questions.forEach((q, idx) => {
      if (!q.type) qErrors[idx] = "Question type is required";
      else if (!q.question.trim()) qErrors[idx] = "Question text is required";
      else if (!q.id) qErrors[idx] = "Question id is required";
      else qErrors[idx] = "";
    });

    if (qErrors.some((e) => e)) errs.questions = qErrors;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    let arr: any = [];
    questions?.map((d) => {
      const newArr = purseText(d.question, d.type, d.id, lessonId, isRTL);
      newArr?.map((s) => arr.push(s));
    });
    const payload = { context, question: arr, categoryId, lessonId };
    try {
      await addQuestion(payload).unwrap();
      toast.success("Batch published successful");
      close();
    } catch (error: any) {
      toast.error(error?.data?.message);
    }
  };

  const handleSubmitUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    let arr: any = [];
    questions?.map((d) => {
      const newArr = purseText(d.question, d.type, d.id, lessonId, isRTL);
      newArr?.map((s) => arr.push(s));
    });
    const payload = { context, question: arr, categoryId, lessonId };
    try {
      await updateQuestion({
        categoryId,
        contextId: data.id,
        lessonId,
        body: payload,
      }).unwrap();
      toast.success("All updates committed");
      close();
    } catch (error: any) {
      toast.error(error?.data?.message);
    }
  };

  return (
    <form
      onSubmit={data ? handleSubmitUpdate : handleSubmit}
      className="flex flex-col gap-10 pb-10"
    >
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-3 antialiased">
        <div className="flex items-center justify-between px-1">
          <label className="text-[10px] font-black text-gray-800 uppercase tracking-widest">Master Context</label>
          <Layers className="h-4 w-4 text-amber-600" />
        </div>
        <TextArea
          rows={5}
          placeholder={isRTL ? "اكتب مقطع السياق الرئيسي هنا..." : "Draft the comprehensive passage context here..."}
          value={context}
          onChange={(e) => setContext(e.target.value)}
          error={errors.context}
          className={cn(
            "text-base font-bold p-4 bg-gray-50/50 focus:bg-white dark:bg-gray-950/20 border-gray-200 dark:border-gray-800 rounded-xl transition-all text-black",
            isRTL ? "text-right" : "text-left"
          )}
        />
      </div>

      <div className="space-y-8">
        <div className="flex items-center gap-6">
          <span className="text-[10px] font-black text-gray-800 uppercase tracking-[0.3em] whitespace-nowrap">Sequential Sub-Questions</span>
          <div className="h-px w-full bg-gradient-to-r from-gray-300 to-transparent dark:from-gray-700" />
        </div>

        {questions.map((item, index) => (
          <div key={index} className="group rounded-2xl bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 p-6 relative shadow-sm hover:border-blue-300 transition-all duration-300 antialiased">
            <div className="absolute top-4 left-4 text-[9px] font-black text-gray-500 group-hover:text-blue-600">#{index + 1}</div>

            <button
              type="button"
              onClick={() => handleRemoveQuestion(index)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white hover:bg-red-500 transition-all h-7 w-7 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800"
            >
              ✕
            </button>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-gray-700 uppercase tracking-widest px-2">Sub-Category</label>
                  <select
                    value={item.id}
                    onChange={(e) => {
                      const val = e.target.value;
                      handleChangeQuestion(index, "id", val);
                      const type = category?.find((d) => d.value === val)?.type;
                      if (type) handleChangeQuestion(index, "type", type);
                    }}
                    className="w-full h-10 px-4 bg-gray-100 dark:bg-gray-800 border-none rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-black text-[11px] uppercase text-black"
                  >
                    <option value="">Pattern Profile</option>
                    {category.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-gray-700 uppercase tracking-widest px-2">Work Area</label>
                {item.type === "table" ? (
                  <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-white shadow-inner min-h-[350px]">
                    <Editor
                      value={item.question}
                      onChange={(e) => handleChangeQuestion(index, "question", e)}
                    />
                  </div>
                ) : (
                  <TextArea
                    rows={4}
                    placeholder={
                      item.id && placeholders[item.type]
                        ? (isRTL ? placeholders[item.type].ar : placeholders[item.type].en)
                        : (isRTL ? "أدخل تفاصيل السؤال الفرعي..." : "Enter sub-question details...")
                    }
                    value={item.question}
                    onChange={(e) => handleChangeQuestion(index, "question", e.target.value)}
                    error={""}
                    className={cn(
                      "font-bold text-sm p-4 bg-gray-100/50 dark:bg-gray-800/20 focus:bg-white border-transparent focus:border-blue-100 rounded-xl transition-all text-black",
                      isRTL ? "text-right" : "text-left"
                    )}
                  />
                )}

                {/* Sub-Question Live Preview */}
                {(() => {
                  if (!item.question.trim() || !item.type) return null;
                  const parsed = purseText(item.question, item.type, item.id, lessonId, isRTL);
                  if (!parsed || parsed.length === 0) return null;
                  const transformed = parsed.map(q => ({
                    ...q,
                    options: q.option?.map(o => ({ name: o }))
                  })).reverse();
                  return (
                    <div className="mt-4 pl-12 border-l-2 border-dashed border-gray-100 dark:border-gray-800 py-1">
                      <div className="flex items-center gap-2 mb-3 text-[9px] font-black text-emerald-600 uppercase">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Draft Evolution
                      </div>
                      <PreviewList items={transformed} type={item.type} />
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        ))}

        <div className="pt-4 flex justify-center">
          <Button
            type="button"
            mode="outline"
            onClick={handleAddQuestion}
            className="h-16 px-12 rounded-[2rem] border-2 border-dashed border-gray-300 text-gray-600 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50/30 transition-all font-black uppercase text-xs tracking-[0.2em]"
          >
            + Add Sub-Question Entry
          </Button>
        </div>
      </div>

      <div className="flex gap-6 pt-10 border-t items-center justify-between sticky bottom-0 bg-gray-50/90 dark:bg-gray-950/90 backdrop-blur-xl py-6 px-10 rounded-t-[3rem] shadow-2xl z-30">
        <div className="hidden lg:flex flex-col">
          <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">Global Action</span>
          <span className="text-xs font-black text-gray-900">Apply all changes to batch</span>
        </div>
        <div className="flex gap-4 flex-1 max-w-xl">
          <Button mode="outline" onClick={close} className="flex-1 h-12 rounded-xl font-black uppercase tracking-widest text-[11px] border-gray-300">Cancel</Button>
          <Button loading={data ? loading : isLoading} type="submit" className="flex-1 h-12 rounded-xl shadow-md font-black uppercase tracking-widest text-[11px]">
            {data ? "Commit Batch" : "Publish Batch"}
          </Button>
        </div>
      </div>
    </form>
  );
};
