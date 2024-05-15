const https = require("https");

/**
 * @typedef  {('ar'|'en'|'tc'|'zh'|'fr'|'de'|'it'|'kr'|'pl'|'pt'|'ru'|'es')} Locale
 */

/**
 * @typedef  {('C'|'F')} TempUnit
 */

/**
 * @typedef {Object} Country
 * @property {number} id - The ID of the country.
 * @property {string} name - The name of the country.
 * @property {string} orgName - The name of the weather organisation.
 * @property {string} logo - The URL to the logo of the organaisation.
 * @property {string} url - The URL to the organaisation.
 */

/**
 * @typedef {Object} City
 * @property {number} id - The ID of the city
 * @property {string} name - The name of the city.
 * @property {Country} country - The details of the country.
 * @property {number} latitude - The latitude of the city.
 * @property {number} longitude - The longitude of the city.
 * @property {boolean} forecast - Whether forecast data is available.
 * @property {boolean} climate - Whether climate data is available.
 * @property {boolean} isCapital - Whether the city is a capital.
 */

/**
 * @typedef {Object} FutureWeather
 * @property {Date} issueAt - The issue time of the forecast.
 * @property {Country} country - The country details of the forecasting city.
 * @property {ForecastCity} city - The details of the forecasting city.
 * @property {Array<Forecast>} forecasts - The daily forecast data.
 */

/**
 * @typedef {Object} ForecastCity
 * @property {string} name - The name of the city.
 * @property {string} stationName - The name of the weather station.
 * @property {number} latitude - The latitude of the city.
 * @property {number} longitude - The longitude of the city.
 * @property {boolean} isCapital - Whether the city is a capital.
 * @property {string} timeZone - The timezone of the city.
 * @property {boolean} isDST - Whether DST is in effective for the city.
 */

/**
 * @typedef {Object} Temperature
 * @property {string} unit - The unit of the temperatures.
 * @property {number} max - Maximum tempreature.
 * @property {number} min - Minimum tempreature.
 */

/**
 * @typedef {Object} Forecast
 * @property {string} date - The date for the forecast.
 * @property {string} description - A description of the forecast.
 * @property {string} weather - The name of the weather condition.
 * @property {Temperature} temp - Tempreature forecasts.
 * @property {string} icon - The URL to the logo of the weather condition.
 */

/**
 * @typedef {Object} CityCache
 * @property {Date | null} lastUpdate - The date for the forecast.
 * @property {Array<City>} data - A description of the forecast.
 */

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
 * @param {Date} d1
 * @param {Date} d2
 * @returns {boolean}
 */
function isSameDay(d1, d2) {
  return (
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear()
  );
}

/**
 * @param {string|number} cityId
 * @param {Locale} locale
 * @param {TempUnit} unit
 * @returns {Promise<FutureWeather>}
 */
function forecasts(cityId, locale, unit) {
  return new Promise(function (resolve, reject) {
    https
      .get(`${wmoUrl}/${locale}/json/${cityId}_${locale}.xml`, (res) => {
        let body = "";

        res.on("data", (chunk) => {
          body += chunk;
        });

        res.on("end", () => {
          body = JSON.parse(body);

          const forecasts = body.city.forecast.forecastDay;
          resolve({
            issueAt: body.city.forecast.issueDate,
            country: {
              id: body.city.member.memId,
              name: body.city.member.memName,
              orgName: body.city.member.orgName,
              logo: wmoUrl + `/images/logo/${body.city.member.logo}`,
              url: body.city.member.url,
            },
            city: {
              name: body.city.name,
              stationName: body.city.stationName,
              latitude: body.city.latitude,
              longitude: body.city.longitude,
              isCapital: body.city.isCapital,
              timeZone: body.city.timeZone,
              isDST: body.city.isDST != "N",
            },
            forecasts: Object.keys(body.city.forecast.forecastDay).map((k) => ({
              date: forecasts[k].forecastDate,
              description: forecasts[k].wxdesc,
              weather: forecasts[k].weather,
              temp: {
                unit: unit,
                min: unit == "C" ? forecasts[k].minTemp : forecasts[k].minTempF,
                max: unit == "C" ? forecasts[k].maxTemp : forecasts[k].maxTempF,
              },
              icon: wxIconUrl(
                forecasts[k].weatherIcon,
                new Date(Date.parse(forecasts[k].forecastDate)),
              ),
            })),
          });
        });
      })
      .on("error", reject);
  });
}

/**
 *
 * @param {string|number} cityId
 * @param {Locale} locale
 * @param {TempUnit} unit
 * @returns {}
 */
function present(cityId, locale, unit) {
  return new Promise(function (resolve, reject) {
    https
      .get(`https://worldweather.wmo.int/${locale}/json/present.xml`, (res) => {
        let body = "";

        res.on("data", (chunk) => {
          body += chunk;
        });

        res.on("end", () => {
          body = JSON.parse(body);

          resolve(
            Object.entries(body.present).filter(
              ([k, v]) => v.cityId == cityId,
            )[0][1],
          );
        });
      })
      .on("error", reject);
  });
}

/**
 *
 * @param {Locale} locale
 * @returns {Promise<Array<City>>}
 */
function cities(locale) {
  return new Promise(function (resolve, reject) {
    https
      .get(
        `https://worldweather.wmo.int/${locale}/json/Country_${locale}.xml`,
        (res) => {
          let body = "";

          res.on("data", (chunk) => {
            body += chunk;
          });

          res.on("end", () => {
            body = JSON.parse(body);

            /** @type {Array<City>} */
            let cities_ = [];

            for (const [_, country] of Object.entries(body.member)) {
              /** @type {Country} */
              let c = {
                id: country.memId,
                name: country.memName,
                orgName: country.orgName,
                logo: country.logo
                  ? wmoUrl + `/images/logo/${country.logo}`
                  : "",
                url: country.url,
              };

              for (let city of country.city || []) {
                cities_.push({
                  id: city.cityId,
                  name: city.cityName,
                  country: c,
                  latitude: city.cityLatitude,
                  longitude: city.cityLongitude,
                  forecast: city.forecast === "Y",
                  climate: city.climate === "Y",
                  isCapital: city.isCapital,
                });
              }
            }
            resolve(cities_);
          });
        },
      )
      .on("error", reject);
  });
}

/**
 * @param {string|number} cityId
 * @param {Locale} locale
 * @returns {City}
 */
async function city(cityId, locale) {
  return (await cities(locale)).filter((v, k) => v.cityId === cityId);
}

module.exports = {forecasts, present, cities};
