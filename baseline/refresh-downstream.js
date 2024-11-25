import https from 'node:https'
import fs from 'node:fs'


const findLatestVersion = (releases) => {
  return Object.entries(releases).sort((a,b)=>parseFloat(a[0]) - parseFloat(b[0])).pop();
}

const handleUas = (uaObject) => {

  let somethingChanged = false;

  const existingData = JSON.parse(fs.readFileSync('./downstream-browsers/downstream-browsers.json', { encoding: 'utf8' }));

  const versionMappings = new Object();

  const browsers = [
    { 
      name: "QQBrowser", 
      latestExistingVersion: findLatestVersion(existingData.browsers["QQBrowser"].releases) 
    },
    { 
      name: "UCBrowser", 
      latestExistingVersion: findLatestVersion(existingData.browsers["UCBrowser"].releases) 
    },
    // { name: "YABrowser", regex: new RegExp("chrome|Chrome\/(\\d+).*YaBrowser\/(\\d+\\.\\d)") },
    // { name: "CocCocBrowser", regex: new RegExp("coc_coc_browser\/(\\d+).*Chrome\/(\\d+).") }
  ];

  uaObject.uas.reverse().forEach(ua => {
    let regex;
    browsers.forEach(browser => {
      if (ua.ua.includes('coc_coc_browser')) {
        regex = new RegExp("(coc_coc_browser)\/(\\d+).*chrome|Chrome\/(\\d+).");
      } else {
        regex = new RegExp("chrome|Chrome\/(\\d+).*(UCBrowser|YaBrowse|MQQBrowser)\/(\\d+\\.\\d)");
      }
      let browserVersionMatch = ua.ua.match(regex);
      if (browserVersionMatch) {
        let browserName = browser.name;
        let browserVersion;
        let chromiumVersion;
        if (browserVersionMatch[0] == "coc_coc_browser") {
          browserVersion = browserVersionMatch[3];
          chromiumVersion = browserVersionMatch[2];
        } else {
          browserVersion = browserVersionMatch[3];
          chromiumVersion = browserVersionMatch[1];
        }
        if (
          parseFloat(browserVersion) > parseFloat(browser.latestExistingVersion[0])
          &&
          parseFloat(chromiumVersion) >= parseFloat(browser.latestExistingVersion[1].engine_version)
          && 
          !Object.keys(existingData.browsers[browserName].releases).includes(browserVersion.toString())
        ) {
          console.log("adding ", browserName, " version ", browserVersion, " with Chromium version ", chromiumVersion, " and release date ", ua.firstSeen);
            existingData.browsers[browserName].releases[browserVersion] = {
                "engine": "Blink",
                "engine_version": chromiumVersion,
                "status": "unknown",
                "release_date": ua.firstSeen
            }
            somethingChanged = true;
        }
      }
    })
  });

  return [somethingChanged, existingData];
}

if (process.argv.length === 2) {
  console.error('Expected at least one argument!');
  process.exit(1);
} else {

  const options = {
    hostname: 'api.useragents.io',
    port: 443,
    path: '/api/v1/web-platform-baseline',
    method: 'GET',
    headers: {
      'x-api-key': `Bearer ${process.argv[2]}`,
      'Content-Type': ' application/json'
    }
  }

  let latestUas = new String();

  https.request(options, (res) => {

    let output = [];
    console.log('status code: ', res.statusCode)
    res.on('data', (d) => {
      output.push(d);
    });

    res.on('end', () => {
      console.log('no more data');
      latestUas = JSON.parse(Buffer.concat(output).toString());
      let [willWrite, fileOutput] = handleUas(latestUas);
      if (willWrite) {
        fileOutput.lastUpdated = new Date();
        fs.writeFileSync('./downstream-browsers/downstream-browsers.json', JSON.stringify(fileOutput, null, 2), { flags: 'w' })
      } else {
        console.log("no updates at this time");
      }
    });
  }).end();

}
