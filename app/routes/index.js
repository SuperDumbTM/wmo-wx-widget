const express = require("express");
const countryData = require("country-data");
const {forecasts, present, cities, city} = require("../lib/wmo");
const {wmoToIso639} = require("../lib/locale");

const router = express.Router();

/* GET home page. */
router.get("/forecast/:id", async function (req, res, next) {
  req.query.locale = req.query.locale || "en";
  req.query.unit = req.query.unit || "C";
  req.query.datetime = req.query.datetime || "weekday";
  req.query.days = req.query.days || 6;
  req.query.aligh = req.query.aligh || "start";

  const iso639 = wmoToIso639(req.query.locale);

  const [pwx, fc] = await Promise.all([
    present(req.params.id, req.query.locale, req.query.unit),
    forecasts(req.params.id, req.query.locale || "en", req.query.unit),
  ]);

  // TODO
  // req.query.locale =
  //   countryData.countries[req.query.locale.toUpperCase()].alpha3;

  return res.render("forecast/index", {
    title: "Weather for Notion",
    query: req.query,
    iso639: iso639,
    pwx: pwx,
    fc: fc,
    forecasts: fc.forecasts.slice(0, req.query.days),
  });
});

module.exports = router;
