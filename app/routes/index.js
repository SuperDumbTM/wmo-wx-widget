const express = require("express");
const router = express.Router();
const {forecasts, present, cities, city} = require("../lib/wmo");

/* GET home page. */
router.get("/forecast/:id", async function (req, res, next) {
  const [pwx, fc] = await Promise.all([
    present(req.params.id, req.query.locale || "en", req.query.unit || "C"),
    forecasts(req.params.id, req.query.locale || "en", req.query.unit || "C"),
  ]);

  return res.render("index", {
    title: "Weather for Notion",
    pwx: pwx,
    fc: fc,
    forecasts: fc.forecasts.slice(0, req.query.days || 6),
  });
});

module.exports = router;
