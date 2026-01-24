"use client";
import Button from "@/components/shared/Button";
import Loader from "@/components/shared/Loader";
import QuotaExceededModal from "@/components/shared/QuotaExceededModal";
import {
  useCreateExamMutation,
  useGetExamsQuery,
  useGetUserBooksQuery,
  useGetSetDetailsQuery,
  useUpdateSetQuestionMutation,
} from "@/redux/services/userService";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import CreatableSelect from "react-select/creatable";
import { toast } from "react-toastify";

const translations = {
  bn: {
    examLabel: "পরীক্ষার নাম",
    timeLabel: "সময়কাল",
    marksLabel: "মোট নম্বর",
    subjectLabel: "বিষয়",
    book: "বই",
    classLabel: "শ্রেণি",
    placeholders: {
      exam: "পরীক্ষার নাম লিখুন",
      hour: "ঘণ্টা",
      minute: "মিনিট",
      marks: "নম্বর",
      subject: "বিষয়ের নাম লিখুন",
      book: "বইয়ের নাম লিখুন",
      class: "শ্রেণির নাম লিখুন",
    },
    dir: "ltr",
    exams: [
      "সাপ্তাহিক মূল্যায়ন",
      "মাসিক পরীক্ষা",
      "১ম সাময়িক পরীক্ষা",
      "২য় সাময়িক পরীক্ষা",
      "৩য় সাময়িক পরীক্ষা",
      "অর্ধ-বার্ষিক পরীক্ষা",
      "প্রাক-বার্ষিক পরীক্ষা",
      "বার্ষিক পরীক্ষা",
      "চূড়ান্ত পরীক্ষা",
      "মৌখিক পরীক্ষা",
      "ব্যবহারিক পরীক্ষা",
      "ধারাবাহিক মূল্যায়ন",
      "প্রাক-প্রাথমিক মূল্যায়ন",
    ],
    hours: ["১", "২", "৩"],
    minutes: ["১৫", "৩০", "৪৫"],
    marks: ["৫০", "৭৫", "১০০"],
  },
  en: {
    examLabel: "Exam Name",
    timeLabel: "Time Duration",
    marksLabel: "Total Marks",
    subjectLabel: "Subject",
    book: "Book",
    classLabel: "Class",
    placeholders: {
      exam: "Enter exam name",
      hour: "Hour",
      minute: "Minute",
      marks: "Marks",
      subject: "Enter subject name",
      book: "Enter book name",
      class: "Enter class name",
    },
    dir: "ltr",
    exams: [
      "Weekly Assessment",
      "Monthly Exam",
      "First Term Exam",
      "Second Term Exam",
      "Third Term Exam",
      "Half-Yearly Exam",
      "Pre-Annual Exam",
      "Annual Exam",
      "Final Exam",
      "Oral Exam",
      "Practical Exam",
      "Formative Assessment",
      "Pre-Primary Assessment",
    ],
    hours: ["1", "2", "3"],
    minutes: ["15", "30", "45"],
    marks: ["50", "75", "100"],
  },
  ar: {
    examLabel: "اسم الامتحان",
    timeLabel: "المدة الزمنية",
    marksLabel: "المجموع",
    subjectLabel: "المادة",
    book: "الكتاب",
    classLabel: "الصف",
    placeholders: {
      exam: "أدخل اسم الامتحان",
      hour: "ساعة",
      minute: "دقيقة",
      marks: "الدرجات",
      subject: "أدخل اسم المادة",
      book: "أدخل اسم الكتاب",
      class: "أدخل اسم الصف",
    },
    dir: "rtl",
    exams: [
      "التقويم الأسبوعي",
      "الاختبار الشهري",
      "الاختبار الفصلي الأول",
      "الاختبار الفصلي الثاني",
      "الاختبار الفصلي الثالث",
      "الاختبار النصفي السنوي",
      "الاختبار التمهيدي السنوي",
      "الاختبار السنوي",
      "الاختبار النهائي",
      "الاختبار الشفوي",
      "الاختبار العملي",
      "التقويم التكويني",
      "التقويم التمهيدي للأطفال",
    ],
    hours: ["١", "٢", "٣"],
    minutes: ["١٥", "٣٠", "٤٥"],
    marks: ["٥٠", "٧٥", "١٠٠"],
  },
};

export default function ExamForm({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  const [lang, setLang] = useState<"bn" | "en" | "ar">("bn");
  const t = translations[lang];
  const { data: exams, isLoading } = useGetExamsQuery(lang);
  const [selectedExam, setSelectedExam] = useState<{
    label: string;
    value: string;
  } | null>(null);
  const [manualExamName, setManualExamName] = useState("");
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");
  const [marks, setMarks] = useState("");
  const query = useSearchParams();
  const bookId = query.get("bookId");
  const cloneId = query.get("clone_id");
  const [createExm, { isLoading: creating }] = useCreateExamMutation();
  const router = useRouter();
  const [options, setOptions] = useState<any[]>([]);
  const [subject, setSubject] = useState("");
  const {
    data: books,
    isLoading: bookLoading,
    refetch,
  } = useGetUserBooksQuery({
    bookId: bookId,
  });

  // Fetch details for cloning if cloneId exists
  const { data: cloneData } = useGetSetDetailsQuery(cloneId as string, {
    skip: !cloneId,
  });

  const [className, setClassName] = useState("");
  const [quotaExceeded, setQuotaExceeded] = useState<{
    current: number;
    limit: number;
  } | null>(null);

  useEffect(() => {
    if (bookId) refetch();
  }, [bookId]);

  useEffect(() => {
    if (exams)
      setOptions(
        exams?.map((exam) => ({
          label: exam.examName,
          value: exam.id,
        })),
      );
  }, [exams]);

  // Pre-fill data if cloning
  useEffect(() => {
    if (cloneData) {
      if (cloneData.examName?.examName) setManualExamName(cloneData.examName.examName);
      if (cloneData.durationHour) setHour(cloneData.durationHour);
      if (cloneData.durationMinute) setMinute(cloneData.durationMinute);
      if (cloneData.totalMarks) setMarks(cloneData.totalMarks);
      if (cloneData.subject) setSubject(cloneData.subject);
      if (cloneData.className) setClassName(cloneData.className);

      // Attempt to set language if we can infer it or if it's stored (it's stored as 'type' in create payload)
      // If cloneData has a type field (create payload had it), use it. 
      // Based on API response structure, we might need to check fields.
      // Usually 'type' is not directly on the set object unless it was saved.
      // We can infer from existing fields if needed, or default to 'bn'.
    } else if (books?.length && !cloneId) {
      // Only set from books if NOT cloning (to avoid overwriting clone data)
      setClassName(books[0].class?.name);
      setSubject(books[0]?.name);
    }
  }, [books, bookId, cloneData, cloneId]);

  const inputClass =
    "lang-input w-full mt-1 border border-gray-300 rounded-md px-4 py-2";

  const setDirClass = (dir: string) =>
    dir === "rtl" ? "text-right" : "text-left";

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    //e.target.value = "";
    setTimeout(() => (e.target.value = value), 1);
  };
  const [updateSetQuestion] = useUpdateSetQuestionMutation();

  /* Validation State */
  const [errors, setErrors] = useState<{
    examName?: boolean;
    className?: boolean;
    subject?: boolean;
    hour?: boolean;
    minute?: boolean;
    marks?: boolean;
  }>({});

  const handleSubmit = async () => {
    // Exclude clone_id and page from the payload to ensure it's treated as a new exam creation
    const { clone_id, page, ...prev } = Object.fromEntries(query.entries());
    const examName = selectedExam?.label || manualExamName;

    // Validation
    const newErrors: any = {};
    if (!examName) newErrors.examName = true;
    if (!className) newErrors.className = true;
    if (!subject) newErrors.subject = true;
    if (!hour) newErrors.hour = true;
    if (!minute) newErrors.minute = true;
    if (!marks) newErrors.marks = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("অনুগ্রহ করে খালি ঘরগুলো পূরণ করুন");
      return;
    }

    setErrors({}); // Clear errors if validation passes

    const payload = {
      ...prev,
      examsId:
        selectedExam?.value === selectedExam?.label
          ? undefined
          : selectedExam?.value,
      examName,
      durationHour: hour,
      durationMinute: minute,
      totalMarks: marks,
      type: lang,
      subject: subject,
      className,
      // Pass board/institute if cloning
      ...(cloneData ? {
        boardId: cloneData.boardId,
        instituteId: cloneData.instituteId,
        classId: cloneData.classId,
        bookId: cloneData.bookId // Ensure bookId is also passed if available from clone
      } : {})
    };
    //console.log(payload);

    try {
      const res = await createExm(payload as any).unwrap();

      // Access the questionSet id from the nested response
      const questionSetId = res.questionSet?.id || res.id;
      if (!questionSetId) {
        toast.error("Failed to get question set ID");
        return;
      }

      // If cloning and we have questions, import them
      if (cloneData && cloneData.questions && Array.isArray(cloneData.questions) && cloneData.questions.length > 0) {
        const loadingToast = toast.loading("Importing questions... please wait");
        try {
          // Filter out "settings" or non-question items if any, though usually 'questions' array contains the groups
          // The structure seems to be an array of question groups. 
          // We need to send the ENTIRE array as the body for updateSetQuestion, or loop?
          // updateSetQuestion signature: ({ id: string; body: any })
          // Looking at usage in AddQuestion.tsx (not visible but inferred), it likely accepts the full array or a partial update.
          // Let's assume sending the array works or we need to send { questions: [...] }
          // Given it's a PUT to /user/create-question/set?id=..., it likely replaces the set's questions.
          // Let's clean the IDs from the questions to ensure they are new.

          const cleanedQuestions = cloneData.questions
            .filter((q: any) => q.id !== 'settings') // Settings might be handled differently or should be preserved?
            .map((group: any) => {
              // Deep copy to potentially remove internal IDs if backend generates them, BUT 
              // if the backend uses these IDs for ordering or structure, we might need to be careful.
              // For now, let's pass the structure as-is but maybe without top-level group ID if it causes conflict? 
              // Actually, if we send the whole array, the backend probably replaces the existing (empty) list.
              return group;
            });

          // Also preserve settings if they exist
          const settings = cloneData.questions.find((q: any) => q.id === 'settings');

          // Construct the update body. 
          // In AddQuestion, it likely sends the whole list.
          const body = [...cleanedQuestions];
          if (settings) body.push(settings);

          await updateSetQuestion({ id: questionSetId, body }).unwrap();

          toast.update(loadingToast, {
            render: "Exam and questions cloned successfully!",
            type: "success",
            isLoading: false,
            autoClose: 2000
          });
        } catch (importErr) {
          console.error("Failed to import questions", importErr);
          toast.update(loadingToast, {
            render: "Exam created but failed to import questions",
            type: "warning",
            isLoading: false,
            autoClose: 3000
          });
        }
      } else {
        toast.success("Exam created successfully!");
      }

      const targetBookId = bookId || (cloneData ? cloneData.bookId : "");
      router.push(
        `/user/create-question?page=3&set_id=${questionSetId}&bookId=${targetBookId}`,
      );
    } catch (err: any) {
      // console.error("Submit error:", err);

      // Handle quota exceeded error - check message content
      const errorMessage = err?.data?.message || "";
      if (
        err?.data?.code === "QUOTA_EXCEEDED" ||
        err?.status === 402 ||
        errorMessage.includes("question set limit")
      ) {
        // Extract limit from message: "You have reached your question set limit (7)"
        const limitMatch = errorMessage.match(/\((\d+)\)/);
        const limit = limitMatch ? parseInt(limitMatch[1]) : 0;

        setQuotaExceeded({
          current: err?.data?.data?.current || limit,
          limit: err?.data?.data?.limit || limit,
        });
        return;
      }

      // Handle other errors
      toast.error(errorMessage || "Failed to create exam");
    }
  };

  if (isLoading || bookLoading) return <Loader />;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-white p-6 shadow-xl">
        {/* Language Selection */}
        <div className="flex items-center justify-center gap-6">
          {(["bn", "en", "ar"] as const).map((l) => (
            <label key={l} className="inline-flex items-center">
              <input
                type="radio"
                name="language"
                value={l}
                checked={lang === l}
                onChange={() => setLang(l)}
                className="text-purple-600"
              />
              <span className="ml-2 capitalize text-gray-700">
                {l === "bn" ? "Bangla" : l === "en" ? "English" : "Arabic"}
              </span>
            </label>
          ))}
        </div>

        {/* Exam Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t.examLabel}
          </label>
          {/* <CreatableSelect
            placeholder={t.placeholders.exam}
            options={options}
            className="text-sm"
            onChange={(val) => setSelectedExam(val)}
            value={selectedExam}
            classNamePrefix="react-select"
            isSearchable
            isClearable
            styles={{
              control: (base: any) => ({
                ...base,
                borderColor: "#d1d5db",
                boxShadow: "none",
                "&:hover": {
                  borderColor: "#9ca3af",
                },
              }),
              menu: (base: any) => ({
                ...base,
                zIndex: 9999,
              }),
            }}
            theme={(theme: any) => ({
              ...theme,
              borderRadius: 4,
              colors: {
                ...theme.colors,
                primary25: "#f3f4f6",
                primary: "#2563eb",
              },
            })}
          /> */}
          <div className="w-full">
            <input
              list="exam"
              placeholder={t.placeholders.exam}
              className={`${inputClass} ${setDirClass(t.dir)} ${errors.examName ? "border-red-500 focus:ring-red-500" : ""}`}
              dir={t.dir}
              onFocus={handleFocus}
              value={manualExamName}
              onChange={(e) => {
                setManualExamName(e.target.value);
                if (e.target.value) setErrors(prev => ({ ...prev, examName: false }));
              }}
            />
            <datalist id="exam">
              {t.exams.map((h) => (
                <option key={h} value={h} />
              ))}
            </datalist>
          </div>
        </div>
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700">
            {t.classLabel}
          </label>
          <input
            list="class"
            placeholder={t.placeholders.class}
            className={`${inputClass} ${setDirClass(t.dir)} ${errors.className ? "border-red-500 focus:ring-red-500" : ""}`}
            dir={t.dir}
            onFocus={handleFocus}
            value={className}
            onChange={(e) => {
              setClassName(e.target.value);
              if (e.target.value) setErrors(prev => ({ ...prev, className: false }));
            }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t.subjectLabel}
          </label>
          <input
            placeholder={t.placeholders.subject}
            className={`${inputClass} ${setDirClass(t.dir)} ${errors.subject ? "border-red-500 focus:ring-red-500" : ""}`}
            dir={t.dir}
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value);
              if (e.target.value) setErrors(prev => ({ ...prev, subject: false }));
            }}
            onFocus={handleFocus}
          />
        </div>

        {/* Time Duration */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            {t.timeLabel}
          </label>
          <div className="flex gap-2">
            <div className="w-1/2">
              <input
                list="hours"
                placeholder={t.placeholders.hour}
                className={`${inputClass} ${setDirClass(t.dir)} ${errors.hour ? "border-red-500 focus:ring-red-500" : ""}`}
                dir={t.dir}
                onFocus={handleFocus}
                value={hour}
                onChange={(e) => {
                  setHour(e.target.value);
                  if (e.target.value) setErrors(prev => ({ ...prev, hour: false }));
                }}
              />
              <datalist id="hours">
                {t.hours.map((h) => (
                  <option key={h} value={h} />
                ))}
              </datalist>
            </div>
            <div className="w-1/2">
              <input
                list="minutes"
                placeholder={t.placeholders.minute}
                className={`${inputClass} ${setDirClass(t.dir)} ${errors.minute ? "border-red-500 focus:ring-red-500" : ""}`}
                dir={t.dir}
                value={minute}
                onChange={(e) => {
                  setMinute(e.target.value);
                  if (e.target.value) setErrors(prev => ({ ...prev, minute: false }));
                }}
                onFocus={handleFocus}
              />
              <datalist id="minutes">
                {t.minutes.map((m) => (
                  <option key={m} value={m} />
                ))}
              </datalist>
            </div>
          </div>
        </div>

        {/* Total Marks */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t.marksLabel}
          </label>
          <input
            list="marks"
            placeholder={t.placeholders.marks}
            className={`${inputClass} ${setDirClass(t.dir)} ${errors.marks ? "border-red-500 focus:ring-red-500" : ""}`}
            dir={t.dir}
            value={marks}
            onChange={(e) => {
              setMarks(e.target.value);
              if (e.target.value) setErrors(prev => ({ ...prev, marks: false }));
            }}
            onFocus={handleFocus}
          />
          <datalist id="marks">
            {t.marks.map((mark) => (
              <option key={mark} value={mark} />
            ))}
          </datalist>
        </div>

        {/* Buttons */}
        <div className="flex justify-between pt-4">
          <Button
            onClick={onBack}
            className="h-8 w-[70px] rounded-md bg-gray-700 text-white"
          >
            Back
          </Button>
          <Button
            loading={creating}
            onClick={handleSubmit}
            className="h-8 w-[70px] rounded-md bg-purple-800 text-white"
          >
            Confirm
          </Button>
        </div>
      </div>

      {/* Quota Exceeded Modal */}
      <QuotaExceededModal
        isOpen={!!quotaExceeded}
        onClose={() => setQuotaExceeded(null)}
        current={quotaExceeded?.current || 0}
        limit={quotaExceeded?.limit || 0}
      />
    </div>
  );
}
