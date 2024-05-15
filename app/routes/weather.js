const express = require("express");
const router = express.Router();
const https = require("https");

const wmoUrl = "https://worldweather.wmo.int";

/**
 * @param {int} id
 * @param {Date} date
 * @returns {string}
 */
function wxIconUrl(id, date) {
  let icon = String(id).slice(0, 2);

  if (id >= 2100 && id < 2600) {
    crrtTime = new Date();
    if (
      isSameDay(crrtTime, date) &&
      (crrtTime.getHours() < 4 || crrtTime.getHours() > 18)
    ) {
      icon += "b";
    } else {
      icon += "a";
    }
  }
  return `${wmoUrl}/images/${icon}.png`;
}

/**
 * @param {Date} id
 * @param {Date} date
 * @returns {boolean}
 */
function isSameDay(d1, d2) {
  return (
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear()
  );
}

router.get("/forecast", function (req, res, next) {
  const locale = req.query.locale || "tc";
  const tempUnit = req.query.unit || "C";

  https
    .get(
      `${wmoUrl}/${locale}/json/${req.query.cityId}_${locale}.xml`,
      (resp) => {
        let body = "";

        resp.on("data", (chunk) => {
          body += chunk;
        });

        resp.on("end", () => {
          body = JSON.parse(body);
          const forcasts = body.city.forecast.forecastDay;

          res.json({
            success: true,
            message: "Success.",
            data: {
              issueAt: body.city.forecast.issueDate,
              station: {
                name: body.city.stationName,
                orgName: body.city.member.orgName,
                logo: wmoUrl + `/images/logo/${body.city.member.logo}`,
              },
              city: {
                name: body.city.name,
                latitude: body.city.latitude,
                longitude: body.city.longitude,
                isCapital: body.city.isCapital,
                timeZone: body.city.timeZone,
                isDST: body.city.isDST != "N",
              },
              forcasts: Object.keys(body.city.forecast.forecastDay).map(
                (k) => ({
                  date: forcasts[k].forecastDate,
                  description: forcasts[k].wxdesc,
                  weather: forcasts[k].weather,
                  temp: {
                    min:
                      tempUnit == "C"
                        ? forcasts[k].minTemp
                        : forcasts[k].minTempF,
                    max:
                      tempUnit == "C"
                        ? forcasts[k].maxTemp
                        : forcasts[k].maxTempF,
                  },
                  icon: wxIconUrl(
                    forcasts[k].weatherIcon,
                    new Date(Date.parse(forcasts[k].forecastDate)),
                  ),
                }),
              ),
            },
          });
        });
      },
    )
    .on("error", (err) => {
      res.json({
        success: true,
        message: err.message,
        data: null,
      });
    });
});

module.exports = router;
