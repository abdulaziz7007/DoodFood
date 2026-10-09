import fs from "fs";
import path from "path";
import { get, put } from "@vercel/blob";
import { seedDB } from "./seed";
import type { DB } from "./types";

const FILE = path.join(process.cwd(), "data", "db.json");
const BLOB_KEY = "doodfood/db.json";
const useBlob = () => !!process.env.BLOB_READ_WRITE_TOKEN;

export async function readDB(): Promise<DB> {
  if (useBlob()) {
    const r = await get(BLOB_KEY, { access: "private", useCache: false });
    if (r && r.statusCode === 200) return JSON.parse(await new Response(r.stream).text());
    const db = seedDB();
    await writeDB(db);
    return db;
  }
  try {
    return JSON.parse(fs.readFileSync(FILE, "utf8"));
  } catch {
    const db = seedDB();
    await writeDB(db);
    return db;
  }
}

export async function writeDB(db: DB) {
  if (useBlob()) {
    await put(BLOB_KEY, JSON.stringify(db), { access: "private", allowOverwrite: true, addRandomSuffix: false, contentType: "application/json", cacheControlMaxAge: 60 });
    return;
  }
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(db, null, 2));
}

export const uid = () => Math.random().toString(36).slice(2, 10);
