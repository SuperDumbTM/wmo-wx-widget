import * as https from "https";
import { Locale, TempUnit } from "./enums";
import { City, Country } from "./definition";

const wmoUrl = "https://worldweather.wmo.int";

let cityCache = new Map() as Map<Locale, {
    lastUpdate: number | null,
    data: Array<City>
}>;

/**
 * Translate the locale codes used by WMO to ISO639 codes.
 */
function wmoToIso639(locale: Locale) {
    const mapping = {
        ar: "ar",
        en: "en",
        tc: "zh-Hant",
        zh: "zh-Hans",
        fr: "fr",
        de: "de",
        it: "it",
        kr: "ko",
        pl: "pl",
        pt: "pt",
        ru: "ru",
        es: "es",
    };

    return mapping[locale] || locale;
}

function wxIconUrl(id: string, daynight: boolean) {
    // ***** Four Digit Icon Code *****
    // xxyy
    // xx: icon ID (see: https://worldweather.wmo.int/en/wxicons.html)
    // yy: 01 = a or 02 = b
    //    There a and b version (day and night) for icons which the ID is between 21 to 25.
    //
    let iconId = String(id).slice(0, id.length - 2);
    let dn = id.slice(-2);
  
    if (parseInt(iconId) >= 21 && parseInt(iconId) <= 25) {
      if (daynight) {
        iconId += dn == "01" ? "a" : "b";
      } else {
        iconId += "a";
      }
    }
  
    return `${wmoUrl}/images/i${iconId}.png`;
}

function isSameDay(d1: Date, d2: Date) {
    return (
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear()
    );
}

function forecasts(cityId: number, locale: Locale, unit: TempUnit) {
    return new Promise(function (resolve, reject) {
      https
        .get(`${wmoUrl}/${locale}/json/${cityId}_${locale}.xml`, (res) => {
          let response = "";
          let json: {
            city: {
                lang: string,
                cityName: string,
                cityLatiude: number,
                cityLongitude: number,
                cityId: number
                isCapital: boolean,
                stationName: string,
                tourismURL: string,
                tourismBoardName: string,
                timeZone: string,
                isDep: boolean,
                isDST: "Y" | "N"
                member: {
                    memId: number,
                    memName: string,
                    shortMemName: string,
                    url: string,
                    orgName: string,
                    logo: string
                    ra: number
                },
                forecast: {
                    issueDate: string,
                    forecastDay: Array<{
                        forecastDate: string,
                        wxdesc: string,
                        weather: string,
                        minTemp: number,
                        maxTemp: number,
                        minTempF: number,
                        maxTempF: number
                        weatherIcon: number
                    }>
                }
                climate: Object
            }
          }
  
          res.on("data", (chunk) => {
            response += chunk;
          });
  
          res.on("end", () => {
            try {
              json = JSON.parse(response);
            } catch (e) {
              console.log(e);
              return reject(new Error("Invalid City ID"));
            }
  
            const forecasts = json.city.forecast.forecastDay;
            resolve({
              issueAt: json.city.forecast.issueDate,
              country: {
                id: json.city.member.memId,
                name: json.city.member.memName,
                orgName: json.city.member.orgName,
                logo: wmoUrl + `/images/logo/${json.city.member.logo}`,
                url: json.city.member.url,
              },
              city: {
                name: json.city.cityName,
                stationName: json.city.stationName,
                latitude: json.city.cityLatiude,
                longitude: json.city.cityLatiude,
                isCapital: json.city.isCapital,
                timeZone: json.city.timeZone,
                isDST: json.city.isDST != "N",
              },
              forecasts: Object.keys(json.city.forecast.forecastDay).map((k) => ({
                date: forecasts[k].forecastDate,
                description: forecasts[k].wxdesc,
                weather: forecasts[k].weather,
                temp: {
                  unit: unit,
                  min: unit == TempUnit.C ? forecasts[k].minTemp : forecasts[k].minTempF,
                  max: unit == TempUnit.C ? forecasts[k].maxTemp : forecasts[k].maxTempF,
                },
                icon: wxIconUrl(forecasts[k].weatherIcon.toString(), false),
              })),
            });
          });
        })
        .on("error", reject);
    });
}

function present(cityId: number, locale: Locale, unit: TempUnit) {
    return new Promise(function (resolve, reject) {
      https
        .get(`https://worldweather.wmo.int/${locale}/json/present.xml`, (res) => {
          let response = "";
          let body: {
            present: Array<{cityId: number
                stnId: string
                stnName: string
                issue: string
                temp: number
                rh: number
                wxdesc: string
                wxImageCode: string
                wd: string
                ws: string
                iconNum: string
                sundate: string
                sunrise: string
                sunset: string
                moonrise: string
                moonset: string
                daynightcode: "a" | "b"
            }>
          }
  
          res.on("data", (chunk) => {
            response += chunk;
          });
  
          res.on("end", async () => {
            try {
              body = JSON.parse(response);
            } catch (e) {
              console.log(e);
              return reject(new Error("Invalid City ID"));
            }
  
            try {
              var rp = Object.entries(body.present).filter(
                ([_, v]) => v.cityId == cityId,
              )[0][1] as any;
            } catch (e) {
              return reject(new Error("Invalid City ID"));
            }
  
            if (!rp) {
              throw new Error(`No data for the city (id: ${cityId})`);
            }
  
            resolve({
              city: await city(cityId, locale),
              issueAt: rp.issue
                ? new Date(
                    rp.issue.slice(0, 4),
                    rp.issue.slice(5, 6),
                    rp.issue.slice(7, 8),
                    rp.issue.slice(9, 10),
                    rp.issue.slice(11, 12),
                  )
                : null,
              temp:
                rp.temp !== ""
                  ? unit == TempUnit.C
                    ? rp.temp
                    : Math.round(
                        ((rp.temp * 9) / 5 + 32 + Number.EPSILON) * 100,
                      ) / 100
                  : null,
              tempUnit: unit,
              rh: rp.rh || null,
              weather: rp.wxdesc,
              icon:
                rp.iconNum !== ""
                  ? wxIconUrl(rp.iconNum, true)
                  : "/static/images/question_mark.png",
              wind:
                rp.wd !== "" && rp.ws !== ""
                  ? {
                      direction: rp.wd,
                      speed:
                        rp.ws !== ""
                          ? Math.round(parseFloat(rp.ws) * 10) / 10
                          : null,
                    }
                  : null,
              sun: {
                rise: new Date(
                  rp.sundate.slice(0, 4),
                  rp.sundate.slice(5, 6),
                  rp.sundate.slice(7, 8),
                  rp.sunrise.slice(0, 2),
                  rp.sunrise.slice(3, 4),
                ),
                set: new Date(
                  rp.sundate.slice(0, 4),
                  rp.sundate.slice(5, 6),
                  rp.sundate.slice(7, 8),
                  rp.sunset.slice(0, 2),
                  rp.sunset.slice(3, 4),
                ),
              },
            });
          });
        })
        .on("error", reject);
    });
}

async function cities(locale: Locale) {
    if (
      !cityCache.has(locale) ||
      (cityCache.has(locale) &&
        Date.now() - cityCache.get(locale)!.lastUpdate! > 1209600000)
    ) {
      // cache not exists or older than two weeks
      cityCache.set(locale, {
        lastUpdate: Date.now(),
        data: await new Promise(function (resolve, reject) {
          https
            .get(
              `https://worldweather.wmo.int/${locale}/json/Country_${locale}.xml`,
              (res) => {
                let response = "";
                let body: {
                    member: Array<{
                        memId: number,
                        memName: string,
                        orgName: string,
                        logo: string,
                        url: string,
                        city: any
                    }>
                };
  
                res.on("data", (chunk) => {
                    response += chunk;
                });
  
                res.on("end", () => {
                  body = JSON.parse(response);
  
                  /** @type {Array<City>} */
                  let cities_ = [];
  
                  for (const [_, country] of Object.entries(body.member)) {
                    let c: Country = {
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
        }),
      });
    }
    return cityCache.get(locale)!.data;
}

async function city(cityId: number, locale: Locale) {
    return (await cities(locale)).find((el) => el.id == cityId);
}
  