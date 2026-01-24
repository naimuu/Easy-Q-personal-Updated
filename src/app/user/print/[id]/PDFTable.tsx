import { View, Text, StyleSheet } from "@react-pdf/renderer";
import parseHtmlTable from "./parseHtml";

const styles = StyleSheet.create({
  table: {
    width: "100%",
    borderStyle: "solid",
    borderColor: "black",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    margin: "auto",
    flexDirection: "row",
    width:"100%"
  },
  tableCol: {
    flex: 1,
    borderStyle: "solid",
    borderColor: "black",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 4,
  },
  tableCell: {
    fontSize: 18,
    wordBreak: "break-word",
    width:"calc(100%-8px)"
  },
});

export function PdfTable({ htmlTable }: { htmlTable: string; }) {
    const { headers, rows } = parseHtmlTable(htmlTable);
  return (
    <View style={styles.table}>
      {/* Header row */}
      <View style={styles.tableRow}>
        {headers.map((header, i) => (
          <View style={styles.tableCol} key={i}>
            <Text style={styles.tableCell}>{header}</Text>
          </View>
        ))}
      </View>

      {/* Data rows */}
      {rows.map((row, rowIndex) => (
        <View style={styles.tableRow} key={rowIndex}>
          {row.map((col, colIndex) => (
            <View style={styles.tableCol} key={colIndex}>
              <Text style={styles.tableCell}>{col}</Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}
