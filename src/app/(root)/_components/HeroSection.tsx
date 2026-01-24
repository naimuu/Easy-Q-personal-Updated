"use client";

import { useEffect } from "react";

export default function HeroSection() {
  useEffect(() => {
    const handleScroll = () => {
      const s = window.scrollY;
      const blob1 = document.getElementById("blob1");
      const blob2 = document.getElementById("blob2");
      const blob3 = document.getElementById("blob3");
      const svg1 = document.getElementById("svg1");
      const svg2 = document.getElementById("svg2");

      if (blob1) blob1.style.transform = `translateY(${s * 0.18}px)`;
      if (blob2) blob2.style.transform = `translateY(${-s * 0.12}px)`;
      if (blob3) blob3.style.transform = `translateY(${s * 0.1}px)`;
      if (svg1) svg1.style.transform = `translateY(${-s * 0.22}px)`;
      if (svg2) svg2.style.transform = `translateY(${s * 0.15}px)`;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Animated Background Graphics */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
        <div
          id="blob1"
          className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-cyan-500 opacity-30 rounded-full filter blur-3xl animate-pulse-slow"
        ></div>
        <div
          id="blob2"
          className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-700 opacity-25 rounded-full filter blur-3xl animate-pulse-slower"
        ></div>
        <div
          id="blob3"
          className="absolute top-[30%] left-[60%] w-[300px] h-[300px] bg-pink-500 opacity-20 rounded-full filter blur-2xl animate-pulse"
        ></div>
        <svg
          id="svg1"
          className="absolute left-[10%] top-[60%] w-32 h-32 opacity-20 animate-float"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="50" cy="50" r="40" fill="#38bdf8" />
        </svg>
        <svg
          id="svg2"
          className="absolute right-[15%] top-[20%] w-24 h-24 opacity-15 animate-float delay-1000"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="20" y="20" width="60" height="60" rx="15" fill="#a21caf" />
        </svg>
      </div>

      {/* Hero */}
      <section className="flex flex-col justify-center items-center min-h-screen text-center px-6 relative z-10">
        <h1
          className="
            text-5xl md:text-6xl font-extrabold mb-2 leading-tight animate-pulse
            bg-clip-text text-transparent
            bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600
            dark:bg-gradient-to-r dark:from-cyan-300 dark:via-blue-200 dark:to-purple-200
            dark:drop-shadow-[0_2px_16px_rgba(0,0,0,0.7)]
            [text-rendering:geometricPrecision]
          "
        >
          Easy Q<span className="inline-block align-baseline md:align-middle">✨</span>
        </h1>
        <p className="text-lg md:text-xl mt-2 mb-8 max-w-2xl text-gray-700 dark:text-gray-300">
          নূরানি ও মহিলা মাদ্রাসার শিক্ষক/শিক্ষিকাদের জন্য স্মার্ট ও আধুনিক প্রশ্ন তৈরির সফটওয়্যার। প্রশ্ন তৈরি হবে এখন আরো সহজে, সাশ্রয়ে, দ্রুত ও নিরভুল।
        </p>
        <a
          href="#features"
          className="
            px-8 py-4
            bg-[linear-gradient(40deg,_#22d3ee_0%,_#3b82f6_50%,_#a21caf_100%)]
            dark:bg-[linear-gradient(30deg,_#21dee_0%,_#382f6_50%,_#a21caf_100%)]
            bg-[length:200%_200%] bg-[position:30%] transition-all duration-700 ease-in-out
            hover:bg-[position:100%_50%]
            rounded-lg font-semibold shadow-lg text-white drop-shadow-xl transform hover:-translate-y-1
          "
        >
          ফিচার গুলো দেখুন - &gt;&gt;
        </a>
      </section>
    </>
  );
}
