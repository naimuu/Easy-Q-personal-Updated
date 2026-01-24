"use client";
import Button from "@/components/shared/Button";
import Editor from "@/components/shared/Editor";
import { Select } from "@/components/shared/Select";
import TextArea from "@/components/shared/TextArea";
import { ArrowLeftRight } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useGetCategoriesQuery } from "./CategoryList";
import purseText, { stringifyQuestions } from "./parsseFunction";
import {
  useCreateQuestionMutation,
  useUpdateQuestionMutation,
} from "@/redux/services/adminServices/questionService";

const QuestionForm = ({
  close,
  lessonId,
  data,
}: {
  close: () => void;
  lessonId: string;
  data: any;
}) => {
  const { data: categories = [], refetch } = useGetCategoriesQuery();

  const items = categories?.map((d) => ({ label: d.name, value: d.id }));
  const itemsOutPassage = categories
    ?.filter((d) => d.type !== "passage-based" && d.type !== "no")
    .map((d) => ({
      label: d.name,
      value: d.id,
      type: d.type,
    }));

  const [categoryId, setCategoryId] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [error, setError] = useState("");
  const [isRTL, setIsRTL] = useState(false);
  const [addQuestion, { isLoading }] = useCreateQuestionMutation();
  const [updateQuestion, { isLoading: loading }] = useUpdateQuestionMutation();

  const type = categories.find((d) => d.id === categoryId)?.type;

  useEffect(() => {
    if (data) {
      if (!data?.categoryId) {
        setCategoryId(data?.id);
        const ds = stringifyQuestions(data.questions, data.type);
        setQuestionText(ds);
        //console.log(ds);
      } else {
        setCategoryId(data.categoryId);
      }
    }
  }, [data]);

  const handleSingleSubmit = async () => {
    if (!questionText.trim()) {
      setError("Question is required");
      return;
    }
    const data = {
      context: undefined,
      question: purseText(questionText, type || "", categoryId, lessonId, isRTL),
      categoryId,
      lessonId,
    };
    //return console.log(data)
    try {
      await addQuestion(data).unwrap();
      toast.success("Added successful");
      setError("");
      close(); // or reset form
    } catch (error: any) {
      toast.error(error?.data?.message);
    }
  };
  const handleSingleUpdateSubmit = async () => {
    if (!questionText.trim()) {
      setError("Question is required");
      return;
    }
    const data = {
      context: undefined,
      question: purseText(questionText, type || "", categoryId, lessonId, isRTL),
      categoryId,
      lessonId,
    };
    //return console.log(data)
    try {
      await updateQuestion({ categoryId, lessonId, body: data }).unwrap();
      toast.success("Added successful");
      setError("");
      close(); // or reset form
    } catch (error: any) {
      toast.error(error?.data?.message);
    }
  };
  useEffect(() => {
    if (!data) {
      setQuestionText("");
    }
  }, [type]);

  return (
    <div className="relative flex flex-col gap-4">
      <div className="-mt-2 mb-4 mr-6 flex items-center justify-between">
        <div className="text-xl font-semibold">
          {data ? "Update" : "Add"} Question
        </div>
        <Button
          type="button"
          onClick={() => setIsRTL(!isRTL)}
          className={`p-2 ${isRTL ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          title={isRTL ? "Switch to LTR" : "Switch to RTL (Arabic)"}
        >
          <ArrowLeftRight className="h-4 w-4" />
        </Button>
      </div>

      <div
        dir={isRTL ? "rtl" : "ltr"}
        className={isRTL ? "[&_svg]:left-3 [&_svg]:right-auto" : ""}
      >
        <Select
          error=""
          defaultValue={categoryId}
          items={items}
          placeholder="Select one"
          setValue={setCategoryId}
          label="Select Category"
        />
      </div>

      {type === "passage-based" && (
        <TypeFormatter
          categoryId={categoryId}
          lessonId={lessonId}
          data={data}
          category={itemsOutPassage}
          close={close}
          isRTL={isRTL}
          setIsRTL={setIsRTL}
        />
      )}

      {type && type !== "passage-based" && (
        <>
          {type === "table" ? (
            <Editor value={questionText} onChange={setQuestionText} />
          ) : (
            <>
              <div dir={isRTL ? "rtl" : "ltr"}>
                <label className="text-sm font-medium">Question</label>
                <TextArea
                  link="/"
                  rows={8}
                  placeholder={isRTL ? "اكتب السؤال" : "Write question"}
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  error={error}
                />
              </div>
            </>
          )}

          {data ? (
            <Button loading={loading} onClick={handleSingleUpdateSubmit}>
              Update Now
            </Button>
          ) : (
            <Button loading={isLoading} onClick={handleSingleSubmit}>
              Add Now
            </Button>
          )}
        </>
      )}
    </div>
  );
};

export default QuestionForm;

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
    const updated = [...questions];
    updated.splice(index, 1);
    setQuestions(updated);
  };

  const validate = () => {
    const errs: { context?: string; questions?: string[] } = {};

    if (!context.trim()) {
      errs.context = "Passage is required";
    }

    const qErrors: string[] = [];
    questions.forEach((q, idx) => {
      if (!q.type) qErrors[idx] = "Question type is required";
      else if (!q.question.trim()) qErrors[idx] = "Question text is required";
      else if (!q.id) qErrors[idx] = "Question id is required";
      else qErrors[idx] = "";
    });

    if (qErrors.some((e) => e)) {
      errs.questions = qErrors;
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    let arr: any = [];
    questions?.map((d) => {
      const newArr = purseText(d.question, d.type, d.id, lessonId, isRTL);
      newArr?.map((s) => {
        arr.push(s);
      });
    });
    const data = {
      context: context,
      question: arr,
      categoryId,
      lessonId,
    };
    //return console.log("Submitted", data);
    //console.log(data)
    try {
      await addQuestion(data).unwrap();
      toast.success("Added successful");
      close(); // or reset form
    } catch (error: any) {
      toast.error(error?.data?.message);
      console.log(error?.data?.message);
    }
    // Do further processing
  };
  const handleSubmitUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    let arr: any = [];
    questions?.map((d) => {
      const newArr = purseText(d.question, d.type, d.id, lessonId, isRTL);
      newArr?.map((s) => {
        arr.push(s);
      });
    });
    const d = {
      context: context,
      question: arr,
      categoryId,
      lessonId,
    };
    //return console.log("Submitted", data);
    //console.log(data)
    try {
      await updateQuestion({
        categoryId,
        contextId: data.id,
        lessonId,
        body: d,
      }).unwrap();
      toast.success("Update successful");
      close(); // or reset form
    } catch (error: any) {
      toast.error(error?.data?.message);
      console.log(error?.data?.message);
    }
    // Do further processing
  };
  return (
    <form
      onSubmit={data ? handleSubmitUpdate : handleSubmit}
      className="flex flex-col gap-4"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <TextArea
        rows={6}
        label="Passage"
        placeholder={isRTL ? "اكتب المقطع" : "Write the passage"}
        value={context}
        onChange={(e) => setContext(e.target.value)}
        error={errors.context}
      />

      {questions.map((item, index) => {
        return (
          <div key={index} className="space-y-2 rounded border p-4">
            <div className={isRTL ? "[&_svg]:left-3 [&_svg]:right-auto" : ""}>
              <Select
                label="Question Category"
                items={category}
                defaultValue={item.id}
                setValue={(val) => {
                  handleChangeQuestion(index, "id", val);
                  const type = category?.find((d) => d.value === val)?.type;
                  if (type) handleChangeQuestion(index, "type", type);
                }}
                placeholder="Select one"
                error={
                  errors?.questions?.[index]?.includes("type")
                    ? errors.questions[index]
                    : ""
                }
              />
            </div>

            <>
              {item.type === "table" ? (
                <Editor
                  value={item.question}
                  onChange={(e) => {
                    handleChangeQuestion(index, "question", e);
                  }}
                />
              ) : (
                <TextArea
                  rows={5}
                  link="/"
                  label={`Question ${index + 1}`}
                  placeholder="Enter question"
                  value={item.question}
                  onChange={(e) =>
                    handleChangeQuestion(index, "question", e.target.value)
                  }
                  error={
                    errors?.questions?.[index]?.includes("text")
                      ? errors.questions[index]
                      : ""
                  }
                />
              )}
            </>

            <Button
              type="button"
              mode="outline"
              className="text-red-500"
              onClick={() => handleRemoveQuestion(index)}
            >
              ✕ Remove
            </Button>
          </div>
        );
      })}

      <Button type="button" onClick={handleAddQuestion} className="w-fit">
        + Add Question
      </Button>

      {data ? (
        <Button loading={loading} type="submit" className="w-full">
          Update Now
        </Button>
      ) : (
        <Button loading={isLoading} type="submit" className="w-full">
          Create Now
        </Button>
      )}
    </form>
  );
};
