require('dotenv').config();

const { Topic } = require('./core/db');

(async function() {
  try {
    const topics = [
      {
        name: 'world',
        isCat: true,
        lastRefreshed: new Date(),
      },
      {
        name: 'nation',
        isCat: true,
        lastRefreshed: new Date(),
      },
      {
        name: 'business',
        isCat: true,
        lastRefreshed: new Date(),
      },
      {
        name: 'technology',
        isCat: true,
        lastRefreshed: new Date(),
      },
      {
        name: 'entertainment',
        isCat: true,
        lastRefreshed: new Date(),
      },
      {
        name: 'sports',
        isCat: true,
        lastRefreshed: new Date(),
      },
      {
        name: 'science',
        isCat: true,
        lastRefreshed: new Date(),
      },
      {
        name: 'health',
        isCat: true,
        lastRefreshed: new Date(),
      },
    ];

    return await Topic.insertMany(topics);
  } catch (e) {
    console.error(e);
  }
})();
