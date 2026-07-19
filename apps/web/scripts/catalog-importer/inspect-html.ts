import * as cheerio from "cheerio";

export function inspectProductHtml(html: string): void {
  const $ = cheerio.load(html);

  console.log("\nPage title:");
  console.log($("title").first().text().trim());

  console.log("\nHeadings:");

  $("h1, h2, h3, h4, h5, h6").each((_, element) => {
    const tag = element.tagName;
    const text = $(element).text().replace(/\s+/g, " ").trim();

    if (text) {
      console.log(`${tag}: ${text}`);
    }
  });

  console.log("\nDefinition terms:");

  $("dt").each((_, element) => {
    const term = $(element).text().replace(/\s+/g, " ").trim();
    const description = $(element)
      .next("dd")
      .text()
      .replace(/\s+/g, " ")
      .trim();

    if (term || description) {
      console.log(`${term}: ${description}`);
    }
  });

  console.log("\nTable rows:");

  $("tr").each((_, element) => {
    const cells = $(element)
      .find("th, td")
      .map((_, cell) => $(cell).text().replace(/\s+/g, " ").trim())
      .get()
      .filter(Boolean);

    if (cells.length > 0) {
      console.log(cells.join(" | "));
    }
  });
}