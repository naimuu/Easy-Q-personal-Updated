import * as cheerio from "cheerio";

function parseHtmlTable(html: string) {
  const $ = cheerio.load(html);
  const headers: string[] = [];
  const rows: string[][] = [];

  $("tr").each((rowIndex, tr) => {
    const cells: string[] = [];
    $(tr)
      .find("th, td")
      .each((_, cell) => {
        // .text() already extracts nested <p>, <span>, etc.
        cells.push($(cell).text().trim());
      });

    if (rowIndex === 0) {
      // ✅ if there are <th> use them, otherwise first row is headers
      if ($(tr).find("th").length > 0) {
        headers.push(...cells);
      } else {
        headers.push(...cells);
      }
    } else {
      rows.push(cells);
    }
  });

  return { headers, rows };
}

export default parseHtmlTable;
