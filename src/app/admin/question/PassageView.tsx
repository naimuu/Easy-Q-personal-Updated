import Button from "@/components/shared/Button";
import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown, Pencil, Trash2 } from "lucide-react";
import ObjectiveView from "./ObjectiveView";
import TextWithFractions from "./TextWithFractions";

export default function PassageView({
  s,
  handleDelete,
  onEdit,
}: {
  s: any;
  onEdit: (data: any) => void;
  handleDelete: (categoryId: string, contextId: string) => void;
}) {
  return (
    <Accordion.Root type="single" collapsible className="space-y-2">
      <Accordion.Item
        key={s.id}
        value={s.id}
        className="rounded-md border shadow-sm"
      >
        <Accordion.Header className="flex w-full items-start justify-between p-3 text-left font-medium text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-800">
          <Accordion.Trigger className="flex-1 text-left">
            <div className="line-clamp-3">
              <TextWithFractions text={s.text} />
            </div>
          </Accordion.Trigger>
          <div className="flex items-center gap-2">
            <Button
              className="h-6 w-6 bg-yellow-500 p-1"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(s);
              }}
            >
              <Pencil className="h-4 w-4 text-white" />
            </Button>
            <Button
              className="h-6 w-6 bg-red-500 p-1"
              onClick={(e) => {
                e.stopPropagation();
                const confirmed = window.confirm(
                  "Are you sure you want to delete this passage?",
                );
                if (confirmed) {
                  handleDelete(s.id, s.id);
                }
              }}
            >
              <Trash2 className="h-4 w-4 text-white" />
            </Button>
            <Accordion.Trigger>
              <ChevronDown className="AccordionChevron h-4 w-4 transition-transform duration-200" />
            </Accordion.Trigger>
          </div>
        </Accordion.Header>

        <Accordion.Content>
          <Accordion.Root type="multiple" className="space-y-2">
            {s?.questions?.map((category: any) => (
              <Accordion.Item
                key={category.id}
                value={category.id}
                className="rounded-md border shadow-sm"
              >
                <Accordion.Header>
                  <Accordion.Trigger className="flex w-full items-center justify-between p-3 text-left font-medium text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-800">
                    {category.name}
                    <ChevronDown className="AccordionChevron h-4 w-4 transition-transform duration-200" />
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content className="space-y-1 px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                  {category.type === "word" ? (
                    <div className="flex flex-wrap gap-1">
                      {category.questions.map((doc: any, i: number) => (
                        <div
                          className="rounded-sm bg-purple-200 px-2 py-1 text-black"
                          key={i}
                        >
                          <TextWithFractions text={doc.question} />
                        </div>
                      ))}
                    </div>
                  ) : ["single-question", "fill-gap", "right-wrong"].includes(
                    category.type,
                  ) ? (
                    <div className="flex flex-col gap-1">
                      {category.questions.map((doc: any, i: number) => (
                        <div
                          className="rounded-sm bg-purple-200 px-2 py-1"
                          key={i}
                        >
                          <TextWithFractions text={doc.question} />
                        </div>
                      ))}
                    </div>
                  ) : category.type === "table" ? (
                    <div className="flex flex-col gap-1">
                      {category.questions.map((doc: any, i: number) => (
                        <div
                          key={i}
                          className="overflow-x-auto rounded-sm bg-purple-200 px-2 py-1"
                        >
                          <div
                            dangerouslySetInnerHTML={{ __html: doc.table }}
                            className="custom-table"
                          />
                        </div>
                      ))}
                    </div>
                  ) : category.type === "objective" ? (
                    <div className="flex flex-col gap-1">
                      {category.questions.map((doc: any, i: number) => (
                        <ObjectiveView doc={doc} key={i} />
                      ))}
                    </div>
                  ) : null}
                </Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  );
}
