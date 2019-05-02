const disclaimer = `Although we've tried our best to be as accurate as possible while classifying news, we still recommend using your better judgement and fact-check your information before believing it.`;
const clickbaitMessage = [
  `We are fairly certain this article is not clickbait.`,
  `This article might not be clickbait.`,
  `We're conflicted about whether this article is clickbait or not.`,
  `This article might be clickbait.`,
  `We are fairly certain this article is clickbait.`,
];

const writingMessage = [
  `The chances of this article being fake are very high.`, // 0-10 real
  `The chances of this article being fake are high.`, // 10-20 real
  `The chances of this article being fake are fairly high.`, // 20-30 real
  `The chances of this article being fake are moderately high.`, // 30-40 real
  `This article might be fake.`, // 40-50 real
  `This article might be real.`, // 50-60 real
  `The chances of this article being real are moderately high.`, // 60-70 real
  `The chances of this article being real are fairly high.`, // 70-80 real
  `The chances of this article being real are high.`, // 80-90 real
  `The chances of this article being real are very high.`, // 90-100 real
];

const sentimentMessage = [
  `This article is predominantly written in a negative tone.`,
  `This article is predominantly written in a neutral tone.`,
  `This article is predominantly written in a positive tone.`,
];

module.exports = {
  disclaimer,
  clickbaitMessage,
  writingMessage,
  sentimentMessage,
};
