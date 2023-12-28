const axios = require('axios');
const cheerio = require('cheerio');
const { IncomingWebhook } = require('@slack/webhook');
require('dotenv').config()

const webhook = new IncomingWebhook(process.env.SLACK_WEBHOOK_URL);

const ticketList = [
  {name: "東京", prevAvailable: false, url: process.env.URL1}, // 東京公演
  {name: "大阪", prevAvailable: false, url: process.env.URL2}, // 大阪公演
  {name: "愛知", prevAvailable: false, url: process.env.URL3}, // 愛知公演
]

const targetClass = '.block-reserved:not(.ico-no-vacancy-big)'; // 要檢查的 class

function fetchData(ticketInfo) {
  axios.get(ticketInfo.url)
    .then(async response => {

      if (response.status !== 200) return;
      const html = response.data;

      const $ = cheerio.load(html);
      // console.log('---loading---');
      const nowAvailable = $(targetClass).length > 0;

      if(nowAvailable === ticketInfo.prevAvailable) return;

      if (nowAvailable) {
        await webhook.send({
          text: `${ticketInfo.name} 有票了!!!! \n ${ticketInfo.url}`,
        });
        ticketInfo.prevAvailable = nowAvailable;
        // console.log(`網頁中存在 class: "${targetClass}"`);
      } else {
        await webhook.send({
          text: `${ticketInfo.name} 沒票了`,
        });
        // console.log(`網頁中不存在 class: "${targetClass}"`);
      }
    })
    .catch(error => {
      console.error('發生錯誤:', error.message);
    });
}

// 執行 fetchData 函數
setInterval(fetchData.bind(null, ticketList[0]), 3000);
setInterval(fetchData.bind(null, ticketList[1]), 3000);
setInterval(fetchData.bind(null, ticketList[2]), 3000);