const metascraper = require('metascraper')([
  require('metascraper-title')(),
  require('metascraper-description')(),
  require('metascraper-image')(),
  require('metascraper-publisher')(),
]);

const axios = require('axios');

const targetUrl = 'https://www.forbes.com/sites/bobcook/2019/04/27/teens-sports-parents-deserve-credit-for-tommy-john-surgery-entering-the-dictionary';

// facebook scrape url alternate ?fields=id,og_object{id,title,type,updated_time,picture}&id=https://www.forbes.com/sites/prishe/2019/04/26/the-business-of-rebranding-a-communitys-sports-soul-how-st-louis-got-its-groove-back/

(async () => {
  try {
    console.time("Time taken")
    const response = await axios.get(targetUrl, { timeout: 3500 });
    const html = response.data;
    const url = response.request.res.req.agent.protocol + "//" + response.request.res.connection._host + response.request.path;
    const metaData = await metascraper({ html, url });

    console.timeEnd("Time taken")

    console.log(metaData);
  } catch (e) {
    console.log("timeout exceeded");
  }
})()