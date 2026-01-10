"use client";

import React, { useState } from "react";
import SelectBook from "./SelectBook";
import InstituteForm from "./InstituteForm";
import ExamForm from "./ExamInfo";
import AddQuestion from "./AddQuestion";
import { useRouter, useSearchParams } from "next/navigation";

const Page = () => {
  const [step, setStep] = useState(1);
  const params = useSearchParams();
  const page = params.get("page");
  const router = useRouter();
  //console.log(page);
  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => router.back();

  return (
    <div className="mx-auto max-w-7xl py-4 md:px-4 text-gray-6">
      {(page === "1" || page === null) && <SelectBook onNext={nextStep} />}
      {/* {step ===  && <InstituteForm onNext={nextStep} onBack={prevStep} />} */}
      {page === "2" && <ExamForm onNext={nextStep} onBack={prevStep} />}
      {page === "3" && <AddQuestion />}
    </div>
  );
};

export default Page;
