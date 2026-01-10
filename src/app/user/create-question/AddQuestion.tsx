"use client";
import Button from "@/components/shared/Button";
import Loader from "@/components/shared/Loader";
import SubscriptionUpgradeModal from "@/components/shared/SubscriptionUpgradeModal";
import { useDebounce } from "@/hooks/use-debounce";
import { useFeatureAccess } from "@/hooks/use-feature-access";
import { useRTL } from "@/hooks/use-rtl";
import {
  useGetSetDetailsQuery,
  useUpdateSetQuestionMutation,
} from "@/redux/services/userService";
import { setLocalStorage } from "@/utils/localStorage";
import * as Accordion from "@radix-ui/react-accordion";
import clsx from "clsx";
import {
  ArrowLeftRight,
  Lock,
  PlusIcon,
  SortAscIcon,
  StopCircle,
  X,
} from "lucide-react";
import dynamic from "next/dynamic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ReactSortable } from "react-sortablejs";
import { toast } from "react-toastify";
import CategoryList from "./CategoryList";
import LineBasedView from "./components/LineBasedView";
import NoCategoryView from "./components/NoCategoryView";
import ObjectiveBasedView from "./components/ObjectiveBasedView";
import PassagedBasedView from "./components/PassageBasedQuestion";
import { useQuestionContext } from "./components/QuestionContext";
import StackFractionView from "./components/StackFractionView";
import TableBasedView from "./components/TableBasedView";
import WordBasedView from "./components/WordBaseView";
import SectionBreakerView from "./components/SectionBreakerView";
import BookSelector from "./components/BookSelector";

// Simple Modal Component
const Modal = ({ open, children }: { open: boolean; children: React.ReactNode }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative h-[80vh] w-[90vw] max-w-4xl rounded-xl bg-white shadow-2xl">
        {children}
      </div>
    </div>
  );
};

const AddQuestion = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = useSearchParams();
  const bookId = query.get("bookId");
  const setId = query.get("set_id");
  const { isRTL, toggleRTL } = useRTL();

  // All hooks must be called unconditionally before any early returns
  const [activeTab, setActiveTab] = useState<string>("all");
  const [drawer, setDrawer] = useState(false);
  const {
    data: set,
    isLoading,
    error: setError,
  } = useGetSetDetailsQuery(setId as string, {
    skip: !setId || setId === "undefined",
    refetchOnMountOrArgChange: true, // Always refetch when setId changes or component remounts
  });
  const [updateApi, { isLoading: loading }] = useUpdateSetQuestionMutation();
  const { questionList, setQuestionList, updateGroupOrder } =
    useQuestionContext();
  const [editable, setEditable] = useState(false);
  const {
    hasFeature,
    package: userPackage,
    isLoading: featureLoading,
  } = useFeatureAccess();
  const [lockedFeatureModal, setLockedFeatureModal] = useState<{
    isOpen: boolean;
    feature: string;
    featureKey: string;
  }>({ isOpen: false, feature: "", featureKey: "" });
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const canDragDrop = hasFeature("draganddrop");
  const canEdit = hasFeature("editandcustomize");
  const canAddQuestions = hasFeature("addingquestions");
  const canPreview = hasFeature("preview");
  const canSearch = hasFeature("search");
  const canFilter = hasFeature("filter");
  const canAddingMarks = hasFeature("addingmarks");

  // State for Book Selector and Section Menu
  const [isSectionMenuOpen, setIsSectionMenuOpen] = useState(false);
  const [showBookSelector, setShowBookSelector] = useState(false);
  const [addedBooks, setAddedBooks] = useState<any[]>([]);
  const [activeBookId, setActiveBookId] = useState<string>("");

  // Initialize activeBookId with the current bookId from params
  useEffect(() => {
    if (bookId) {
      setActiveBookId(bookId as string);
    }
  }, [bookId]);

  const handleBookSelect = (book: any) => {
    // Check if authentic to add
    if (!book || !book.id) return;

    // Check if already added
    if (!addedBooks.some(b => b.id === book.id) && book.id !== bookId) {
      const newAddedBooks = [...addedBooks, book];
      setAddedBooks(newAddedBooks);

      // Persist to settings group
      setQuestionList((prev: any) => {
        const settingsIndex = prev.findIndex((g: any) => g.id === "settings");
        if (settingsIndex !== -1) {
          const updated = [...prev];
          updated[settingsIndex] = { ...updated[settingsIndex], addedBooks: newAddedBooks };
          return updated;
        } else {
          return [...prev, { id: "settings", type: "settings", name: "settings", questions: [], addedBooks: newAddedBooks }];
        }
      });
    }

    setActiveBookId(book.id);
    setShowBookSelector(false);
    setIsSectionMenuOpen(false);
  };

  // Track if questionList was just initialized from server data (skip auto-save)
  const isInitialLoadRef = useRef(true);
  const initialLoadTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentSetIdRef = useRef<string | null>(setId || null);

  // Update currentSetIdRef when setId changes
  useEffect(() => {
    if (setId) {
      currentSetIdRef.current = setId;
    }
  }, [setId]);

  // Debounce questionList changes for auto-save (wait 1 second after user stops editing)
  const debouncedQuestionList = useDebounce(questionList, 1000);

  const handleUpdate = useCallback(
    async (auto?: boolean) => {
      try {
        if (auto && isInitialLoadRef.current) {
          return;
        }

        if (set?.id && questionList && set.id === currentSetIdRef.current) {
          await updateApi({ id: set.id, body: questionList }).unwrap();
          if (!auto) {
            toast.success("Question updated!");
            // Sync lastSavedStateRef to prevent redundant auto-save
            lastSavedStateRef.current = JSON.stringify(questionList);
          }
        }
      } catch (error: any) {
        toast.error(error?.data?.message);
      }
    },
    [set?.id, questionList, updateApi],
  );

  const handleDragStart = useCallback(() => {
    if (!canDragDrop && !lockedFeatureModal.isOpen) {
      setLockedFeatureModal({
        isOpen: true,
        feature: "Drag and Drop",
        featureKey: "draganddrop",
      });
    }
  }, [canDragDrop, lockedFeatureModal.isOpen]);

  const addSectionBreaker = () => {
    if (!canAddQuestions) {
      setLockedFeatureModal({
        isOpen: true,
        feature: "Adding Questions",
        featureKey: "addingquestions",
      });
      return;
    }
    const newGroup = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: "section-breaker",
      name: "Section Name",
      questions: [],
      isRTL: isRTL,
    };
    setQuestionList([...questionList, newGroup]);
  };

  const addSectionBreakerText = () => {
    addSectionBreaker();
    setIsSectionMenuOpen(false);
  };

  const loadedSetIdRef = useRef<string | null>(null);
  const lastSavedStateRef = useRef<string>("");

  useEffect(() => {
    if (set && Array.isArray(set?.questions)) {
      if (loadedSetIdRef.current === set.id) {
        return;
      }

      loadedSetIdRef.current = set.id;
      currentSetIdRef.current = set.id;
      isInitialLoadRef.current = true;

      const settingsGroup = set.questions.find((g: any) => g.id === "settings");
      if (settingsGroup) {
        if (settingsGroup.isRTL !== undefined && settingsGroup.isRTL !== isRTL) {
          toggleRTL();
        }
        if (settingsGroup.addedBooks && Array.isArray(settingsGroup.addedBooks)) {
          setAddedBooks(settingsGroup.addedBooks);
        }
      }

      setQuestionList(set.questions);
      lastSavedStateRef.current = JSON.stringify(set.questions);

      if (initialLoadTimerRef.current) clearTimeout(initialLoadTimerRef.current);
      initialLoadTimerRef.current = setTimeout(() => {
        isInitialLoadRef.current = false;
        initialLoadTimerRef.current = null;
      }, 2000);

    } else if (set && loadedSetIdRef.current !== set.id) {
      loadedSetIdRef.current = set.id;
      currentSetIdRef.current = set.id;
      isInitialLoadRef.current = true;

      setQuestionList([]);
      lastSavedStateRef.current = JSON.stringify([]);

      if (initialLoadTimerRef.current) clearTimeout(initialLoadTimerRef.current);
      initialLoadTimerRef.current = setTimeout(() => {
        isInitialLoadRef.current = false;
        initialLoadTimerRef.current = null;
      }, 2000);
    }
  }, [set, setQuestionList]);

  useEffect(() => {
    if (isInitialLoadRef.current) return;
    if (!currentSetIdRef.current || !set?.id || set.id !== currentSetIdRef.current) return;
    if (!debouncedQuestionList) return;

    const currentStateString = JSON.stringify(debouncedQuestionList);
    if (currentStateString === lastSavedStateRef.current) return;

    const autoSave = async () => {
      try {
        await updateApi({
          id: set.id,
          body: debouncedQuestionList,
        }).unwrap();
        lastSavedStateRef.current = currentStateString;
      } catch (error: any) {
        toast.error(
          "Auto-save failed: " +
          (error?.data?.message || error?.message || "Unknown error"),
        );
      }
    };
    autoSave();
  }, [debouncedQuestionList, set?.id, updateApi]);

  if (!setId || setId === "undefined") {
    return (
      <div className="container flex min-h-screen flex-col items-center justify-center gap-4">
        <div className="max-w-md rounded-lg border border-yellow-200 bg-yellow-50 p-6 text-center">
          <h2 className="mb-2 text-xl font-bold text-yellow-900">
            ⚠️ Missing Parameter
          </h2>
          <p className="mb-4 text-yellow-700">
            Question set ID is missing. Please navigate back and try again.
          </p>
          <Button
            onClick={() => router.back()}
            className="bg-yellow-600 text-white"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const categories = [...new Set(questionList.map((g) => g))];

  useEffect(() => {
    if (set?.printed) {
      router.replace(`/user/print/${set.id}`);
    }
  }, [set, router]);

  if (setError) {
    const errorMessage =
      (setError as any)?.data?.message || "Failed to load question set";
    return (
      <div className="container flex min-h-screen flex-col items-center justify-center gap-4">
        <div className="max-w-md rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <h2 className="mb-2 text-xl font-bold text-red-900">❌ Error</h2>
          <p className="mb-4 text-red-700">{errorMessage}</p>
          <Button
            onClick={() => router.back()}
            className="bg-red-600 text-white"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) return <Loader />;

  return (
    <div className="container flex flex-col gap-4">
      {/* Left Column */}
      <div className="flex flex-wrap gap-2 md:gap-4">
        <Button
          disabled={loading}
          loading={loading}
          onClick={() => handleUpdate(false)}
          className="flex-1 md:flex-none text-sm md:text-base px-2 md:px-4"
        >
          সেভ
        </Button>
        <Button
          onClick={async () => {
            if (!canPreview) {
              setShowSubscriptionModal(true);
              return;
            }
            setPreviewLoading(true);

            try {
              await handleUpdate(false);
            } catch (e) {
              console.error("Save failed", e);
            }

            const fullPath = `${pathname}?${searchParams.toString()}`;
            setLocalStorage("back_url", fullPath);
            router.replace(`/user/print/${set.id}`);
          }}
          loading={previewLoading}
          className="relative overflow-visible bg-blue-500 flex-1 md:flex-none text-sm md:text-base px-2 md:px-4"
        >
          📄 ফরমেট দেখুন
          {!canPreview && (
            <Lock className="absolute -right-1.5 -top-1.5 h-4 w-4 rounded-full bg-orange-500 p-0.5 text-white shadow-md" />
          )}
        </Button>
        <Button
          onClick={() => setEditable((d) => !d)}
          Icon={editable ? <StopCircle /> : <SortAscIcon />}
          className="flex-1 md:flex-none text-sm md:text-base px-2 md:px-4"
        >
          {!editable ? "সাজান" : "বন্ধ"}
        </Button>
        <Button
          type="button"
          onClick={() => {
            toggleRTL();
            setQuestionList((prev: any) => {
              const settingsIndex = prev.findIndex((g: any) => g.id === "settings");
              const newIsRTL = !isRTL;
              if (settingsIndex !== -1) {
                const updated = [...prev];
                updated[settingsIndex] = { ...updated[settingsIndex], isRTL: newIsRTL };
                return updated;
              } else {
                return [...prev, { id: "settings", type: "settings", name: "settings", isRTL: newIsRTL, questions: [] }];
              }
            });
          }}
          className={`p-2 ${isRTL ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          title={isRTL ? "Switch to LTR" : "Switch to RTL (Arabic)"}
        >
          <ArrowLeftRight className="h-5 w-5" />
        </Button>
      </div>
      <div className="relative grid min-h-full grid-cols-1 flex-col gap-3 lg:grid-cols-5">
        <div
          ref={ref}
          className="w-full flex-1 rounded-xl bg-white p-4 shadow-md lg:col-span-3"
        >
          <div className="mb-4 flex w-full items-center gap-2 border-b border-gray-100 pb-3">
            <div
              className={`flex flex-1 gap-2 overflow-x-auto min-w-0 ${isRTL ? "text-rtl" : ""}`}
            >
              <button
                onClick={() => setActiveTab("all")}
                className={`rounded-full px-4 py-1 text-sm font-semibold ${activeTab === "all"
                  ? "bg-purple-700 text-white"
                  : "bg-gray-200 text-gray-700"
                  }`}
              >
                সকল
              </button>
              {categories
                .filter((cat: any) => cat.id !== "settings") // Filter settings tab
                .map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveTab(cat.id)}
                    className={`min-w-max rounded-full px-4 py-1 text-sm font-semibold ${cat.id === activeTab
                      ? "bg-purple-700 text-white"
                      : "bg-gray-200 text-gray-700"
                      }`}
                  >
                    {cat?.name}
                  </button>
                ))}
            </div>

            {/* Section Breaker / Add Button Menu */}
            <div className="relative">
              <button
                onClick={() => setIsSectionMenuOpen(!isSectionMenuOpen)}
                className="group relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500 text-white transition-colors hover:bg-red-600"
                title="Add Section Break"
              >
                <PlusIcon className={`h-5 w-5 transition-transform ${isSectionMenuOpen ? "rotate-45" : ""}`} />
              </button>

              {isSectionMenuOpen && (
                <div className="absolute right-0 top-full z-10 mt-2 w-48 rounded-lg border border-gray-100 bg-white p-1 shadow-lg">
                  <button
                    onClick={addSectionBreakerText}
                    className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <span className="font-semibold">Text</span>
                    <span className="text-xs text-gray-400">(Section Break)</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowBookSelector(true);
                      setIsSectionMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <span className="font-semibold">Add another book</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Book Selector Modal */}
          <Modal open={showBookSelector}>
            <BookSelector
              onSelect={handleBookSelect}
              onCancel={() => setShowBookSelector(false)}
            />
          </Modal>

          <Accordion.Root type="single" collapsible>
            <ReactSortable
              list={questionList?.filter((d) => d.id !== "settings").map((d) => ({ id: d.id }))}
              setList={updateGroupOrder}
              animation={200}
              disabled={!editable || !canDragDrop || activeTab !== "all"}
              handle=".group-header"
              className="space-y-6"
              group={{ name: "groups", pull: true, put: true }}
              delay={2}
              delayOnTouchOnly={true}
              onStart={handleDragStart}
            >
              {Array.isArray(questionList) &&
                questionList
                  ?.filter((g) => g.id !== "settings")
                  ?.filter((g) => activeTab === "all" || g.id === activeTab)
                  .map((group, groupIndex) => {
                    // Logic to calculate the correct index logic
                    const displayedQuestions = questionList
                      ?.filter((g) => g.id !== "settings")
                      ?.filter((g) => activeTab === "all" || g.id === activeTab);

                    let visualIndex = 0;
                    if (displayedQuestions) {
                      for (let i = 0; i < groupIndex; i++) {
                        const g = displayedQuestions[i];
                        if (g.type !== "section-breaker" && g.type !== "settings") {
                          visualIndex++;
                        }
                      }
                    }

                    return group?.type === "word" ? (
                      <WordBasedView
                        group={group}
                        index={visualIndex}
                        key={group.id}
                        lang={set?.type}
                        disabled={!canEdit}
                        isArrangeMode={editable}
                        canAddingMarks={canAddingMarks}
                        globalRTL={isRTL}
                        onLockedFeature={(feature, featureKey) => {
                          setLockedFeatureModal({
                            isOpen: true,
                            feature,
                            featureKey,
                          });
                        }}
                      />
                    ) : group?.type === "single-question" ||
                      group?.type === "fill-gap" ||
                      group?.type === "right-wrong" ? (
                      <LineBasedView
                        group={group}
                        index={visualIndex}
                        key={group.id}
                        lang={set?.type}
                        disabled={!canEdit}
                        canDragDrop={canDragDrop}
                        isArrangeMode={editable}
                        canAddingMarks={canAddingMarks}
                        globalRTL={isRTL}
                        onLockedFeature={(feature, featureKey) => {
                          setLockedFeatureModal({
                            isOpen: true,
                            feature,
                            featureKey,
                          });
                        }}
                      />
                    ) : group?.type === "table" ? (
                      <TableBasedView
                        group={group}
                        index={visualIndex}
                        key={group.id}
                        lang={set?.type}
                        disabled={!canEdit}
                        isArrangeMode={editable}
                        canAddingMarks={canAddingMarks}
                        globalRTL={isRTL}
                        onLockedFeature={(feature, featureKey) => {
                          setLockedFeatureModal({
                            isOpen: true,
                            feature,
                            featureKey,
                          });
                        }}
                      />
                    ) : group?.type === "objective" ? (
                      <ObjectiveBasedView
                        group={group}
                        index={visualIndex}
                        key={group.id}
                        lang={set?.type}
                        disabled={!canEdit}
                        isArrangeMode={editable}
                        canAddingMarks={canAddingMarks}
                        globalRTL={isRTL}
                        onLockedFeature={(feature, featureKey) => {
                          setLockedFeatureModal({
                            isOpen: true,
                            feature,
                            featureKey,
                          });
                        }}
                      />
                    ) : group?.type === "passage-based" ? (
                      <PassagedBasedView
                        group={group}
                        index={visualIndex}
                        key={group.id}
                        lang={set?.type}
                        disabled={!canEdit}
                        isArrangeMode={editable}
                        canAddingMarks={canAddingMarks}
                        globalRTL={isRTL}
                        onLockedFeature={(feature, featureKey) => {
                          setLockedFeatureModal({
                            isOpen: true,
                            feature,
                            featureKey,
                          });
                        }}
                      />
                    ) : group?.type === "section-breaker" ? (
                      <SectionBreakerView
                        group={group}
                        isArrangeMode={editable}
                        key={group.id}
                      />
                    ) : group?.type === "stack-fraction" ? (
                      <StackFractionView
                        group={group}
                        index={visualIndex}
                        key={group.id}
                        lang={set?.type}
                        disabled={!canEdit}
                        canDragDrop={canDragDrop}
                        isArrangeMode={editable}
                        canAddingMarks={canAddingMarks}
                        globalRTL={isRTL}
                        onLockedFeature={(feature, featureKey) => {
                          setLockedFeatureModal({
                            isOpen: true,
                            feature,
                            featureKey,
                          });
                        }}
                      />
                    ) : (
                      <NoCategoryView
                        group={group}
                        index={visualIndex}
                        key={group.id}
                        lang={set?.type}
                        disabled={!canEdit}
                        canAddingMarks={canAddingMarks}
                        isArrangeMode={editable}
                        globalRTL={isRTL}
                        onLockedFeature={(feature, featureKey) => {
                          setLockedFeatureModal({
                            isOpen: true,
                            feature,
                            featureKey,
                          });
                        }}
                      />
                    );
                  })}
            </ReactSortable>
          </Accordion.Root>
        </div>

        {/* Right Column */}
        <div className="hidden lg:col-span-2 lg:block">
          <CategoryList
            questionList={questionList}
            addedBooks={addedBooks}
            activeBookId={activeBookId}
            onBookChange={setActiveBookId}
            activeBookName={addedBooks.find(b => b.id === activeBookId)?.name}
            onChange={(d) => {
              setQuestionList(d);
            }}
            canAddQuestions={canAddQuestions}
            canSearch={canSearch}
            canFilter={canFilter}
            onLockedFeature={(feature, featureKey) => {
              if (featureKey === "addingquestions") {
                setShowSubscriptionModal(true);
              } else if (featureKey === "search") {
                setShowSubscriptionModal(true);
              } else if (featureKey === "filter") {
                setShowSubscriptionModal(true);
              } else {
                setShowSubscriptionModal(true);
              }
            }}
          />
        </div>
        <div className="fixed bottom-4 right-2 lg:hidden">
          <Button
            onClick={() => setDrawer(true)}
            className="h-11 w-11 rounded-full p-0"
          >
            <PlusIcon />
          </Button>
        </div>
        <div
          className={clsx(
            "black:bg-gray-900 fixed inset-y-0 left-0 z-50 w-screen transform overflow-y-auto bg-white p-4 shadow-lg transition-transform duration-300 xl:hidden",
            drawer ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="black:text-white text-lg font-semibold text-gray-800">
              Categories
            </h3>
            <Button onClick={() => setDrawer(false)} className="w-auto p-1">
              <X />
            </Button>
          </div>
          <CategoryList
            questionList={questionList}
            onChange={(d) => setQuestionList(d)}
            addedBooks={addedBooks}
            activeBookId={activeBookId}
            onBookChange={setActiveBookId}
            activeBookName={addedBooks.find(b => b.id === activeBookId)?.name}
            canAddQuestions={canAddQuestions}
            canSearch={canSearch}
            canFilter={canFilter}
            onLockedFeature={(feature, featureKey) => {
              if (featureKey === "addingquestions") {
                setShowSubscriptionModal(true);
              } else if (featureKey === "search") {
                setShowSubscriptionModal(true);
              } else if (featureKey === "filter") {
                setShowSubscriptionModal(true);
              } else {
                setShowSubscriptionModal(true);
              }
            }}
          />
        </div>
      </div>

      {/* Subscription Upgrade Modal - for all locked features */}
      <SubscriptionUpgradeModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
      />
    </div>
  );
};

export default dynamic(() => Promise.resolve(AddQuestion), { ssr: false });
