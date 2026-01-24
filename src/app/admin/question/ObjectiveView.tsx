import TextWithFractions from "./TextWithFractions";

export default function ObjectiveView({ doc }: { doc: any }) {
  return (
    <div className="mb-3 rounded-xl bg-white dark:bg-gray-800/40 p-3 border border-gray-100 dark:border-gray-700 shadow-sm antialiased group">
      {/* Question */}
      <p className="mb-2 font-bold text-black dark:text-white text-[13px] leading-snug">
        <TextWithFractions text={doc.question} />
      </p>

      {/* Options */}
      <ul className="grid list-none grid-cols-1 gap-1.5 sm:grid-cols-2">
        {doc.options?.map((opt: any, j: number) => (
          <li key={j} className="flex items-center gap-2 text-[12px] font-medium text-gray-800 dark:text-gray-300">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
            <TextWithFractions text={opt.name} />
          </li>
        ))}
      </ul>
    </div>
  );
}
