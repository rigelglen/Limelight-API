const axios = require('axios');

// const targetUrl = `http://localhost:3001/writing?url=https://www.gadgetsnow.com/tech-news/facebook-to-fund-study-on-social-medias-role-in-democracy/articleshow/69113143.cms`;

const targetUrl = `https://limelightapp.ml`;

(async () => {
  try {
    console.time('Time taken');
    let r = [];
    for (let i = 0; i < 100; i++) {
      r.push(
        axios.get(targetUrl, {
          validateStatus: function(status) {
            return status >= 200 && status < 500; // default
          },
        })
      );
    }
    //const response = await axios.get(targetUrl);
    await Promise.all(r);
    console.timeEnd('Time taken');
  } catch (e) {
    console.log('timeout exceeded' + e);
  }
})();
