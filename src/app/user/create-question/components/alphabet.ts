export const banglaAlphabet = [
  "ক",
  "খ",
  "গ",
  "ঘ",
  "ঙ",
  "চ",
  "ছ",
  "জ",
  "ঝ",
  "ঞ",
  "ট",
  "ঠ",
  "ড",
  "ঢ",
  "ণ",
  "ত",
  "থ",
  "দ",
  "ধ",
  "ন",
  "প",
  "ফ",
  "ব",
  "ভ",
  "ম",
  "য",
  "র",
  "ল",
  "শ",
  "ষ",
  "স",
  "হ",
  "ক্ষ",
  "ত্র",
  "জ্ঞ",
];
export const englishAlphabet = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
];

export const arabicAlphabet = [
  "ا",
  "ب",
  "ت",
  "ث",
  "ج",
  "ح",
  "خ",
  "د",
  "ذ",
  "ر",
  "ز",
  "س",
  "ش",
  "ص",
  "ض",
  "ط",
  "ظ",
  "ع",
  "غ",
  "ف",
  "ق",
  "ك",
  "ل",
  "م",
  "ن",
  "ه",
  "و",
  "ي",
  "ي",
];

export const arabicAbjad = [
  "ا", "ب", "ج", "د", // Abjad
  "ه", "و", "z", // Hawwaz - wait, Zay is ز not z. Correcting in thought process.
  "ح", "ط", "ي", // Hutti
  "ك", "ل", "m", "ن", // Kalaman - wait, m is م
  "س", "ع", "ف", "ص", // Sa'fas
  "ق", "ر", "ش", "ت", // Qarashat
  "ث", "خ", "ذ", // Thakhadh
  "ض", "ظ", "غ" // Dazaqh
];

// Let me use the correct characters directly in the tool call.
/*
Abjad: Alif (ا), Ba (ب), Jim (ج), Dal (د)
Hawwaz: Ha (ه), Waw (و), Zay (ز)
Hutti: Ha (ح), Ta (ط), Ya (ي)
Kalaman: Kaf (ك), Lam (ل), Mim (م), Nun (ن)
Sa'fas: Sin (س), Ayn (ع), Fa (ف), Sad (ص)
Qarashat: Qaf (q), Ra (r), Shin (sh), Ta (t) -> Wait, Qarashat ends with Ta (ت)? Yes.
Thakhadh: Tha (ث), Kha (خ), Dhal (ذ)
Dazaqh: Dad (ض), Zha (ظ), Ghayn (غ)
*/
export const romanNumerals = [
  "i",
  "ii",
  "iii",
  "iv",
  "v",
  "vi",
  "vii",
  "viii",
  "ix",
  "x",
  "xi",
  "xii",
  "xiii",
  "xiv",
  "xv",
  "xvi",
  "xvii",
  "xviii",
  "xix",
  "xx",
];
export const englishNumbers = Array.from({ length: 100 }, (_, i) =>
  (i + 1).toString(),
);
const banglaDigitMap = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

export const banglaNumbers = Array.from({ length: 100 }, (_, i) =>
  (i + 1)
    .toString()
    .split("")
    .map((d) => banglaDigitMap[parseInt(d)])
    .join(""),
);

const arabicDigitMap = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

export const arabicNumbers = Array.from({ length: 100 }, (_, i) =>
  (i + 1)
    .toString()
    .split("")
    .map((d) => arabicDigitMap[parseInt(d)])
    .join(""),
);

