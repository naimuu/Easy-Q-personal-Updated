// context/QuestionContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  ReactNode,
} from "react";
export type QuestionItemsType = {
  id: string;
  question?: string;
  table?: string;
  details?: string;
  answer?: string;
  mark?: string;
  isRTL?: boolean;
  options?: {
    id: string;
    name: string;
  };
};
export type ContextCategory = {
  id: string;
  name: string;
  type: string;
  questions: QuestionItemsType[];
  numbering?: string;
  optionNumbering?: string;
  any?: string;
  anyMode?: string;
  mark?: string;
  isRTL?: boolean;
};

export type QuestionType = {
  id: string;
  name: string;
  type: string;
  questions: QuestionItemsType[] | ContextCategory[];
  text?: string;
  numbering?: string;
  optionNumbering?: string;
  any?: string;
  anyMode?: string;
  mark?: string;
  isRTL?: boolean;
};

interface QuestionContextType {
  questionList: QuestionType[];
  setQuestionList: React.Dispatch<React.SetStateAction<QuestionType[]>>;
  questionListRef: React.MutableRefObject<QuestionType[]>;
  sortGroups: () => void;
  removeGroup: (groupId: string) => void;
  editQuestion: (
    groupId: string,
    questionId: string,
    question?: string,
    table?: string,
  ) => void;
  updateGroupOrder: (groups: { id: string }[]) => void;
  updateItemOrder: (groupId: string, newItems: { id: string }[]) => void;
  updateOptionOrder: (
    groupId: string,
    itemId: string,
    newItems: { id: string }[],
  ) => void;
}

const QuestionContext = createContext<QuestionContextType | undefined>(
  undefined,
);

export const QuestionProvider = ({ children }: { children: ReactNode }) => {
  const [questionList, setQuestionList] = useState<QuestionType[]>([]);
  const questionListRef = useRef<QuestionType[]>([]);

  const sortGroups = useCallback(() => {
    const categories = [...new Set(questionList.map((g) => g.name))];
    const sorted = [...questionList].sort(
      (a, b) => categories.indexOf(a.name) - categories.indexOf(b.name),
    );
    setQuestionList(sorted);
  }, [questionList]);

  const removeGroup = (groupId: string) => {
    setQuestionList((prev) => prev.filter((s) => s.id !== groupId));
  };

  const editQuestion = (
    groupId: string,
    questionId: string,
    question?: string,
    table?: string,
  ) => {
    setQuestionList((prev) =>
      prev.map((group) =>
        group.id === groupId
          ? {
            ...group,
            questions: group.questions.map((q) =>
              q.id === questionId ? { ...q, question, table } : q,
            ),
          }
          : group,
      ),
    );
  };
  const updateGroupOrder = (newGroups: { id: string }[]) => {
    // console.log(newGroups);
    setQuestionList((prev) => {
      const groupMap = new Map<string, QuestionType>(prev.map((group) => [group.id, group]));

      const reordered = newGroups
        .map((item: { id: string }) => {
          if (!item) return undefined;
          const group = groupMap.get(item.id);
          if (!group) console.warn(`Group ID not found: ${item.id}`);
          return group;
        })
        .filter((g): g is QuestionType => !!g);

      // Identify items that were not in the newGroups (e.g. settings, or filtered out items)
      const newIds = new Set(newGroups.filter(g => !!g).map(g => g.id));
      const missingItems = prev.filter(g => !newIds.has(g.id));

      // Combine reordered items with missing items
      return [...reordered, ...missingItems];
    });
  };

  const updateItemOrder = (groupId: string, newItems: { id: string }[]) => {
    setQuestionList((prev) =>
      prev.map((group) => {
        if (group.id !== groupId) return group;

        const questionMap = new Map(group.questions.map((q) => [q.id, q]));

        const reorderedQuestions = newItems
          .map(({ id }) => questionMap.get(id))
          .filter(Boolean) as QuestionItemsType[];

        return {
          ...group,
          questions: reorderedQuestions,
        };
      }),
    );
  };
  const updateOptionOrder = (
    groupId: string,
    itemId: string,
    newItems: { id: string }[],
  ) => {
    setQuestionList((prev: QuestionType[]) =>
      prev.map((group: QuestionType): QuestionType => {
        if (group.id !== groupId) return group;

        // ✅ Safely check if it's ContextCategory[]
        if (
          !Array.isArray(group.questions) ||
          !("questions" in group.questions[0])
        ) {
          console.warn("Group questions is not ContextCategory[]");
          return group;
        }

        const updatedContext = (group.questions as ContextCategory[]).map(
          (context: ContextCategory): ContextCategory => {
            if (context.id !== itemId) return context;

            const questionMap = new Map<string, QuestionItemsType>(
              context.questions.map((q) => [q.id, q]),
            );

            const reorderedQuestions: QuestionItemsType[] = newItems
              .map(({ id }) => questionMap.get(id))
              .filter((q): q is QuestionItemsType => Boolean(q));

            return {
              ...context,
              questions: reorderedQuestions,
            };
          },
        );

        return {
          ...group,
          questions: updatedContext,
        };
      }),
    );
  };

  return (
    <QuestionContext.Provider
      value={{
        questionList,
        setQuestionList,
        questionListRef,
        sortGroups,
        removeGroup,
        editQuestion,
        updateGroupOrder,
        updateItemOrder,
        updateOptionOrder,
      }}
    >
      {children}
    </QuestionContext.Provider>
  );
};

export const useQuestionContext = () => {
  const context = useContext(QuestionContext);
  if (!context) {
    throw new Error(
      "useQuestionContext must be used within a QuestionProvider",
    );
  }
  return context;
};