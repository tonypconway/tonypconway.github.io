import bcd from '@mdn/browser-compat-data' assert { type: 'json' };
import otherDownstream from './downstream-browsers/downstream-browsers.json' assert { type: 'json' }

// https://github.com/web-platform-dx/web-features/blob/main/docs/baseline.md#core-browser-set
const browsers = [
  "chrome",
  "chrome_android",
  "edge",
  "firefox",
  "firefox_android",
  "safari",
  "safari_ios",
];

// Earliest release year for each of the Baseline browsers
const browsersFirstYear = {
  "chrome": 2008,
  "chrome_android": 2012,
  "edge": 2015,
  "firefox": 2004,
  "firefox_android": 2011,
  "safari": 2003,
  "safari_ios": 2007
}

export function getMinBaselineVersionByBrowserAndYear(browser, year) {

  let arrayOfVersions = new Array();

  Object.entries(
    Object.fromEntries(
      Object.entries(bcd.browsers[browser].releases).filter(
        ([version, data]) => {
          if (!['current', 'esr', 'retired'].includes(data.status)) {
            return false;
          }
          if (!data.release_date.startsWith(`${year}-`)) {
            return false;
          }
          return true;
        }
      )
    )
  ).forEach(data => {
    arrayOfVersions.push({ version: data[0], release_date: data[1].release_date });
  }, 0);

  if (arrayOfVersions.length != 0) {
    return arrayOfVersions.sort((a, b) => Date.parse(a.release_date) - Date.parse(b.release_date)).pop();
  } else if (year >= browsersFirstYear[browser]) {
    return getMinBaselineVersionByBrowserAndYear(browser, year - 1)
  } else {
    return null
  }
}

export function getMinBaselineVersionsByYear(year) {

  if (year < 2004) {
    throw ("There are no compatible Baseline browser versions before 2004!")
  }

  let versionsByYear = {}

  browsers.forEach(browser => {

    versionsByYear[browser] = {}

    let finalVersion = getMinBaselineVersionByBrowserAndYear(browser, year);

    versionsByYear[browser] =
      finalVersion != null
        ? finalVersion
        : getMinBaselineVersionByBrowserAndYear(browser, year - 1);
  });

  return versionsByYear;

}

export function getAllMinBaselineVersions(startingYear = 2016) {

  const currentYear = new Date().getFullYear();
  const finalVersionsPerYear = {};

  for (let year = startingYear; year <= currentYear; year++) {

    finalVersionsPerYear[year] = getMinBaselineVersionsByYear(year);

  }

  return finalVersionsPerYear;
};

export function getBaselineVersionsArray() {

  let allVersions = new Array();

  let baselineWAEpoch = Math.floor(new Date().setMonth(new Date().getMonth() - 30) / 1000);

  browsers.forEach((browser) => {
    let currentYear = 2016;
    Object.entries(bcd.browsers[browser].releases)
      // Filter out versions 
      .filter(([version, details]) => {
        {
          if (!['current', 'esr', 'retired'].includes(details.status)) {
            return false;
          }
          if (Date.parse(details.release_date) < Date.parse('2016.01.01')) {
            return false;
          }
          return [version, details];
        }
      })
      .sort((a, b) =>
        Date.parse(a[1].release_date) - Date.parse(b[1].release_date)
      )
      .forEach(([version, details], index, arr) => {

        let versionIsBaselineWA = (Date.parse(details.release_date) / 1000 > baselineWAEpoch);

        let versionBaselineYear = currentYear;

        if (index < arr.length - 1) {

          if (details.release_date.substring(0, 4) == arr[index + 1][1].release_date.substring(0, 4)) {
            versionBaselineYear--;
          } else {
            currentYear++;
          }
        }

        allVersions.push({
          browser: browser,
          version: version,
          release_date: details.release_date,
          baseline_wa_compatible: versionIsBaselineWA,
          baseline_year_compatible: versionBaselineYear
        });
      }
      );
  })

  return allVersions;

}

export function getBaselineVersionsArrayWithDownstream() {
  let browsersArray = getBaselineVersionsArray();
  const mdnDownstreamBrowsers = [
    'opera_android',
    'opera',
    'samsunginternet_android',
    'webview_android',
    'oculus'
  ];

  const otherDownstreamBrowsers = Object.keys(otherDownstream.browsers);

  console.log(otherDownstreamBrowsers);

  let chromeVersions = browsersArray.filter(version => {
    if (version.browser === 'chrome') {
      return version
    }
  });

  let downstreamBrowsersArray = new Array();

  mdnDownstreamBrowsers.forEach(browser => {
    Object.entries(bcd.browsers[browser].releases).filter(([version, details]) => {
      {
        if (!['current', 'esr', 'retired'].includes(details.status)) {
          return false;
        }
        if (Date.parse(details.release_date) < Date.parse('2016.01.01')) {
          return false;
        }
        if (details.engine != 'Blink') {
          return false;
        }
        downstreamBrowsersArray.push([browser, version, details]);
      }
    })
  });

  otherDownstreamBrowsers.forEach(browser => {
    console.log(browser);
    Object.entries(otherDownstream.browsers[browser].releases).forEach(([version, details]) => {
      downstreamBrowsersArray.push([browser, version, details])
    })
  });

  downstreamBrowsersArray
    .forEach(([browser, version, details]) => {

      let mappedVersion = chromeVersions.find(chromeVersion => chromeVersion.version === details.engine_version);

      if (mappedVersion) {
        browsersArray.push({
          browser: browser,
          version: version,
          release_date: details.release_date,
          baseline_wa_compatible: mappedVersion.baseline_wa_compatible,
          baseline_year_compatible: mappedVersion.baseline_year_compatible,
          engine: details.engine,
          engine_version: details.engine_version
        });
      }

    });

  return browsersArray;

}

export function getBaselineCSV(includeDownstream = false) {
  let csv = '"browser","version","release_date","baseline_wa_compatible","baseline_year_compatible"';

  if (includeDownstream) {
    csv += ',"engine","engine_version"'
  }

  csv += '\n'

  let versionArray = includeDownstream
    ? getBaselineVersionsArrayWithDownstream()
    : getBaselineVersionsArray();

  versionArray.forEach((version) => {
    csv += `"${version.browser}","${version.version}","${version.release_date}","${version.baseline_wa_compatible}","${version.baseline_year_compatible}"`;
    if (version.engine_version) {
      csv += `,"${version.engine}","${version.engine_version}"\n`
    } else {
      csv += `,,\n`
    }
  });

  return csv;
}