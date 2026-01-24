"use client";
import ModalLayout from "@/components/Layouts/ModalLayout";
import Button from "@/components/shared/Button";
import Loader from "@/components/shared/Loader";
import SubscriptionUpgradeModal from "@/components/shared/SubscriptionUpgradeModal";
import { useFeatureAccess } from "@/hooks/use-feature-access";
import { useRTL } from "@/hooks/use-rtl";
import {
  useGetSetDetailsQuery,
  usePrintQuestionMutation,
} from "@/redux/services/userService";
import { getLocalStorage } from "@/utils/localStorage";
import html2pdf from "html2pdf.js";
import { ArrowLeft, Lock } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import content, { QuestionComponent } from "../../downloads/content";
import ConfirmationModal from "@/components/shared/ConfirmationModal";

const toBanglaNumber = (num: number | string): string => {
  const parsed = Number(num);
  if (isNaN(parsed)) return "";

  const display = Number.isInteger(parsed)
    ? parsed.toString()
    : parsed.toFixed(1);

  return display.replace(/[0-9.]/g, (char) =>
    char === "." ? "." : "০১২৩৪৫৬৭৮৯"[parseInt(char)],
  );
};

const toArabicNumber = (num: number | string): string => {
  const parsed = Number(num);
  if (isNaN(parsed)) return "";

  const display = Number.isInteger(parsed)
    ? parsed.toString()
    : parsed.toFixed(1);

  return display.replace(/[0-9.]/g, (char) =>
    char === "." ? "." : "٠١٢٣٤٥٦٧٨٩"[parseInt(char)],
  );
};

const subject = (lang: string) =>
  lang === "bn" ? `বিষয়ঃ ` : lang === "ar" ? `الموضوع: ` : `Subject: `;

const time = (lang: string, hour: string, minute: string) => {
  if (lang === "bn") {
    return `সময়ঃ ${hour} ঘন্টা ${minute} মিঃ`;
  } else if (lang === "ar") {
    return `الوقت: ${hour} ساعة ${minute} دقيقة`;
  } else {
    return `Time: ${hour} hour ${minute} minute`;
  }
};

const mark = (lang: string, mark: number) =>
  lang === "bn"
    ? `পূর্ণমানঃ ${mark}`
    : lang === "ar"
      ? `الدرجة: ${mark}`
      : `Mark: ${mark}`;
const convertIndex = (lang: string, num: number) =>
  lang === "bn"
    ? `${toBanglaNumber(num)}|`
    : lang === "ar"
      ? `${toArabicNumber(num)}.`
      : `${num}.`;
const convertNumber = (lang: string, num: number) =>
  lang === "bn"
    ? `${toBanglaNumber(num)}`
    : lang === "ar"
      ? `${toArabicNumber(num)}`
      : `${num.toFixed(1)}`;

export default function Page() {
  const { id } = useParams();
  const { isRTL, setRTL } = useRTL();
  const {
    data: set,
    isLoading,
    refetch,
  } = useGetSetDetailsQuery(id as string, {
    refetchOnMountOrArgChange: true,
  });

  const [updateApi, { isLoading: loading }] = usePrintQuestionMutation();
  const router = useRouter();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [initialPdfUrl, setInitialPdfUrl] = useState<string | null>(null);
  const [isGeneratingInitial, setIsGeneratingInitial] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const {
    hasFeature,
    package: userPackage,
    isLoading: featureLoading,
  } = useFeatureAccess();



  const canPdfExport = hasFeature("pdfexport");
  const canPreview = hasFeature("preview");

  useEffect(() => {
    refetch();
  }, [id]);

  // Generate initial PDF preview when set data is loaded
  // Generate initial PDF preview when set data is loaded
  useEffect(() => {
    if (set && !initialPdfUrl && !isGeneratingInitial) {
      // Check for persisted RTL setting being different from current global default
      if (set.questions && Array.isArray(set.questions)) {
        const settingsGroup = set.questions.find((g: any) => g.id === "settings");
        if (settingsGroup && settingsGroup.isRTL !== undefined) {
          // We need to sync this state, but we can't easily dispatch from here without useDispatch
          // However, page.tsx uses useRTL hook which exposes setRTL
          // We should dispatch if it differs.
          // Note: This might cause a re-render loop if not careful, but since we modify Redux 
          // and this component reads from Redux, it should stabilize.
          // Actually, we should check if local state matches first.
          // But useRTL provides the value.
          // Let's just pass the persisted RTL to content() function as fallback or primary?
          // The hook provides 'isRTL', which is global.
          // This page needs to set the global RTL based on the loaded question paper.
          // BE CAREFUL: changing global RTL here affects other pages if user navigates away?
          // Probably OK as this is the print view for a specific set.
        }
      }
      generateInitialPreview();
    }

    // Also sync RTL state if present in set
    if (set && set.questions && Array.isArray(set.questions)) {
      const settingsGroup = set.questions.find((g: any) => g.id === "settings");
      if (settingsGroup && settingsGroup.isRTL !== undefined) {
        // We can't access dispatch here directly as useRTL doesn't expose it directly in all versions?
        // checking hooks/use-rtl.ts -> it exposes setRTL.
        // We need to use valid hook usage.
      }
    }
  }, [set]);

  // We need to destructure setRTL from useRTL to update it
  // const { isRTL, setRTL } = useRTL(); // Removed to avoid redeclaration, using initial declaration

  useEffect(() => {
    if (set?.questions?.length) {
      const settingsGroup = set.questions.find((g: any) => g.id === "settings");
      if (settingsGroup && settingsGroup.isRTL !== undefined && settingsGroup.isRTL !== isRTL) {
        setRTL(settingsGroup.isRTL);
      }
    }
  }, [set, isRTL, setRTL]);

  const generateInitialPreview = async () => {
    if (!set) return;
    setIsGeneratingInitial(true);
    try {
      const contentRef = content(set, isRTL);
      const opt = {
        margin: 0.8,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 3,
          useCORS: true,
          logging: false,
          letterRendering: true,
        },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
        pagebreak: {
          mode: ["css"],
          avoid: ".avoid-break",
        },
      };
      const blob = await html2pdf().set(opt).from(contentRef).outputPdf("blob");
      const url = URL.createObjectURL(blob);
      setInitialPdfUrl(url);
    } catch (error) {
      console.error("Failed to generate initial preview:", error);
    } finally {
      setIsGeneratingInitial(false);
    }
  };
  //console.log(set);

  // Generate PDF and set preview URL
  const handleGenerate = async (download = false) => {
    const contentRef = content(set, isRTL);

    const canExport = hasFeature("exportpdf");

    try {
      const opt = {
        margin: 0.8,
        filename: `${set?.subject}-${set?.className}-${set?.examName?.examName}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 3, // Higher scale for better quality
          useCORS: true,
          logging: false,
          letterRendering: true,
        },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
        pagebreak: {
          mode: ["css"], // only respect CSS, not "legacy"
          avoid: ".avoid-break", // prevent breaks in avoid-break
        },
      };

      if (download) {
        // const confirmed = window.confirm(
        //   "এই ফাইলটি ডাউনলোড করার পর এই প্রশ্নে আর পরিবর্তন করতে পারবেন না!",
        // );
        // if (!confirmed) return;
        await updateApi({ id: set?.id }).unwrap();
        // Download directly
        html2pdf().set(opt).from(contentRef).save();
        toast.success("Successful");
      } else {
        // Generate Blob for preview
        const blob = await html2pdf()
          .set(opt)
          .from(contentRef)
          .outputPdf("blob");
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
        setIsOpen(true);
      }
    } catch (error: any) {
      toast.error(error?.data?.message);
    }
  };

  //console.log(set)
  if (isLoading) return <Loader />;

  return (
    <ModalLayout
      onChange={() => setIsOpen(false)}
      modalComponent={
        !pdfUrl ? (
          <div />
        ) : (
          <iframe
            src={`${pdfUrl}#toolbar=0`}
            className="h-full w-full rounded border"
            style={{ minHeight: "80vh" }}
          ></iframe>
        )
      }
      isOpen={isOpen}
    >
      <div className="relative flex h-full flex-col overflow-hidden">
        <div className="sticky top-0 z-50 flex justify-center gap-6 bg-white py-4 shadow-sm">
          <Button
            onClick={() => {
              router.push(getLocalStorage("back_url") || "/user");
              //back_url
            }}
          >
            <ArrowLeft />
          </Button>
          {canPdfExport && (
            <Button
              loading={loading}
              onClick={() => {
                if (!canPdfExport) {
                  setShowSubscriptionModal(true);
                  return;
                }
                setIsDownloadModalOpen(true);
              }}
              className="relative overflow-visible"
            >
              ডাউনলোড
              {!canPdfExport && (
                <Lock className="absolute -right-1.5 -top-1.5 h-4 w-4 rounded-full bg-orange-500 p-0.5 text-white shadow-md" />
              )}
            </Button>
          )}
          {!canPdfExport && (
            <Button
              loading={loading}
              onClick={() => {
                setShowSubscriptionModal(true);
              }}
              className="relative overflow-visible"
            >
              ডাউনলোড
              <Lock className="absolute -right-1.5 -top-1.5 h-4 w-4 rounded-full bg-orange-500 p-0.5 text-white shadow-md" />
            </Button>
          )}
          {canPreview && (
            <Button onClick={() => handleGenerate(false)}>
              প্রিন্ট ফরম্যাট
            </Button>
          )}
          {!canPreview && (
            <Button
              onClick={() => {
                setShowSubscriptionModal(true);
              }}
              className="relative overflow-visible"
            >
              প্রিন্ট ফরম্যাট
              <Lock className="absolute -right-1.5 -top-1.5 h-4 w-4 rounded-full bg-orange-500 p-0.5 text-white shadow-md" />
            </Button>
          )}
        </div>
        <div className="flex-1 overflow-hidden">
          {isGeneratingInitial ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
                <p className="text-gray-600">প্রিভিউ তৈরি হচ্ছে...</p>
              </div>
            </div>
          ) : initialPdfUrl ? (
            <iframe
              src={`${initialPdfUrl}#toolbar=0`}
              className="h-full w-full"
              style={{ minHeight: "80vh" }}
            ></iframe>
          ) : (
            <A4PreviewContainer>
              <div className="a4-page-content text-[12px]">
                <QuestionComponent {...set} isRTL={isRTL} />
              </div>
            </A4PreviewContainer>
          )}
        </div>
      </div>
      <SubscriptionUpgradeModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
      />
      <ConfirmationModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        onConfirm={() => handleGenerate(true)}
        title="ডাউনলোড নিশ্চিত করুন"
        description="এই ফাইলটি ডাউনলোড করার পর এই প্রশ্নে আর পরিবর্তন করতে পারবেন না!"
        confirmText="ডাউনলোড করুন"
        cancelText="বাতিল"
        confirmButtonClass="bg-blue-600 text-white hover:bg-blue-700"
      />
    </ModalLayout>
  );
}

// Component to handle A4 page preview with proper page breaks
function A4PreviewContainer({ children }: { children: React.ReactNode }) {
  const sourceRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<number[][]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!sourceRef.current) return;

    const splitIntoPages = () => {
      const sourceContainer = sourceRef.current;
      if (!sourceContainer) return;

      // Wait a bit more for layout to settle
      requestAnimationFrame(() => {
        // A4 dimensions: 210mm × 297mm, with 20mm padding = 170mm × 257mm content area
        // Convert mm to pixels: 1mm ≈ 3.779527559 pixels at 96 DPI
        const mmToPx = 3.779527559;
        const maxContentHeight = 257 * mmToPx; // Maximum content height per page in pixels

        const sourceContent = sourceContainer.querySelector(".a4-page-content");
        if (!sourceContent) {
          setPages([]);
          setIsReady(true);
          return;
        }

        const questionWrapper = sourceContent.firstElementChild as HTMLElement;
        if (!questionWrapper) {
          setPages([]);
          setIsReady(true);
          return;
        }

        // Get all question group elements (these are the top-level question categories)
        const questionGroups = Array.from(
          questionWrapper.children,
        ) as HTMLElement[];

        if (questionGroups.length === 0) {
          setPages([]);
          setIsReady(true);
          return;
        }

        // Calculate which groups go on which page
        const pageGroups: number[][] = [];
        let currentPageGroups: number[] = [];
        let currentPageHeight = 0;

        questionGroups.forEach((group, index) => {
          // Force a reflow to get accurate measurements
          void group.offsetHeight;

          // Measure the group height - use the most accurate measurement
          const rect = group.getBoundingClientRect();
          const groupHeight =
            rect.height || group.offsetHeight || group.scrollHeight;

          // Check if we need a new page
          if (
            currentPageHeight + groupHeight > maxContentHeight &&
            currentPageGroups.length > 0
          ) {
            // Start a new page
            pageGroups.push([...currentPageGroups]);
            currentPageGroups = [index];
            currentPageHeight = groupHeight;
          } else {
            // Add to current page
            currentPageGroups.push(index);
            currentPageHeight += groupHeight;
          }
        });

        // Add the last page
        if (currentPageGroups.length > 0) {
          pageGroups.push(currentPageGroups);
        }

        // If we only have one page with all groups, that's fine - content fits on one page
        // If we have multiple pages, split them
        setPages(pageGroups.length > 0 ? pageGroups : [[0]]);
        setIsReady(true);
      });
    };

    // Wait for content to render and measure - need enough time for layout
    const timer = setTimeout(() => {
      splitIntoPages();
    }, 600);

    // Also recalculate on window resize (with debounce)
    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        splitIntoPages();
      }, 200);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(timer);
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", handleResize);
    };
  }, [children]);

  // Get question groups from the source
  const getQuestionGroups = (): HTMLElement[] => {
    if (!sourceRef.current) return [];
    const sourceContent = sourceRef.current.querySelector(".a4-page-content");
    if (!sourceContent) return [];
    const questionWrapper = sourceContent.firstElementChild as HTMLElement;
    if (!questionWrapper) return [];
    return Array.from(questionWrapper.children) as HTMLElement[];
  };

  return (
    <div className="a4-preview-container">
      {/* Hidden source for measurement - must match visible page exactly */}
      <div
        ref={sourceRef}
        className="a4-page"
        style={{
          position: "absolute",
          visibility: "hidden",
          top: "-9999px",
          left: "-9999px",
          width: "210mm",
          minHeight: "297mm",
          height: "auto",
          padding: "10mm",
          boxSizing: "border-box",
        }}
      >
        <div className="a4-page-content text-[12px]" style={{ width: "100%" }}>
          {children}
        </div>
      </div>

      {/* Render pages */}
      <div className="a4-pages-wrapper">
        {isReady && pages.length > 0 ? (
          pages.map((pageGroupIndices, pageIndex) => {
            const questionGroups = getQuestionGroups();
            return (
              <div key={pageIndex} className="a4-page">
                <div className="a4-page-content text-[12px]">
                  <div className="w-full space-y-0.5 text-black">
                    {pageGroupIndices.map((groupIndex) => {
                      const group = questionGroups[groupIndex];
                      if (!group) return null;
                      return (
                        <div
                          key={groupIndex}
                          dangerouslySetInnerHTML={{
                            __html: group.outerHTML,
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="a4-page">
            <div className="a4-page-content text-[12px]">{children}</div>
          </div>
        )}
      </div>
    </div>
  );
}
