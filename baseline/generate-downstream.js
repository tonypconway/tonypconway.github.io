import fs from "node:fs"
import { type } from "node:os";

const qqInput = fs.readFileSync("./downstream-browsers/mqq.csv", "utf8");
const ucInput = fs.readFileSync("./downstream-browsers/uc.csv", "utf8");

const browsersObject = {

  "QQBrowser": {
    "name": "QQ Mobile Browser",
    "type": "mobile",
    "upstream": "chrome_android",
    "releases": new Map()
  },
  "UCBrowser": {
    "name": "UC Browser",
    "type": "mobile",
    "upstream": "chrome_android",
    "releases": new Map()
  }

};

qqInput.split('\r\n').slice(1).forEach((line) => {

  let [browser, browserVersion, chromeVersion, firstSeen] = line.split(",");

  if (!browserVersion.includes('.')) { browserVersion += ".0" };

  browsersObject["QQBrowser"].releases[browserVersion] = {
    engine: "Blink",
    engine_version: chromeVersion,
    status: "unknown",
    release_date: firstSeen ? firstSeen : 'unknown'
  };
});

ucInput.split("\r\n").slice(1).forEach(line => {
  let [browser, browserVersion, chromeVersion, firstSeen] = line.split(",");

  if (!browserVersion.includes('.')) { browserVersion += ".0" };

  browsersObject["UCBrowser"].releases[browserVersion] = {
    engine: "Blink",
    engine_version: chromeVersion,
    status: "unknown",
    release_date: firstSeen ? firstSeen : 'unknown'
  };

});


fs.writeFileSync("./downstream-browsers/output.json", JSON.stringify({ browsers: browsersObject }, null, 2), { flag: 'w' });