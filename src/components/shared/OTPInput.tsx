import React, { useState } from "react";
import Input from "./Input";

type OtpInputProps = {
  length: number;
  onOtpComplete: (otp: string) => void;
  error?: string;
};

const OtpInput: React.FC<OtpInputProps> = ({
  length,
  onOtpComplete,
  error,
}) => {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(""));

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const value = e.target.value;
    if (/\D/.test(value)) return; // Prevent non-digit input
    const newOtp = [...otp];
    newOtp[index] = value;

    setOtp(newOtp);

    // Trigger onOtpComplete when all OTP digits are filled
    if (newOtp.every((digit) => digit !== "")) {
      onOtpComplete(newOtp.join(""));
    }
    // Move focus to the next input
    const nextInput = document.getElementById(`otp-input-${index + 1}`);
    if (nextInput) {
      nextInput.focus();
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.target.selectionStart === 0) {
      e.target.setSelectionRange(1, 1);
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === "Backspace" && otp[index] === "") {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  return (
    <div>
      <div className="flex space-x-2">
        {otp.map((digit, index) => (
          <Input
            key={index}
            id={`otp-input-${index}`}
            value={digit}
            onChange={(e) => handleChange(e, index)}
            onFocus={handleFocus}
            onKeyDown={(e) => handleKeyDown(e, index)}
            maxLength={1}
            autoFocus={index === 0}
            className="h-12 w-12 rounded-lg border-2 text-center text-lg font-semibold focus:outline-none"
          />
        ))}
      </div>
      {error && <span className="text-red-600">{error}</span>}
    </div>
  );
};

export default OtpInput;