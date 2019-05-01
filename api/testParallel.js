const axios = require('axios');

const targetUrl = `http://localhost:3001/writing?url=https://www.gadgetsnow.com/tech-news/facebook-to-fund-study-on-social-medias-role-in-democracy/articleshow/69113143.cms`;

// const targetUrl = `https://limelightapp.ml`;

// const targetUrl = `http://localhost:3001/clickbait?url=https://www.gadgetsnow.com/tech-news/facebook-to-fund-study-on-social-medias-role-in-democracy/articleshow/69113143.cms`;

// const targetUrl = `http://localhost:3002/`;

(async () => {
  try {
    let r = [];
    for (let i = 0; i < 10; i++) {
      r.push(
        axios.get(targetUrl, {
          validateStatus: function(status) {
            return status >= 200 && status < 500; // default
          },
        })
      );
    }
    console.time('Time taken');

    // for (let i = 0; i < r.length; i++) {
    //   await r[i];
    // }

    //const response = await axios.get(targetUrl);
    await Promise.all(r);
    console.timeEnd('Time taken');
  } catch (e) {
    console.log('timeout exceeded' + e);
  }
})();
