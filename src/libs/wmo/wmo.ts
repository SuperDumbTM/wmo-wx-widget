import * as https from "https";
import { Locale, TempUnit } from "./enums";
import { City, Country, FutureWeather, PresentWeather } from "./definition";

const wmoUrl = "https://worldweather.wmo.int";

let cityCache = new Map() as Map<Locale, {
    lastUpdate: number
    data: Array<City>
}>;

/**
 * Translate WMO locale codes used by to ISO639 codes.
 */
export function wmoToIso639(locale: Locale) {
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

/**
 * Get the WMO icon URL by icon ID.
 * 
 * See: https://worldweather.wmo.int/en/wxicons.html
 * 
 * @param id four-digit icon ID 
 * @param daynight Whether to display day/night variation icon (if available)
 */
export function wxIconUrl(id: string, daynight: boolean) {
    // ***** Four Digit Icon Code *****
    // xxyy
    // xx: icon ID (see: https://worldweather.wmo.int/en/wxicons.html)
    // yy: 01 = a or 02 = b
    //    There a and b version (day and night) for icons which the ID is between 21 to 25.

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

/**
 * Get the forecast data
 */
export function forecasts(cityId: number, locale: Locale, unit: TempUnit, days: number): Promise<FutureWeather> {
    return new Promise(function (resolve, reject) {
      https
        .get(`${wmoUrl}/${locale}/json/${cityId}_${locale}.xml`, (res) => {
          let response = "";
          let json: {
            city: {
                lang: string
                cityName: string
                cityLatiude: number
                cityLongitude: number
                cityId: number
                isCapital: boolean
                stationName: string
                tourismURL: string
                tourismBoardName: string
                timeZone: string
                isDep: boolean
                isDST: "Y" | "N"
                member: {
                    memId: number
                    memName: string
                    shortMemName: string
                    url: string
                    orgName: string
                    logo: string
                    ra: number
                },
                forecast: {
                    issueDate: string,
                    forecastDay: Array<{
                        forecastDate: string
                        wxdesc: string
                        weather: string
                        minTemp: number
                        maxTemp: number
                        minTempF: number
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
  
            resolve({
              issueAt: new Date(json.city.forecast.issueDate),
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
              forecasts: json.city.forecast.forecastDay.map((forecast) => ({
                date: forecast.forecastDate,
                description: forecast.wxdesc,
                weather: forecast.weather,
                temp: {
                  unit: unit,
                  min: unit == TempUnit.C ? forecast.minTemp : forecast.minTempF,
                  max: unit == TempUnit.C ? forecast.maxTemp : forecast.maxTempF,
                },
                icon: wxIconUrl(forecast.weatherIcon.toString(), false),
              })).slice(0, Math.max(Math.abs(days), 1)),
            });
          });
        })
        .on("error", reject);
    });
}

/**
 * Get the present weather data
 */
export function present(cityId: number, locale: Locale, unit: TempUnit): Promise<PresentWeather> {
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
              city: (await city(cityId, locale))!,
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

export async function cities(locale: Locale) {
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
                        memId: number
                        memName: string
                        orgName: string
                        logo: string
                        url: string
                        city: Array<{
                          cityName: string
                          enName: string
                          cityLatitude: string
                          cityLongitude: string
                          cityId: number
                          forecast: "Y" | "N,"
                          climate: "Y" | "N"
                          isCapital: boolean
                          stationName: string
                          tourismURL: string
                          tourismBoardName: string
                          isDep: boolean
                          timeZone: string
                        }>
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
                        latitude: parseFloat(city.cityLatitude),
                        longitude: parseFloat(city.cityLongitude),
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

export async function city(cityId: number, locale: Locale) {
    return (await cities(locale)).find((el) => el.id == cityId);
}
  