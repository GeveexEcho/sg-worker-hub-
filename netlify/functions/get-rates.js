const axios = require('axios');
const cheerio = require('cheerio');

exports.handler = async () => {
  try {
    const { data } = await axios.get('https://www.mustafa.com.sg/Forex.aspx');
    const $ = cheerio.load(data);
    const bdtRate = $("td:contains('BANGLADESH TAKA')").next().text().trim();
    const goldPrice = $("td:contains('GOLD 22CT')").next().text().trim();

    return {
      statusCode: 200,
      body: JSON.stringify({ bdt: bdtRate, gold: goldPrice }),
    };
  } catch (error) {
    return { statusCode: 500, body: String(error) };
  }
};
