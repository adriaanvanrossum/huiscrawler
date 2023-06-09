const cheerio = require("cheerio");
const { parseProperties } = require("../lib/chatgpt");

module.exports = {
  baseUrl: "https://www.vindjeplekbijdekey.nl",
  note: "Via Dennis van de Hypotheker",
  targetUrl:
    "https://www.vindjeplekbijdekey.nl/dekey-api/aanbod?stad=27&verkoopstatus=beschikbaar",
  platform: "dekey",
  parseHTML: function ($) {
    const result = [];
    $(".search-list li").each(function (i, elem) {
      const image = $(this).find("img").attr("src");
      const fullImageUrl = image
        ? image.startsWith("/")
          ? `${module.exports.baseUrl}${image}`
          : image
        : null;

      const href = $(this).find("h2 a").attr("href");
      const fullUrl = href?.startsWith("/")
        ? `${module.exports.baseUrl}${href}`
        : href;

      if (!href) return;

      const addressComponents = $(this)
        .find("h2 a")
        .text()
        .split(/,|\n/)
        .map((s) => s.trim())
        .filter(Boolean);

      const street = addressComponents[0];
      const zipcode = addressComponents[1];

      if (href)
        result.push({
          url: fullUrl,
          image: fullImageUrl.replace(/dekey_thumb/, "dossier_big_mobile"),
          street: street,
          zipcode: zipcode,
        });
    });
    return result;
  },

  getAIProperties: async function (fetchWithCookies, result) {
    const page = await fetchWithCookies(result.url);
    const html = await page.text();
    const $ = cheerio.load(html);

    const content = [
      $("#overview")?.text()?.trim(),
      $(".contentsmall")?.text()?.trim(),
      $("aside#features")?.text()?.trim(),
    ];

    return parseProperties(content);
  },
};
