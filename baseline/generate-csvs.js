import { getBaselineCSV } from "./index.js";
import fs from "node:fs";

console.log(process.cwd())

fs.writeFileSync('./csv/core.csv', getBaselineCSV(), { flags: 'w' });
fs.writeFileSync('./csv/core-with-downstream.csv', getBaselineCSV(true), { flags: 'w' });
fs.writeFileSync('./csv/manifest.json', JSON.stringify({
  lastUpdated: new Date()
}), { flags: 'w' })