// Editor.tsx
"use client";
import JoditEditor from "jodit-react";
import { useMemo, useRef } from "react";
import "../Layouts/styles.css";

type Props = {
  value: string;
  onChange: (val: string) => void;
};

export default function Editor({ value, onChange }: Props) {
  const editor = useRef(null);

  const config = useMemo(
    () => ({
      readonly: false,
      placeholder: "Start typing...",
      toolbar: true,
      toolbarAdaptive: false,
      buttons: [
        "table",
        "addcolumn",
        "addrow",
        "merge",
        "split",
        "bin",
        "undo",
        "redo",
      ],
      removeButtons: [
        "source",
        "bold",
        "italic",
        "underline",
        "ul",
        "ol",
        "font",
        "fontsize",
        "paragraph",
        "image",
        "video",
        "file",
        "link",
        "copyformat",
        "hr",
        "brush",
        "align",
        "outdent",
        "indent",
        "print",
        "fullsize",
        "spellcheck",
      ],
    }),
    [],
  );

  return (
    <div
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
      <JoditEditor
        ref={editor}
        value={value}
        config={config}
        tabIndex={1}
        onChange={onChange}
      />
    </div>
  );
}
