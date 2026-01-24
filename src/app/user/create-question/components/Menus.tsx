import * as React from "react";
import { DropdownMenu } from "radix-ui";
import "./styles.css";
import { numberingCategories } from "./numberingUtils";
import { ChevronRight } from "lucide-react";

type Props = {
  children: React.ReactNode;
  value?: string;
  onChange?: (value: string) => void;
};

const Dropdown = ({ children, onChange }: Props) => {
  const [activeCategory, setActiveCategory] = React.useState(numberingCategories[0]);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>{children}</DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="DropdownMenuContent w-[280px] p-0 overflow-hidden bg-white shadow-xl rounded-lg border border-gray-200"
          sideOffset={5}
          align="start"
        >
          <div className="flex h-[180px]">
            {/* Left Column: Categories (Script Buttons) */}
            <div className="w-[80px] shrink-0 border-r border-gray-200 bg-gray-50 p-1 flex flex-col gap-1 overflow-y-auto">
              {numberingCategories.map((cat) => (
                <div
                  key={cat.id}
                  onMouseEnter={() => setActiveCategory(cat)}
                  className={`cursor-pointer rounded min-h-[26px] flex items-center justify-center p-0.5 text-center text-[11px] font-bold subpixel-antialiased transition-all border ${activeCategory.id === cat.id
                    ? "bg-blue-600 text-white border-blue-700 shadow-sm"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100 hover:border-gray-400"
                    }`}
                >
                  {cat.label}
                </div>
              ))}
            </div>

            {/* Right Column: Options (Style Grid) */}
            <div className="flex-1 p-1.5 overflow-y-auto bg-gray-50">
              <div className="mb-1 px-0.5 text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">
                {activeCategory.label}
              </div>
              <div className="grid grid-cols-3 gap-1">
                {activeCategory.options.map((option) => (
                  <DropdownMenu.Item
                    key={option.value}
                    textValue={option.value}
                    onSelect={() => onChange?.(option.value)}
                    className="flex flex-col items-center justify-center cursor-pointer rounded border bg-white p-0.5 text-xs text-gray-900 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 hover:shadow-sm focus:outline-none transition-all text-center h-[35px]"
                  >
                    <span className="text-[13px] font-bold truncate max-w-full leading-none subpixel-antialiased">
                      {option.label.split("...")[0].split(/[, ]/)[0]}
                    </span>
                  </DropdownMenu.Item>
                ))}
              </div>
            </div>
          </div>

          <DropdownMenu.Arrow className="DropdownMenuArrow fill-white" />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default Dropdown;
