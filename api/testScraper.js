const metascraper = require('metascraper')([
  require('metascraper-title')(),
  require('metascraper-description')(),
  require('metascraper-image')(),
  require('metascraper-publisher')(),
]);

const axios = require('axios');

const targetUrl = 'https://www.crictracker.com/world-cup-2019-indian-selectors-were-presented-with-data-analytics-before-squad-selection';

(async () => {
  const response = await axios.get(targetUrl, { timeout: 3000 });
  const html = response.data;
  const url = response.request.res.req.agent.protocol + "//" + response.request.res.connection._host + response.request.path;
  const metaData = await metascraper({ html, url });

  console.log(metaData);
})()