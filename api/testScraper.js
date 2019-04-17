const metascraper = require('metascraper')([
  require('metascraper-title')(),
  require('metascraper-description')(),
  require('metascraper-image')(),
  require('metascraper-publisher')(),
]);

const axios = require('axios');

const targetUrl = 'https://www.theguardian.com/business/2019/apr/17/fca-must-adapt-to-changing-technology-to-regulate-city-andrew-bailey';

(async () => {
  try {
    const old = Date.now()
    const response = await axios.get(targetUrl, { timeout: 3500 });
    const html = response.data;
    const url = response.request.res.req.agent.protocol + "//" + response.request.res.connection._host + response.request.path;
    const metaData = await metascraper({ html, url });

    console.log(`Time taken => ${Date.now() - old}`)

    console.log(metaData);
  } catch (e) {
    console.log("timeout exceeded");
  }
})()