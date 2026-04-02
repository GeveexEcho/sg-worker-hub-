const axios = require('axios');
const cheerio = require('cheerio');

exports.handler = async () => {
  try {
    const { data } = await axios.get('https://www.mustafa.com.sg/Forex.aspx', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 5000
    });
    
    const $ = cheerio.load(data);
    
    const bdtRate = $("td:contains('BANGLADESH TAKA')").next().text().trim() || "0.00";
    const goldPrice = $("td:contains('GOLD 22CT')").next().text().trim() || "0.00";

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bdt: bdtRate, gold: goldPrice }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
