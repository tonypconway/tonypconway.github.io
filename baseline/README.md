# Baseline data

This folder contains useful data for developers using Web Platform Baseline as a development target.

## [`csv/core.csv`](csv/core.csv)

This CSV file lists out all the versions of the Baseline core browser set since 2015[^1] in the following columns:

- `browser`: the name of the browser as used in [Mozilla Developer Network's `browser-compat-data/browsers` directory](https://github.com/mdn/browser-compat-data/tree/main/browsers).
- `version`: the version of the browser in question.
- `release_date`: the release date for this browser version where it is known.
- `baseline_wa_compatible`: whether that browser version supports the current Baseline Widely Available feature set.
- `baseline_year_compatible`: the most recent Baseline annual feature set that the browser version is compatible with.

[^1]: For more information on Web Platform Baseline, see [MDN](https://developer.mozilla.org/en-US/docs/Glossary/Baseline/Compatibility).

## [`csv/core-with-downstream.csv`](csv/core-with-downstream.csv)

This CSV file contains all the same information as the `core.csv` file and adds the following columns:

- `engine`: which Engine the browser is based on if it is not part of the Baseline core browser set.
- `engine_version`: which version of the engine is used for this version of the browser.

This data is pulled from two sources:

- [MDN's `browser-compat-data/browsers` directory](https://github.com/mdn/browser-compat-data/tree/main/browsers) which contains mapping data for the following browsers:
  - Opera for Android
  - Opera Desktop
  - Samsung Internet
  - Android Webview
  - Oculus Browser
- Browsers that don't appear in `browser-compat-data`. Currently, these browsers are:
  - UC Browser
  - QQ Browser

## [`csv/manifest.json`](csv/manifest.json)

A JSON object that contains the `lastModified` date for the CSVs in the folder. The CSVs are regenerated daily using the latest version of `browser-compat-data` and the content of [`downstream-browsers.json`](downstream-browsers/downstream-browsers.json).

## [`downstream-browsers/downstream-browsers.json`](downstream-browsers/downstream-browsers.json)

This folder contains data on the versions of Chromium implemented by browsers not already reflected in MDN's `browser-compat-data`. This data is based on user agents strings gathered by [useragents.io](http://useragents.io) and parsed using RegEx. This data is refreshed daily based on the last 7 days of user agent strings for the tracked browsers.
