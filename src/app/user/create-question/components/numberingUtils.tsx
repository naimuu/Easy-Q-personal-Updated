import {
    banglaAlphabet,
    englishAlphabet,
    arabicAlphabet,
    romanNumerals,
    banglaNumbers,
    englishNumbers,
    arabicNumbers,
    arabicAbjad
} from "./alphabet";

export const numberingCategories = [
    {
        id: "bangla",
        label: "Bangla",
        options: [
            { label: "ক, খ, গ... (Alpha)", value: "bangla_alpha" },
            { label: "ক) খ) গ)...", value: "bangla_alpha_paren" },
            { label: "ক. খ. গ...", value: "bangla_alpha_dot" },
            { label: "১, ২, ৩... (Num)", value: "bangla_num" },
            { label: "১) ২) ৩)...", value: "bangla_num_paren" },
            { label: "১. ২. ৩...", value: "bangla_num_dot" },
            { label: "১| ২| ৩|...", value: "bangla_num_bar" },
        ]
    },
    {
        id: "english",
        label: "English",
        options: [
            { label: "a, b, c... (Lower)", value: "english_alpha" },
            { label: "a) b) c)...", value: "english_alpha_paren" },
            { label: "a. b. c...", value: "english_alpha_dot" },
            { label: "(a) (b) (c)...", value: "english_alpha_both_paren" },
            { label: "1, 2, 3... (Num)", value: "english_num" },
            { label: "1) 2) 3)...", value: "english_num_paren" },
            { label: "1. 2. 3...", value: "english_num_dot" },
            { label: "(1) (2) (3)...", value: "english_num_both_paren" },
        ]
    },
    {
        id: "arabic",
        label: "Arabic",
        options: [
            { label: "ا, ب, ت... (Alpha)", value: "arabic_alpha" },
            { label: "ا) ب) ت)...", value: "arabic_alpha_paren" },
            { label: "(ا) (ب) (ت)...", value: "arabic_alpha_both_paren" },
            { label: "ا, ب, ج... (Abjad)", value: "arabic_abjad" },
            { label: "ا) ب) ج)...", value: "arabic_abjad_paren" },
            { label: "(ا) (ب) (ج)...", value: "arabic_abjad_both_paren" },
            { label: "١, ٢, ٣... (Num)", value: "arabic_num" },
            { label: "١. ٢. ٣...", value: "arabic_num_dot" },
            { label: "(١) (٢) (٣)...", value: "arabic_num_both_paren" },
        ]
    },
    {
        id: "roman",
        label: "Roman",
        options: [
            { label: "i, ii, iii...", value: "roman" },
            { label: "i) ii) iii)...", value: "roman_paren" },
            { label: "i. ii. iii...", value: "roman_dot" },
            { label: "(i) (ii) (iii)...", value: "roman_both_paren" },
        ]
    },
    {
        id: "other",
        label: "Others",
        options: [
            { label: "① ② ③... (Circle)", value: "circle_num" },
        ]
    }
];

export const numberingOptions = numberingCategories.flatMap(c => c.options); // Backward compatibility if needed


export const getFormattedNumber = (index: number, type: string) => {
    let baseChar = "";
    let style = "default"; // default is just the char, or with specific hardcoded suffix

    // Normalize fallback types to new specific types for backward compatibility
    if (type === "bangla") type = "bangla_alpha_paren";
    if (type === "english") type = "english_alpha_paren";
    if (type === "arabic") type = "arabic_alpha_paren";
    if (type === "roman") type = "roman_paren";

    // Determine base character set
    if (type.includes("bangla_alpha")) {
        baseChar = banglaAlphabet[index % banglaAlphabet.length];
    } else if (type.includes("bangla_num")) {
        baseChar = banglaNumbers[index] || (index + 1).toString(); // Fallback
    } else if (type.includes("english_alpha")) {
        baseChar = englishAlphabet[index % englishAlphabet.length];
    } else if (type.includes("english_num")) {
        baseChar = englishNumbers[index] || (index + 1).toString();
    } else if (type.includes("arabic_alpha")) {
        baseChar = arabicAlphabet[index % arabicAlphabet.length];
    } else if (type.includes("arabic_abjad")) {
        baseChar = arabicAbjad[index % arabicAbjad.length];
    } else if (type.includes("arabic_num")) {
        baseChar = arabicNumbers[index] || (index + 1).toString();
    } else if (type.includes("roman")) {
        baseChar = romanNumerals[index % romanNumerals.length];
    } else if (type === "circle_num") {
        // Unicode circled numbers exist for 1-20, maybe up to 50.
        // ① is \u2460 (1) -> \u2460 + index
        // Let's use unicode if possible, or CSS.
        // 1-20: \u2460 - \u2473
        // 21-35: \u3251 - \u325F
        // 36-50: \u32B1 - \u32BF
        // For safety, let's use a CSS approach for print/web if > 20, but unicode is easier for pure strings.
        // User request: "circle round around number".
        // Let's stick to simple CSS styling or Unicode. Unicode is safest for "string" return type.
        if (index < 20) return String.fromCharCode(0x2460 + index);
        if (index < 35) return String.fromCharCode(0x3251 + index - 20);
        if (index < 50) return String.fromCharCode(0x32B1 + index - 36);
        return `(${index + 1})`; // Fallback
    } else {
        // Default fallback
        return `${index + 1}.`;
    }

    // Determine formatting
    // Determine formatting
    if (type.endsWith("_both_paren")) return `(${baseChar})`;
    if (type.endsWith("_paren")) return `${baseChar})`;
    if (type.endsWith("_dot")) return `${baseChar}.`;
    if (type.endsWith("_bar")) return `${baseChar}|`;
    if (type === "bangla_alpha") return baseChar; // Raw
    if (type === "bangla_num") return baseChar;
    if (type === "english_alpha") return baseChar;
    if (type === "english_num") return baseChar;
    if (type === "arabic_alpha") return baseChar;
    if (type === "arabic_num") return baseChar;
    if (type === "roman") return baseChar;

    return `${baseChar})`; // Default
};

export const toBanglaNumber = (num: number | string): string => {
    const parsed = Number(num);
    if (isNaN(parsed)) return "";
    const display = Number.isInteger(parsed) ? parsed.toString() : parsed.toFixed(1);
    return display.replace(/[0-9.]/g, (char) =>
        char === "." ? "." : "০১২৩৪৫৬৭৮৯"[parseInt(char)]
    );
};

export const toArabicNumber = (num: number | string): string => {
    const parsed = Number(num);
    if (isNaN(parsed)) return "";
    const display = Number.isInteger(parsed) ? parsed.toString() : parsed.toFixed(1);
    return display.replace(/[0-9.]/g, (char) =>
        char === "." ? "." : "٠١٢٣٤٥٦٧٨٩"[parseInt(char)]
    );
};

export const getAnyLabel = (mode: string, count: string | number) => {
    // mode format: custom_bn, custom_ar, custom_en, all_bn, all_ar, all_en
    if (mode === "all_bn") return "সব গুলো";
    if (mode === "all_ar") return "كل";
    if (mode === "all_en") return "All";

    if (mode === "custom_bn") return `যেকোনো ${toBanglaNumber(count)}টি`;
    // Using Arabic for "Any X" -> "أي X" or similar. User prompt said: "any - and اي  ز" -> assuming "أي"
    if (mode === "custom_ar") return `أي ${toArabicNumber(count)}`;
    if (mode === "custom_en") return `Any ${count}`;

    return count.toString();
};
