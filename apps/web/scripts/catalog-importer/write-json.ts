import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export async function writeTextFile(
  outputPath: string,
  content: string,
): Promise<void> {
  const absolutePath = path.resolve(process.cwd(), outputPath);
  const directory = path.dirname(absolutePath);

  await mkdir(directory, { recursive: true });
  await writeFile(absolutePath, content, "utf8");

  console.log(`File written to: ${absolutePath}`);
}

export async function writeJsonFile(
  outputPath: string,
  value: unknown,
): Promise<void> {
  const json = `${JSON.stringify(value, null, 2)}\n`;

  await writeTextFile(outputPath, json);
}