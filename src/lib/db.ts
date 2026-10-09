import fs from "fs";
import path from "path";
import { seedDB } from "./seed";
import type { DB } from "./types";

const FILE = path.join(process.cwd(), "data", "db.json");

export function readDB(): DB {
  try {
    return JSON.parse(fs.readFileSync(FILE, "utf8"));
  } catch {
    const db = seedDB();
    writeDB(db);
    return db;
  }
}

export function writeDB(db: DB) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(db, null, 2));
}

export const uid = () => Math.random().toString(36).slice(2, 10);
