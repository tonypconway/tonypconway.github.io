import { getBaselineCSV } from "./index.js";
import fs from "node:fs";

console.log(process.cwd())

fs.writeFileSync(process.cwd() + '/baseline/csv/core.csv', getBaselineCSV(), { flags: 'w' });
fs.writeFileSync(process.cwd() + '/baseline/csv/core-with-downstream.csv', getBaselineCSV(true), { flags: 'w' });
fs.writeFileSync(process.cwd() + '/baseline/csv/manifest.json', JSON.stringify({
  lastUpdated: new Date()
}), { flags: 'w' })