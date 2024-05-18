const express = require("express");
const router = express.Router();
const {forecasts, present, cities, city} = require("../lib/wmo");

/* GET home page. */
router.get("/forecast/:id", async function (req, res, next) {
  let locale = req.query.locale || "en";

  const [pwx, fc] = await Promise.all([
    present(req.params.id, locale, req.query.unit || "C"),
    forecasts(req.params.id, locale || "en", req.query.unit || "C"),
  ]);

  console.log(fc.forecasts);

  return res.render("index", {
    title: "Weather for Notion",
    locale: locale,
    pwx: pwx,
    fc: fc,
    forecasts: fc.forecasts.slice(0, req.query.days || 6),
  });
});

module.exports = router;
