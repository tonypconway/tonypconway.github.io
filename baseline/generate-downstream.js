import fs from "node:fs"

const qqInput = fs.readFileSync("./downstream-browsers/mqq.csv");

console.log(qqInput);