"use client";

import Loader from "@/components/shared/Loader";
import { useDebounce } from "@/hooks/use-debounce";
import { useRTL } from "@/hooks/use-rtl";
import {
    useGetUserChapterQuery,
    useGetUserQuestionsQuery,
} from "@/redux/services/userService";
import * as Accordion from "@radix-ui/react-accordion";
import {
    ArrowLeftRight,
    ChevronDown,
    Menu,
    PanelRight,
    PanelRightClose,
    PanelRightOpen,
    Search,
    X,
    ArrowLeft
} from "lucide-react";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import { FiBookOpen } from "react-icons/fi";
import ReadingModeQuestionRenderer from "../../create-question/components/ReadingModeQuestionRenderer";
import { QuestionProvider } from "../../create-question/components/QuestionContext";
import TextWithFractions from "../../create-question/components/TextWithFractions";
import StackedFractionDisplay from "../../create-question/components/StackedFractionDisplay";

const ReadingPage = () => {
    const router = useRouter();
    const params = useParams();
    const bookId = params?.bookId as string;
    const { isRTL } = useRTL();

    const [search, setSearch] = useState("");
    const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Default open on large screens
    const debouncedSearch = useDebounce(search, 500);

    const [selectedChapterId, setSelectedChapterId] = useState<string>("");
    const [selectedLessonId, setSelectedLessonId] = useState<string>("");
    const [activeChapterId, setActiveChapterId] = useState<string>("");
    const [activeLessonId, setActiveLessonId] = useState<string>("");

    // Fetch Chapters for Sidebar
    const { data: chapters, isLoading: chaptersLoading } = useGetUserChapterQuery(
        bookId,
        { skip: !bookId }
    );

    // Fetch Questions for Main Content
    const { data: questions, isLoading: questionsLoading } = useGetUserQuestionsQuery(
        {
            bookId,
            chapterId: selectedChapterId,
            lessonId: selectedLessonId,
            search: debouncedSearch,
        },
        { skip: !bookId }
    );

    // Toggle Category RTL State
    const [categoryRTLStates, setCategoryRTLStates] = useState<Record<string, boolean>>({});
    const toggleCategoryRTL = (categoryId: string) => {
        setCategoryRTLStates((prev) => ({
            ...prev,
            [categoryId]: !prev[categoryId],
        }));
    };
    const getRTLState = (categoryId: string) => {
        // Check if category has explicit RTL setting from DB (if available in data)
        const category = questions?.find((c: any) => c.id === categoryId);
        if (category?.isRTL) return true;
        return categoryRTLStates[categoryId] !== undefined ? categoryRTLStates[categoryId] : isRTL;
    };

    // Process and Group Data: Chapter -> Lesson -> Category -> Questions
    const groupedContent = useMemo(() => {
        if (!questions) return [];

        // Create a lookup for Chapter/Lesson order from the 'chapters' data which controls the sidebar
        const chapterOrder = new Map<string, number>();
        const lessonOrder = new Map<string, number>();

        if (chapters) {
            chapters.forEach((c: any, cIdx: number) => {
                chapterOrder.set(c.id, cIdx);
                if (c.lesson) {
                    c.lesson.forEach((l: any, lIdx: number) => {
                        lessonOrder.set(l.id, lIdx);
                    });
                }
            });
        }

        // 1. Flatten all questions from the API's Category-based response
        const allQuestions: any[] = [];
        questions.forEach((cat: any) => {
            if (cat.questions) {
                cat.questions.forEach((q: any) => {
                    // Attach original category info to the question for rendering later
                    allQuestions.push({ ...q, _originalCategory: cat });
                });
            }
        });

        // 2. Group by Chapter
        const params = {
            chapterId: selectedChapterId,
            lessonId: selectedLessonId,
        };

        // Filter if needed (though API already filters, this ensures safety/consistency)
        let filteredQuestions = allQuestions;
        if (params.chapterId) {
            filteredQuestions = filteredQuestions.filter(q => q.lesson?.chapterId === params.chapterId || q.lesson?.chapter?.id === params.chapterId);
        }
        if (params.lessonId) {
            filteredQuestions = filteredQuestions.filter(q => q.lessonId === params.lessonId || q.lesson?.id === params.lessonId);
        }

        const chaptersMap = new Map();

        filteredQuestions.forEach((q) => {
            const chapId = q.lesson?.chapter?.id || "unknown_chapter";
            const chapName = q.lesson?.chapter?.name || "Other Chapters";
            // Use order from map, fallback to a large number
            const chapSortIdx = chapterOrder.has(chapId) ? chapterOrder.get(chapId) : 9999;

            if (!chaptersMap.has(chapId)) {
                chaptersMap.set(chapId, {
                    id: chapId,
                    name: chapName,
                    sortIdx: chapSortIdx,
                    lessons: new Map(),
                });
            }

            const chapGroup = chaptersMap.get(chapId);
            const lessonId = q.lesson?.id || "unknown_lesson";
            const lessonName = q.lesson?.name || "Other Lessons";
            // Use order from map, fallback to a large number
            const lessonSortIdx = lessonOrder.has(lessonId) ? lessonOrder.get(lessonId) : 9999;

            if (!chapGroup.lessons.has(lessonId)) {
                chapGroup.lessons.set(lessonId, {
                    id: lessonId,
                    name: lessonName,
                    sortIdx: lessonSortIdx,
                    categories: new Map(),
                });
            }

            const lessonGroup = chapGroup.lessons.get(lessonId);
            const catId = q._originalCategory?.id || "unknown_cat";
            const catName = q._originalCategory?.name || "Questions";

            if (!lessonGroup.categories.has(catId)) {
                lessonGroup.categories.set(catId, {
                    ...q._originalCategory, // Keep original category props (type, isRTL, etc.)
                    questions: [],
                });
            }

            lessonGroup.categories.get(catId).questions.push(q);
        });

        // Convert Maps to Arrays and Sort using the captured sortIdx
        return Array.from(chaptersMap.values())
            .map((chap: any) => ({
                ...chap,
                lessons: Array.from(chap.lessons.values())
                    .map((lesson: any) => ({
                        ...lesson,
                        categories: Array.from(lesson.categories.values()),
                    }))
                    .sort((a: any, b: any) => (a.sortIdx ?? 9999) - (b.sortIdx ?? 9999) || a.name.localeCompare(b.name)),
            }))
            .sort((a: any, b: any) => (a.sortIdx ?? 9999) - (b.sortIdx ?? 9999) || a.name.localeCompare(b.name));
    }, [questions, chapters, selectedChapterId, selectedLessonId]);

    // Scroll Spy Logic
    useEffect(() => {
        const handleScroll = () => {
            if (selectedChapterId) return; // Don't spy if filtering is active

            const chapters = document.querySelectorAll(".chapter-section");
            const lessons = document.querySelectorAll(".lesson-section");

            // Helper to check visibility
            const isVisible = (el: Element) => {
                const rect = el.getBoundingClientRect();
                // Simple check: Is the top of the element near the top of the viewport?
                // Or is it covering a significant portion?
                // Let's pick the one that is closest to the top but not fully scrolled past.
                return rect.top >= 0 && rect.top < window.innerHeight / 2;
            };

            // Find current chapter
            // Actually, a better "spy" logic is usually: which section is currently at the top?
            // checking rect.top <= offset and rect.bottom >= offset

            const offset = 150; // Top offset for sticky headers + header

            let currentChap = "";
            let currentLesson = "";

            // Check Chapters
            // We iterate in reverse to find the last one that has passed the threshold
            // Or just iterate standard and find the first one that is "active"

            // Strategy: Find the element whose top is closest to 0 (can be negative if we scrolled past start)
            // but whose bottom is still > 0.

            let foundChap = false;
            for (const chap of Array.from(chapters)) {
                const rect = chap.getBoundingClientRect();
                // Check if the chapter is effectively the "current" one reading
                // It's current if its bottom is below the offset (hasn't scrolled past up)
                // AND its top is above the "look ahead" (hasn't stayed fully below)
                // Using a slightly larger "look ahead" for smooth transition
                if (rect.bottom > offset + 20 && rect.top < window.innerHeight / 2) {
                    currentChap = chap.getAttribute("data-id") || "";
                    foundChap = true;
                    break; // Stop at the first one from top
                }
            }

            for (const lesson of Array.from(lessons)) {
                const rect = lesson.getBoundingClientRect();
                if (rect.bottom > offset + 20 && rect.top < window.innerHeight / 2) {
                    currentLesson = lesson.getAttribute("data-id") || "";
                    break; // Stop at the first one
                }
            }

            if (currentChap) setActiveChapterId(currentChap);
            if (currentLesson) setActiveLessonId(currentLesson);
        };

        const container = document.querySelector("main > div.overflow-y-auto");
        if (container) {
            container.addEventListener("scroll", handleScroll);
            return () => container.removeEventListener("scroll", handleScroll);
        }
    }, [groupedContent, selectedChapterId]);


    if (chaptersLoading) return <Loader />;

    return (
        <QuestionProvider>
            <div className="flex h-screen w-full flex-col overflow-hidden bg-gray-50 md:flex-row-reverse">
                {/* Mobile Header */}
                <div className="flex items-center justify-between border-b bg-white p-4 shadow-sm md:hidden">
                    <div className="flex items-center gap-2">
                        <button onClick={() => router.back()} className="text-gray-600">
                            <X />
                        </button>
                        <span className="font-bold text-gray-800">Reading Mode</span>
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="rounded p-2 text-gray-600 hover:bg-gray-100"
                    >
                        <Menu />
                    </button>
                </div>

                {/* Sidebar (Chapters & Lessons) */}
                <aside
                    className={`fixed inset-y-0 left-0 z-40 w-full transform flex-col bg-white shadow-lg transition-all duration-300 md:relative md:flex md:overflow-hidden ${isSidebarOpen ? "translate-x-0 md:w-80 md:translate-x-0" : "-translate-x-full md:w-0 md:translate-x-full md:opacity-0"
                        }`}
                >
                    <div className="w-full md:w-80 h-full flex flex-col">
                        <div className="flex h-16 items-center justify-between border-b px-4">
                            <div className="flex items-center gap-2 text-purple-700">
                                <FiBookOpen size={20} />
                                <h2 className="text-lg font-bold">Chapters</h2>
                            </div>
                            <button
                                onClick={() => setIsSidebarOpen(false)}
                                className="md:hidden"
                            >
                                <X className="text-gray-500" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4">
                            <div className="space-y-2">
                                <button
                                    onClick={() => {
                                        setSelectedChapterId("");
                                        setSelectedLessonId("");
                                        if (window.innerWidth < 768) setIsSidebarOpen(false);
                                    }}
                                    className={`w-full rounded-lg px-4 py-2 text-left font-medium transition-colors ${!selectedChapterId
                                        ? "bg-purple-100 text-purple-700"
                                        : "text-gray-700 hover:bg-gray-100"
                                        }`}
                                >
                                    All Chapters
                                </button>

                                {chapters?.map((chapter: any) => {
                                    const isActiveChap = selectedChapterId === chapter.id || (!selectedChapterId && activeChapterId === chapter.id);
                                    return (
                                        <div key={chapter.id} className="space-y-1">
                                            <button
                                                onClick={() => {
                                                    setSelectedChapterId(chapter.id);
                                                    setSelectedLessonId("");
                                                    if (window.innerWidth < 768) setIsSidebarOpen(false);
                                                }}
                                                className={`w-full rounded-lg px-4 py-2 text-left font-medium transition-colors ${isActiveChap
                                                    ? "bg-purple-100 text-purple-700"
                                                    : "text-gray-700 hover:bg-gray-100"
                                                    }`}
                                            >
                                                {chapter.name}
                                            </button>

                                            {/* Lessons Sub-list */}
                                            {isActiveChap && (
                                                <div className="ml-4 space-y-1 border-l-2 border-purple-100 pl-2">
                                                    {chapter.lesson?.map((lesson: any) => {
                                                        const isActiveLesson = selectedLessonId === lesson.id || (!selectedLessonId && activeLessonId === lesson.id);
                                                        return (
                                                            <button
                                                                key={lesson.id}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedLessonId(lesson.id);
                                                                    if (window.innerWidth < 768) setIsSidebarOpen(false);
                                                                }}
                                                                className={`w-full rounded-lg px-4 py-1.5 text-left text-sm transition-colors ${isActiveLesson
                                                                    ? "bg-purple-50 text-purple-700 font-medium"
                                                                    : "text-gray-600 hover:bg-gray-50"
                                                                    }`}
                                                            >
                                                                {lesson.name}
                                                            </button>
                                                        )
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex flex-1 flex-col overflow-hidden">
                    {/* Search Header */}
                    <div className="flex h-16 items-center border-b bg-white px-6 shadow-sm gap-4">
                        <button
                            onClick={() => router.push("/user/books")}
                            className="hidden md:flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors mr-2"
                            title="Back to Library"
                        >
                            <ArrowLeft size={20} />
                            <span className="font-medium text-sm">Library</span>
                        </button>

                        <div className="relative w-full max-w-md">
                            <input
                                type="text"
                                placeholder="Search in book..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full rounded-full border border-gray-300 bg-gray-50 py-2 pl-10 pr-4 text-sm focus:border-purple-500 focus:outline-none"
                            />
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        </div>

                        <div className="flex-1" />

                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="hidden md:flex items-center justify-center p-2 rounded-md hover:bg-gray-100 text-gray-500"
                            title={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
                        >
                            {isSidebarOpen ? <PanelRightClose size={20} /> : <PanelRight size={20} />}
                        </button>
                    </div>

                    {/* Questions List */}
                    <div className="flex-1 overflow-y-auto bg-gray-50 px-4 pb-4 pt-0 md:px-8 md:pb-8 md:pt-0">
                        {questionsLoading ? (
                            <div className="flex h-full items-center justify-center">
                                <Loader />
                            </div>
                        ) : (
                            <div className="mx-auto max-w-4xl space-y-10">
                                {!groupedContent || groupedContent.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                                        <FiBookOpen size={48} className="mb-4 opacity-50" />
                                        <p>No questions found.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-8">
                                        {groupedContent.map((chapter: any) => (
                                            <div key={chapter.id} data-id={chapter.id} className="chapter-section relative rounded-2xl bg-white shadow-sm ring-1 ring-gray-200/50">
                                                {/* Chapter Sticky Header */}
                                                <div className="sticky top-0 z-30 flex items-center justify-center border-b border-gray-100 bg-white/95 py-2 backdrop-blur-sm">
                                                    <h2 className="text-xl font-bold text-gray-800">{chapter.name}</h2>
                                                </div>

                                                <div className="px-4 pb-4 md:px-6 md:pb-6">
                                                    {chapter.lessons.map((lesson: any) => (
                                                        <div key={lesson.id} data-id={lesson.id} className="lesson-section mb-8 last:mb-0">
                                                            {/* Lesson Sticky Header (Sub-level) */}
                                                            <div className="sticky top-[45px] z-20 -mx-4 flex justify-center border-b border-gray-50 bg-white/95 px-4 py-1.5 text-sm font-semibold text-purple-600 backdrop-blur-sm md:-mx-6 md:px-6">
                                                                {lesson.name}
                                                            </div>

                                                            <div className="space-y-6">
                                                                {lesson.categories.map((category: any) => (
                                                                    <div key={category.id}>
                                                                        {/* Category Heder */}
                                                                        <div className={`sticky top-[78px] z-10 flex items-center gap-2 bg-gray-50/95 py-2 backdrop-blur-sm ${getRTLState(category.id) ? "flex-row-reverse" : "flex-row"}`}>
                                                                            <h4 className="text-base font-bold uppercase tracking-wide text-blue-600">{category.name}</h4>
                                                                            <div className="h-px flex-1 bg-gray-200"></div>
                                                                        </div>

                                                                        {/* Reuse the Renderer to render the questions of this category */}
                                                                        <div className={getRTLState(category.id) ? "rtl" : "ltr"} dir={getRTLState(category.id) ? "rtl" : "ltr"}>
                                                                            <ReadingModeQuestionRenderer
                                                                                questions={category.questions}
                                                                                categoryType={category.type}
                                                                                renderStackFractionVertical={(q) => <StackedFractionDisplay text={q} />}
                                                                                readOnly={true}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </QuestionProvider>
    );
};

export default dynamic(() => Promise.resolve(ReadingPage), { ssr: false });
