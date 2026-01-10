export default function FeaturesSection() {
  return (
    <section
      id="features"
      className="relative z-10 mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-3"
    >
      {/* Card 1 */}
      <div className="glass-card animate-float transform rounded-xl border border-gray-200 bg-white/20 p-8 text-gray-500 shadow-xl transition hover:scale-105 dark:border-gray-700 dark:bg-white/10 dark:text-gray-100">
        <div className="mb-4 flex items-center justify-center text-4xl">📘</div>
        <h3 className="mb-2 text-center text-2xl font-semibold text-cyan-700 dark:text-cyan-400">
          মুল বই থেকে প্রশ্ন তৈরি
        </h3>
        <p className="text-center text-gray-700 dark:text-gray-300">
          পাঠ্যবই থেকে সরাসরি প্রশ্ন নিয়ে প্রশ্নপত্র তৈরি করুন।
        </p>
      </div>

      {/* Card 2 */}
      <div className="glass-card animate-float transform rounded-xl border border-gray-200 bg-white/20 p-8 text-gray-900 shadow-xl transition delay-200 hover:scale-105 dark:border-gray-700 dark:bg-white/10 dark:text-gray-100">
        <div className="mb-4 flex items-center justify-center text-4xl">✍️</div>
        <h3 className="mb-2 text-center text-2xl font-semibold text-blue-600 dark:text-blue-300">
          নিজের প্রশ্ন যোগ করুন
        </h3>
        <p className="text-center text-gray-700 dark:text-gray-300">
          মুল বইয়ের প্রশ্নের পাশাপাশি নিজের প্রশ্ন যুক্ত করতে পারবেন।
        </p>
      </div>

      {/* Card 3 */}
      <div className="glass-card animate-float delay-400 transform rounded-xl border border-gray-200 bg-white/20 p-8 text-gray-900 shadow-xl transition hover:scale-105 dark:border-gray-700 dark:bg-white/10 dark:text-gray-100">
        <div className="mb-4 flex items-center justify-center text-4xl">🔍</div>
        <h3 className="mb-2 text-center text-2xl font-semibold text-purple-600 dark:text-purple-300">
          প্রশ্ন সার্চ ও হাইলাইট
        </h3>
        <p className="text-center text-gray-700 dark:text-gray-300">
          অধ্যায় অনুযায়ী প্রশ্ন খুঁজুন সহজেই। যে কোন প্রশ্ন টাইপ করলেই চলে আসবে
          আপনার সামনে। পূর্বে যুক্ত করা প্রশ্ন হাইলাইট থাকবে।
        </p>
      </div>

      {/* Card 4 */}
      <div className="glass-card animate-float delay-600 transform rounded-xl border border-gray-200 bg-white/20 p-8 text-gray-900 shadow-xl transition hover:scale-105 dark:border-gray-700 dark:bg-white/10 dark:text-gray-100">
        <div className="mb-4 flex items-center justify-center text-4xl">🛠️</div>
        <h3 className="mb-2 text-center text-2xl font-semibold text-indigo-600 dark:text-indigo-300">
          এডিট ও কাস্টমাইজ
        </h3>
        <p className="text-center text-gray-700 dark:text-gray-300">
          প্রশ্ন কপি, সংশোধন ও সাজাতে পারবেন আপনার মতো করে।
        </p>
      </div>

      {/* Card 5 */}
      <div className="glass-card animate-float delay-800 transform rounded-xl border border-gray-200 bg-white/20 p-8 text-gray-900 shadow-xl transition hover:scale-105 dark:border-gray-700 dark:bg-white/10 dark:text-gray-100">
        <div className="mb-4 flex items-center justify-center text-4xl">📝</div>
        <h3 className="mb-2 text-center text-2xl font-semibold text-sky-600 dark:text-sky-300">
          মার্কস / নম্বরিং যুক্ত করুন
        </h3>
        <p className="text-center text-gray-700 dark:text-gray-300">
          প্রতি প্রশ্নে নির্দিষ্ট মার্ক ড্রপডাউন থেকে যুক্ত করুন আরও দ্রুত।
          প্রশ্নের নম্বরিং হবে নিজে নিজেই।
        </p>
      </div>

      {/* Card 6 */}
      <div className="glass-card animate-float transform rounded-xl border border-gray-200 bg-white/20 p-8 text-gray-900 shadow-xl transition delay-1000 hover:scale-105 dark:border-gray-700 dark:bg-white/10 dark:text-gray-100">
        <div className="mb-4 flex items-center justify-center text-4xl">📄</div>
        <h3 className="mb-2 text-center text-2xl font-semibold text-pink-600 dark:text-pink-300">
          PDF/প্রিন্ট রেডি
        </h3>
        <p className="text-center text-gray-700 dark:text-gray-300">
          এক ক্লিকে PDF বা প্রিন্ট রেডি আউটপুট পেয়ে যাবেন।
        </p>
      </div>
    </section>
  );
}
