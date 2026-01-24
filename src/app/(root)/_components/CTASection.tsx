import Link from "next/link";

export default function CTASection() {
  return (
    <section className="py-20 bg-gray-300 dark:bg-black text-center">
      <h2 className="text-3xl md:text-4xl font-extrabold mb-8 text-gray-900 dark:text-gray-100">
        এখনই চেষ্টা করুন
      </h2>
      <Link href="#" className="mt-6 inline-block px-5 py-3 bg-blue-500 hover:bg-blue-400 text-white rounded-full font-semibold">
        শুরু করুন
      </Link>
    </section>
  );
}
