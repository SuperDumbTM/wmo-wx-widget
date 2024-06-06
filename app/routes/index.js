const express = require("express");
const wmo = require("../lib/wmo");

const router = express.Router();

/* GET home page. */
router.get("/forecast/:id", async function (req, res, next) {
  req.query.locale = req.query.locale || "en";
  req.query.unit = req.query.unit || "C";
  req.query.datetime = req.query.datetime || "weekday";
  req.query.days = req.query.days || 6;
  req.query.aligh = req.query.aligh || "start";

  if (!wmo.locales.includes(req.query.locale)) {
    req.query.locale = "en";
  }

  await Promise.all([
    wmo.present(req.params.id, req.query.locale, req.query.unit),
    wmo.forecasts(req.params.id, req.query.locale || "en", req.query.unit),
  ])
    .then(([pwx, fc]) => {
      return res.render("forecast/index", {
        title: "Weather for Notion",
        query: req.query,
        iso639: wmo.wmoToIso639(req.query.locale),
        pwx: pwx,
        fc: fc,
        forecasts: fc.forecasts.slice(0, req.query.days),
      });
    })
    .catch(next);
});

module.exports = router;
