"use client";

import ModalLayout from "@/components/Layouts/ModalLayout";
import Button from "@/components/shared/Button";
import Input from "@/components/shared/Input";
import Loader from "@/components/shared/Loader";
import TextArea from "@/components/shared/TextArea";
import {
  useCreateInstituteMutation,
  useGetActiveSubscriptionQuery,
  useGetUserDashboardQuery,
} from "@/redux/services/userService";
import { getLocalStorage, setLocalStorage } from "@/utils/localStorage";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function Home() {
  const { data, isLoading, error, refetch } = useGetUserDashboardQuery();
  const { data: subscriptionData } = useGetActiveSubscriptionQuery();

  // Use questionLimit from subscription if available, otherwise fallback to package default
  const questionLimit =
    subscriptionData?.subscription?.questionLimit ??
    subscriptionData?.subscription?.package?.numberOfQuestions;
  const usedQuestions =
    subscriptionData?.subscription?.usageCount?.questionSetsCreated || 0;
  const remainingQuestions =
    questionLimit !== undefined && questionLimit !== null
      ? Math.max(questionLimit - usedQuestions, 0).toString()
      : "∞";

  // Calculate remaining time for subscription
  const calculateRemainingTime = () => {
    if (!subscriptionData?.subscription?.endDate) {
      return "তথ্য নেই";
    }

    const endDate = new Date(subscriptionData.subscription.endDate);
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();

    if (diff <= 0) {
      return "মেয়াদ শেষ";
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    const banglaDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
    const toBangla = (num: number) =>
      num
        .toString()
        .split("")
        .map((d) => banglaDigits[parseInt(d)])
        .join("");

    return `মেয়াদঃ ${toBangla(days)} দিন ${toBangla(hours)} ঘণ্টা`;
  };

  const remainingTime = calculateRemainingTime();

  console.log("dashboard data:", data);
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const val = getLocalStorage("new");
  //console.log(data);
  //console.log(error)
  useEffect(() => {
    refetch();
    if (val) {
      setIsOpen(true);
    }
  }, [val]);
  return (
    <ModalLayout
      modalComponent={
        <InstituteForm
          close={() => {
            setIsOpen(false);
            setLocalStorage("new", "");
          }}
        />
      }
      onChange={() => setIsOpen(false)}
      isOpen={isOpen}
    >
      <div className="mx-auto max-w-7xl rounded-lg p-4 shadow-sm">
        {/* Balance Section */}
        <div className="mb-8 rounded-lg bg-white p-4 shadow">
          <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-4 rounded-xl p-4 md:flex-row">
            {/* Circle and Set Info */}
            <div className="flex items-center gap-4">
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-[8px] border-blue-300 text-center">
                <div className="text-center leading-tight">
                  <div className="text-2xl font-bold text-black">
                    {remainingQuestions}
                  </div>
                  <div className="text-sm text-black">সেট প্রশ্ন</div>
                </div>
              </div>
              <div className="text-center md:text-left">
                <div className="text-md font-semibold text-black">
                  {remainingTime}
                </div>
              </div>
            </div>

            {/* Package Button */}
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <Link
                  href={"/pricing"}
                  className="w-[120px] rounded-full bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600 md:text-base"
                >
                  প্যাকেজ দেখুন
                </Link>
              </div>
              <div>
                {remainingQuestions === "∞" ||
                  parseInt(remainingQuestions) >= 1 ? (
                  <Link
                    href={"/user/create-question"}
                    className="w-[140px] rounded-full bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600 md:text-base"
                  >
                    📄 প্রশ্ন তৈরি করুন
                  </Link>
                ) : (
                  <button
                    disabled
                    className="w-[150px] cursor-not-allowed rounded-full bg-blue-900 px-4 py-2 text-xs font-semibold text-white opacity-50 md:text-base"
                  >
                    📄 প্রশ্ন তৈরি করুন
                  </button>
                )}
              </div>
            </div>

            {/* Icons Section */}
            <div className="flex w-full justify-center gap-6 text-center text-sm text-gray-600 md:w-auto md:justify-end">
              {[
                { label: "History", path: "M8 17l4 4 4-4m0-5l-4-4-4 4" },
                {
                  label: "Members",
                  path: "M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m0 0a4 4 0 118 0m-4-4a4 4 0 100-8 4 4 0 000 8z",
                },
                {
                  label: "Info",
                  path: "M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z",
                },
              ].map((icon, i) => (
                <div key={i} className="flex flex-col items-center">
                  <svg
                    className="mb-1 h-6 w-6 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d={icon.path}
                    />
                  </svg>
                  <span>{icon.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        {isLoading && <Loader />}
        {/* <div className="flex w-full flex-col gap-6 lg:flex-row">
         
          <div className="flex-1">
            <h2 className="mb-3 text-lg font-semibold sm:text-xl">
              Recent Questions
            </h2>
            {data?.question?.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 rounded-lg bg-white p-5 shadow sm:grid-cols-2 lg:grid-cols-3">
                {data?.question?.map((doc: any, i: number) => (
                  <div
                    onClick={() =>
                      router.push(
                        doc.printed
                          ? `/user/print/${doc.id}`
                          : `/user/create-question?set_id=${doc.id}&page=3&bookId=${doc.bookId}`,
                      )
                    }
                    key={i}
                    className="flex h-[250px] cursor-pointer flex-col overflow-hidden rounded-lg bg-white shadow hover:opacity-45"
                  >
                    <Image
                      src={doc?.book?.cover}
                      alt={doc?.book?.name}
                      width={800}
                      height={800}
                      className="flex h-1/2 w-full items-center justify-center bg-blue-100 font-medium text-gray-600"
                    ></Image>
                    <div className="flex-1 p-3">
                      <h3 className="text-md mb-1 line-clamp-1 font-semibold">
                        {doc.type === "bn"
                          ? "Bangla Question"
                          : doc.type === "en"
                            ? "English Question"
                            : "Arabic Question"}
                      </h3>
                      <h3 className="text-md mb-1">{doc.class.name}</h3>
                       <p className="text-sm text-gray-500">
                        {doc.durationHour} H {doc.durationMinute} M,{" "}
                        {doc.totalMarks} marks
                      </p> 
                      <p className="text-sm text-gray-5">
                        {new Date(doc.date).toDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full w-full bg-white">
                <Image
                  src={"/empty.svg"}
                  className="h-[300px] w-full"
                  width={200}
                  height={200}
                  alt="empty"
                />
              </div>
            )}
          </div>

         
          <div className="flex-1">
            <h2 className="mb-3 text-lg font-semibold sm:text-xl">
              Recent Books
            </h2>
            {data?.books?.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 rounded-lg bg-white p-5 shadow sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
                {data?.books.map((doc: any, i: number) => (
                  <div
                    key={`book-${i}`}
                    className="flex h-[250px] flex-col overflow-hidden rounded-lg bg-white shadow"
                  >
                    <Image
                      src={doc?.cover}
                      alt={doc?.name}
                      width={800}
                      height={800}
                      className="flex h-1/2 w-full items-center justify-center bg-blue-100 font-medium text-gray-600"
                    ></Image>
                    <div className="flex-1 p-3">
                      <h3 className="text-md mb-1 font-semibold">{doc.name}</h3>
                      <p className="text-sm text-gray-500">
                        Short description here.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full w-full bg-white">
                <Image
                  src={"/empty.svg"}
                  className="h-[250px] w-full"
                  width={200}
                  height={200}
                  alt="empty"
                />
              </div>
            )}
          </div>
        </div> */}
        <h2 className="mb-3 text-lg font-semibold sm:text-xl">
          Recent Questions
        </h2>
        {data?.question?.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {data?.question?.map((card: any, index: number) => (
              <div
                onClick={() =>
                  router.push(
                    card.printed
                      ? `/user/print/${card.id}`
                      : `/user/create-question?set_id=${card.id}&page=3&bookId=${card.bookId}`,
                  )
                }
                key={index}
                className="flex min-h-[8rem] cursor-pointer items-stretch overflow-hidden rounded-lg border bg-white shadow"
              >
                <div className="relative w-32 shrink-0 bg-gray-300">
                  <Image
                    src={card.book.cover}
                    alt={card.book.name}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col justify-between p-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {card.examName.examName}
                    </h3>
                    <p className="text-sm text-gray-600">{card?.subject}</p>
                    <p className="mb-2 text-sm text-gray-600">
                      {card.className ?? card.class.name}
                    </p>
                    <div className="text-sm text-gray-500">
                      <div>
                        Total Question: {card?.questions?.length || "0"}
                      </div>
                      <div>{new Date(card.date).toDateString()}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : data?.question?.length === 0 ? (
          <div className="relative h-[300px] w-full bg-white">
            <Image
              src={"/empty.svg"}
              fill
              className="object-contain"
              alt="empty"
              unoptimized
            />
          </div>
        ) : null}
      </div>
    </ModalLayout>
  );
}

const InstituteForm = ({ close }: { close: () => void }) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [address, setAddress] = useState("");

  const [createInstitute, { isLoading }] = useCreateInstituteMutation();

  const handleSubmit = async () => {
    if (!name || !phone) {
      toast.error("All fields are required!");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("phone", phone);
    image && formData.append("image", image);
    address && formData.append("address", address);

    try {
      await createInstitute(formData).unwrap();
      toast.success("Institute created successfully!");
      // Clear fields if needed
      setName("");
      setPhone("");
      setImage(null);
      setAddress("");
      close();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create institute");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Input
        error=""
        label="নাম"
        placeholder="প্রতিষ্ঠানের নাম"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Input
        label="ফোন"
        type="tel"
        placeholder="ইনস্টিটিউটের ফোন নম্বর"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <Input
        type="file"
        label="ছবি (ঐচ্ছিক)"
        onChange={(e) => setImage(e.target.files?.[0] || null)}
      />
      <TextArea
        label="ঠিকানা (ঐচ্ছিক)"
        placeholder="প্রতিষ্ঠানের ঠিকানা"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />
      <Button loading={isLoading} onClick={handleSubmit}>
        জমা দিন
      </Button>
    </div>
  );
};
