import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import React, { useEffect, useRef, useState } from "react";
import { IoMdClose } from "react-icons/io";
import Button from "../shared/Button";
import "./styles.css";

interface Props {
  children: React.ReactNode;
  isOpen: boolean;
  title?: string;
  description?: string;
  onChange: () => void; // Used to close the modal
  modalComponent?: React.ReactNode;
  isAction?: boolean;
  onAction?: () => void;
  actionTitle?: string;
  className?: string;
  modalSize?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl";
}

const ModalLayout: React.FC<Props> = ({
  children,
  isOpen,
  description,
  title,
  onChange,
  modalComponent,
  isAction,
  onAction,
  actionTitle,
  className,
  modalSize = "lg",
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    "6xl": "max-w-6xl",
  };

  // Close modal when clicked outside the content
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      // Also check if the click target has a data attribute indicating it should stay open
      const target = e.target as HTMLElement;
      if (
        !target.closest("[data-modal-trigger]") &&
        !target.closest(".jodit-popup")
      ) {
        onChange();
      }
    }
  };

  const modalContent = (
    <div
      onClick={handleBackdropClick}
      className={cn(
        `fixed left-0 top-0 z-[9999] flex h-screen w-screen items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? "visible opacity-100" : "invisible opacity-0"
        }`,
        className,
      )}
    >
      <div
        ref={modalRef}
        className={`relative w-full ${sizeClasses[modalSize]} black:bg-slate-800 black:text-white max-h-[90vh] overflow-y-auto rounded-lg bg-white p-6 text-gray-900 shadow-2xl`}
      >
        {/* Close Button */}
        <button
          onClick={onChange}
          className="absolute right-4 top-4 z-30 text-gray-400 transition hover:text-red-500"
        >
          <IoMdClose size={24} />
        </button>

        {/* Optional Title and Description */}
        {title && <h2 className="mb-2 text-xl font-semibold">{title}</h2>}
        {description && (
          <p className="black:text-gray-300 mb-4 text-sm text-gray-600">
            {description}
          </p>
        )}

        {/* Modal Content */}
        {modalComponent}

        {/* Optional Action Button */}
        {isAction && onAction && (
          <div className="mt-6 text-right">
            <Button onClick={onAction}>
              {actionTitle || "Save changes"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div>
      {children}
      {mounted && createPortal(modalContent, document.body)}
    </div>
  );
};

export default ModalLayout;
