const { getZipCode } = require("../tools");

module.exports = {
  targetUrl:
    "https://www.eigenhaard.nl/te-koop/zoek?&regions=&prijs_min=200000&prijs_max=1000000&straal=0&woningtype=-1&bouwvorm=-1&oppervlakte=50|1000&kamers=-1&sort=AanmaakDatumDesc&view=List",
  platform: "eigenhaard",
  parseHTML: function ($) {
    const result = [];

    $(".block-default").each(function () {
      const url = $(this).find("a").attr("href");
      const image = $(this).find(".photo img").attr("src");
      const street = $(this).find("h3").text();
      const info = $(this).find(".content p").text();
      const meters = parseInt(
        info.split("\n")[2]?.split("|")[0].replace("m2", "").trim(),
        10
      );
      const price = parseInt(
        $(this)
          .find(".extra-large")
          .text()
          .trim()
          .split(":")[1]
          .replace("€", "")
          .replace(".", "")
          .replace(" k.k.", "")
          .trim(),
        10
      );
      const status = $(this).find(".extra-large").text().split(":")[0].trim();

      if (status !== "Te koop") return;

      const base = "https://www.eigenhaard.nl";

      result.push({
        url: `${base}${url}`,
        image: `${base}${image}`,
        street,
        zipcode: null,
        meters,
        price,
      });
    });

    return result;
  },

  enrichCallback: async function (result) {
    if (result.zipcode) return result;

    const address = `${result.street}, Amsterdam, Netherlands`;
    const zip = await getZipCode(address);
    result.zipcode = zip;
    return result;
  },
};