import { CiWarning } from "react-icons/ci";
import Button from "./Button";
import ModalLayout from "@/components/Layouts/ModalLayout";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    confirmButtonClass?: string;
    icon?: React.ReactNode;
}

const ConfirmationModal: React.FC<Props> = ({
    isOpen,
    onClose,
    onConfirm,
    description = "Are you sure?",
    confirmText = "Confirm",
    cancelText = "Cancel",
    confirmButtonClass = "bg-red-500 text-white hover:bg-red-600",
    icon,
}) => {
    return (
        <ModalLayout
            isOpen={isOpen}
            onChange={onClose}
            className="z-[99999]"
            modalSize="sm"
            modalComponent={
                <div className="flex flex-col gap-4">
                    <div className="flex justify-center text-red-500">
                        {icon || <CiWarning size={50} />}
                    </div>
                    <p className="text-center text-lg font-medium text-gray-800">{description}</p>
                    <div className="flex justify-center gap-4">
                        <Button
                            onClick={onClose}
                            className="bg-gray-200 text-gray-800 hover:bg-gray-300 px-6"
                        >
                            {cancelText}
                        </Button>
                        <Button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className={`${confirmButtonClass} px-6`}
                        >
                            {confirmText}
                        </Button>
                    </div>
                </div>
            }
        >
            <></>
        </ModalLayout>
    );
};

export default ConfirmationModal;
