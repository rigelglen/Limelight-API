const axios = require('axios');

const targetUrl = `http://localhost:3002/ml/getClassification?url=https://www.xda-developers.com/repurpose-old-android-phone-dash-cam/`;

// const targetUrl = `https://limelightapp.ml`;

// const targetUrl = `http://localhost:3001/clickbait?url=https://www.gadgetsnow.com/tech-news/facebook-to-fund-study-on-social-medias-role-in-democracy/articleshow/69113143.cms`;

// const targetUrl = `http://localhost:3002/`;

(async () => {
  try {
    let r = [];
    for (let i = 0; i < 1; i++) {
      r.push(
        axios.get(targetUrl, {
          headers: {
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1Y2I2YzBkYWFlYzA5YTAwMTUzNDVmNzgiLCJpYXQiOjE1NTYzODg2NDJ9.doS4a_LUSk2nU6WRyoHcvhFegj1QfkC0b5tNHjh6pp4`,
          },
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
