import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
  Font,
} from "@react-pdf/renderer";
import {
  ContextCategory,
  QuestionItemsType,
  QuestionType,
} from "../../create-question/components/QuestionContext";
import {
  arabicAlphabet,
  banglaAlphabet,
  englishAlphabet,
  romanNumerals,
} from "../../create-question/components/alphabet";
import { PdfTable } from "./PDFTable";

const toBanglaNumber = (num: number | string): string => {
  const parsed = Number(num);
  if (isNaN(parsed)) return "";

  const display = Number.isInteger(parsed)
    ? parsed.toString()
    : parsed.toFixed(1);

  return display.replace(/[0-9.]/g, (char) =>
    char === "." ? "." : "০১২৩৪৫৬৭৮৯"[parseInt(char)],
  );
};

const toArabicNumber = (num: number | string): string => {
  const parsed = Number(num);
  if (isNaN(parsed)) return "";

  const display = Number.isInteger(parsed)
    ? parsed.toString()
    : parsed.toFixed(1);

  return display.replace(/[0-9.]/g, (char) =>
    char === "." ? "." : "٠١٢٣٤٥٦٧٨٩"[parseInt(char)],
  );
};

const subject = (lang: string) =>
  lang === "bn" ? `বিষয়ঃ ` : lang === "ar" ? `الموضوع: ` : `Subject: `;

const time = (lang: string, hour: string, minute: string) => {
  if (lang === "bn") {
    return `সময়ঃ ${hour} ঘন্টা ${minute} মিঃ`;
  } else if (lang === "ar") {
    return `الوقت: ${hour} ساعة ${minute} دقيقة`;
  } else {
    return `Time: ${hour} hour ${minute} minute`;
  }
};

const mark = (lang: string, mark: number) =>
  lang === "bn"
    ? `পূর্ণমানঃ ${mark}`
    : lang === "ar"
      ? `الدرجة: ${mark}`
      : `Mark: ${mark}`;
const convertIndex = (lang: string, num: number) =>
  lang === "bn"
    ? `${toBanglaNumber(num)}|`
    : lang === "ar"
      ? `${toArabicNumber(num)}.`
      : `${num}.`;
const convertNumber = (lang: string, num: number) =>
  lang === "bn"
    ? `${toBanglaNumber(num)}`
    : lang === "ar"
      ? `${toArabicNumber(num)}`
      : `${num.toFixed(1)}`;

Font.register({
  family: "NotoSansBengali",
  src: "/fonts/Kalpurush-Easy.ttf",
});

const styles = StyleSheet.create({
  page: { padding: 60, fontFamily: "NotoSansBengali" },
  section: { marginBottom: 5 },
  headLine: { fontSize: 22, color: "#000", textAlign: "center" },
  text: { fontSize: 18, color: "#000" },
  flexBox: {
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    flexDirection: "row",
  },
});

const MyPDF = ({ data }: { data: any }) => (

  <Document>
    <Page size="A4" style={styles.page}>
      <Text
        wrap={false}
        style={[
          styles.headLine,
          styles.section,
          {
            fontSize:
              data?.institute?.name?.length > 70 ? 22 :
                data?.institute?.name?.length > 60 ? 26 :
                  data?.institute?.name?.length > 50 ? 32 :
                    data?.institute?.name?.length > 40 ? 38 : 44,
          },
        ]}
      >
        {data?.institute?.name}
      </Text>
      <Text
        style={{
          fontSize: 22,
          textAlign: "center",
        }}
      >
        {data?.examName?.examName}
      </Text>
      <Text
        style={{
          fontSize: 20,
          textAlign: "center",
        }}
      >
        {data?.className ?? data?.class?.name}
      </Text>
      <Text
        style={{
          fontSize: 18,
          textAlign: "center",
        }}
      >
        {subject(data?.type)}
        {data?.subject}
      </Text>
      <View style={styles.flexBox}>
        <Text style={styles.text}>
          {time(data?.type, data?.durationHour, data?.durationMinute)}
        </Text>
        <Text style={styles.text}>{mark(data?.type, data?.totalMarks)}</Text>
      </View>
      <View style={{ flexDirection: "column", marginTop: 30 }}>
        {data?.questions?.map((group: QuestionType, i: number) =>
          group.type === "passage-based" ? (
            <View style={{ flexDirection: "column", marginTop: 10 }} key={i}>
              <Text style={styles.text}>
                {convertIndex(data?.type, i + 1)}{" "} {group?.name}
              </Text>
              <Text style={{ marginLeft: 10 }}>{group.text}</Text>
              <View style={{ flexDirection: "column", gap: 8 }}>
                {(group.questions as ContextCategory[])?.map(
                  (item: ContextCategory, index) => (
                    <View style={{ marginLeft: 10 }} key={item.id}>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text>
                          {data?.type === "bn"
                            ? `${banglaAlphabet[index]})`
                            : data?.type === "ar"
                              ? `${arabicAlphabet[index]})`
                              : `${englishAlphabet[index]})`}{" "}
                          {item?.name}
                        </Text>
                        {item.any && item.mark ? (
                          <Text>
                            {`${convertNumber(data?.type, parseFloat(item.any))} x ${convertNumber(data?.type, parseFloat(item.mark || "1"))} = ${convertNumber(data?.type, parseFloat(item?.any) * parseFloat(item?.mark || "1"))}`}
                          </Text>
                        ) : item.mark ? (
                          <Text>
                            {`${convertNumber(data?.type, parseFloat(item.mark || "1"))}`}
                          </Text>
                        ) : null}
                      </View>
                      {item.type === "word" ? (
                        <View
                          style={{
                            marginLeft: 10,
                            marginTop: 4,
                            flexDirection: "row",
                            gap: 4,
                          }}
                        >
                          {item.questions.map((ques, q) => (
                            <Text key={q}>
                              {ques.question}
                              {item.questions.length - 1 !== q && `,`}
                            </Text>
                          ))}
                        </View>
                      ) : item.type === "objective" ? (
                        <View style={{ marginLeft: 4 }}>
                          {item?.questions?.map((qs: any, s) => (
                            <View style={{ marginLeft: 10 }} key={s}>
                              <Text>
                                {item.numbering === "bangla" ||
                                  (data?.type === "bn" &&
                                    item.numbering !== "roman")
                                  ? `${banglaAlphabet[s]})`
                                  : item.numbering === "english" ||
                                    (data?.type === "en" &&
                                      item.numbering !== "roman")
                                    ? `${englishAlphabet[s]})`
                                    : item.numbering === "arabic" ||
                                      (data?.type === "ar" &&
                                        item.numbering !== "roman")
                                      ? `${arabicAlphabet[s]})`
                                      : `${romanNumerals[s]})`}{" "}
                                {qs?.question}
                              </Text>

                              <View
                                style={{
                                  flexDirection: "row",
                                  flexWrap: "wrap",
                                }}
                              >
                                {qs?.options?.map((rs: any, q: number) => (
                                  <Text
                                    style={{
                                      marginLeft: 10,
                                      marginTop: 4,
                                      flexDirection: "row",
                                      alignItems: "flex-start",

                                      width: "42%",
                                    }}
                                    key={q}
                                  >
                                    {`${romanNumerals[q]})`}{" "} {rs?.name}
                                  </Text>
                                ))}
                              </View>
                            </View>
                          ))}
                        </View>
                      ) : item.type === "table" ? (
                        <View
                          style={{
                            marginTop: 4,
                            flexDirection: "column",
                            gap: 4,
                          }}
                        >
                          {item.questions.map((tab, i) => (
                            <PdfTable htmlTable={tab.table || ""} key={i} />
                          ))}
                        </View>
                      ) : (
                        <View>
                          {item.questions.map((ques, q) => (
                            <Text key={q}>
                              {item.numbering === "bangla"
                                ? `${banglaAlphabet[q]})`
                                : item.numbering === "english"
                                  ? `${englishAlphabet[q]})`
                                  : item.numbering === "arabic"
                                    ? `${arabicAlphabet[q]})`
                                    : `${romanNumerals[q]})`}{" "}
                              {ques.question}
                            </Text>
                          ))}
                        </View>
                      )}
                    </View>
                  ),
                )}
              </View>
            </View>
          ) : group.type === "table" ? (
            <View style={{ flexDirection: "column", gap: 6, marginTop: 10 }} key={i}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                }}
              >
                <Text>{convertIndex(data?.type, i + 1)}{" "} {group?.name}</Text>
                {group.any ? (
                  <Text>
                    {`${convertNumber(data?.type, parseFloat(group.any))} x ${convertNumber(data?.type, parseFloat(group.mark || "1"))} = ${convertNumber(data?.type, parseFloat(group?.any) * parseFloat(group?.mark || "1"))}`}
                  </Text>
                ) : group.mark ? (
                  <Text>
                    {`${convertNumber(data?.type, parseFloat(group.mark || "1"))}`}
                  </Text>
                ) : null}
              </View>
              {group?.questions?.map((ques: QuestionItemsType, ind) => (
                <PdfTable htmlTable={ques.table || ""} key={ind} />
              ))}
            </View>
          ) : group.type === "objective" ? (
            <View style={{ flexDirection: "column", gap: 6, marginTop: 10 }} key={i}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <Text>
                  {convertIndex(data?.type, i + 1)}{" "} {group?.name}
                </Text>
                {group.any ? (
                  <Text>
                    {`${convertNumber(data?.type, parseFloat(group.any))} x ${convertNumber(data?.type, parseFloat(group.mark || "1"))} = ${convertNumber(data?.type, parseFloat(group?.any) * parseFloat(group?.mark || "1"))}`}
                  </Text>
                ) : group.mark ? (
                  <Text>
                    {`${convertNumber(data?.type, parseFloat(group.mark || "1"))}`}
                  </Text>
                ) : null}
              </View>
              {group?.questions?.map((qs: any, s) => (
                <View style={{ marginLeft: 10 }} key={s}>
                  <Text>
                    {group.numbering === "bangla"
                      ? `${banglaAlphabet[s]})`
                      : group.numbering === "english"
                        ? `${englishAlphabet[s]})`
                        : group.numbering === "arabic"
                          ? `${arabicAlphabet[s]})`
                          : `${romanNumerals[s]})`}{" "}
                    {qs?.question}
                  </Text>

                  <View
                    style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}
                  >
                    {qs?.options?.map((rs: any, q: number) => (
                      <Text
                        style={{
                          marginLeft: 5,
                          marginTop: 2,
                          flexDirection: "row",
                          width: "42%",
                          alignItems: "flex-start",
                          gap: 1,
                        }}
                        key={q}
                      >
                        {`${romanNumerals[q]})`}{" "} {rs?.name}
                      </Text>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          ) : group.type === "word" ? (
            <View style={{ flexDirection: "column", gap: 4, marginTop: 10 }} key={i}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                }}
              >
                <Text>
                  {convertIndex(data?.type, i + 1)}{" "} {group?.name}
                </Text>
                {group.any ? (
                  <Text>
                    {`${convertNumber(data?.type, parseFloat(group.any))} x ${convertNumber(data?.type, parseFloat(group.mark || "1"))} = ${convertNumber(data?.type, parseFloat(group?.any) * parseFloat(group?.mark || "1"))}`}
                  </Text>
                ) : group.mark ? (
                  <Text>
                    {`${convertNumber(data?.type, parseFloat(group.mark || "1"))}`}
                  </Text>
                ) : null}
              </View>
              <View
                style={{
                  marginLeft: 10,
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 4,
                }}
              >
                {group.questions.map((ques: any, q) => (
                  <Text key={q}>
                    {ques.question}
                    {group.questions.length - 1 !== q && `,`}
                  </Text>
                ))}
              </View>
            </View>
          ) : group.type === "no" ? (
            <View
              key={i}
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                justifyContent: "space-between",
                marginTop: 10
              }}
            >
              <Text>
                {convertIndex(data?.type, i + 1)}{" "}
                {group?.name}
              </Text>
              {group.any ? (
                <Text>
                  {`${convertNumber(data?.type, parseFloat(group.any))} x ${convertNumber(data?.type, parseFloat(group.mark || "1"))} = ${convertNumber(data?.type, parseFloat(group?.any) * parseFloat(group?.mark || "1"))}`}
                </Text>
              ) : group.mark ? (
                <Text>
                  {`${convertNumber(data?.type, parseFloat(group.mark || "1"))}`}
                </Text>
              ) : null}
            </View>
          ) : (
            <View key={i}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  marginTop: 10
                }}
              >
                <Text>
                  {convertIndex(data?.type, i + 1)}{" "} {group?.name}
                </Text>
                {group.any ? (
                  <Text>
                    {`${convertNumber(data?.type, parseFloat(group.any))} x ${convertNumber(data?.type, parseFloat(group.mark || "1"))} = ${convertNumber(data?.type, parseFloat(group?.any) * parseFloat(group?.mark || "1"))}`}
                  </Text>
                ) : group.mark ? (
                  <Text>
                    {`${convertNumber(data?.type, parseFloat(group.mark || "1"))}`}
                  </Text>
                ) : null}
              </View>
              {group.questions.map((ques: any, q) => (
                <Text style={{ marginLeft: 10 }} key={q}>
                  {group.numbering === "bangla"
                    ? `${banglaAlphabet[q]})`
                    : group.numbering === "english"
                      ? `${englishAlphabet[q]})`
                      : group.numbering === "arabic"
                        ? `${arabicAlphabet[q]})`
                        : `${romanNumerals[q]})`}{" "}
                  {ques.question}
                </Text>
              ))}
            </View>
          ),
        )}
      </View>
    </Page>
  </Document>
);

export default MyPDF;
