const cheerio = require("cheerio");
const { parseProperties } = require("../lib/chatgpt");

module.exports = {
  note: "Makelaar gevonden 20 mei 🚶🏽‍♀️",
  targetUrl:
    "https://www.raadsheerbaart.nl/aanbod/woningaanbod/AMSTERDAM/koop/",

  parseHTML: function ($) {
    const result = [];

    $("li.aanbodEntry").each(function () {
      const href = $(this)
        .find('a[href^="/aanbod/woningaanbod/amsterdam/koop/" i]')
        .first()
        .attr("href");
      const url = "https://www.raadsheerbaart.nl" + href;

      const image = $(this).find("img.foto_")?.attr("src");

      if (href) result.push({ url, image });
    });

    return result;
  },

  getAIProperties: async function (fetch, result) {
    const page = await fetch(result.url);
    const html = await page.text();
    const $ = cheerio.load(html);

    const content = [
      "Adres:",
      $(".addressInfo").text(),
      $("#Kenmerken").text(),
      $("#Omschrijving").text(),
    ];

    return parseProperties(content);
  },
};
