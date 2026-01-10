import TextWithFractions from "./TextWithFractions";

export default function ObjectiveView({ doc }: { doc: any }) {
  return (
    <div className="black:bg-purple-900 mb-4 rounded-sm bg-purple-100 p-4 shadow-md">
      {/* Question */}
      <p className="black:text-white mb-2 font-semibold text-gray-900">
        <TextWithFractions text={doc.question} />
      </p>

      {/* Options */}
      <ul className="black:text-gray-200 grid list-disc grid-cols-1 gap-2 pl-4 text-gray-800 sm:grid-cols-2">
        {doc.options?.map((opt: any, j: number) => (
          <li key={j}>
            <TextWithFractions text={opt.name} />
          </li>
        ))}
      </ul>
    </div>
  );
}
