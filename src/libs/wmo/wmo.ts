import {
  City,
  Country,
  FutureWeather,
  PresentWeather,
  WmoCityResponse,
  WmoForecastResponse,
  WmoPresentWxResponse,
} from "./definition";
import {Locale, TempUnit} from "./enums";

const wmoUrl = "https://worldweather.wmo.int";

let cityCache = new Map() as Map<
  Locale,
  {lastUpdate: number; data: Array<City>}
>;

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

  let iconId = parseInt(id.slice(0, id.length - 2)).toString(); // remove leading zero
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
export function forecasts(
  cityId: number,
  locale: Locale,
  unit: TempUnit,
  days: number,
): Promise<FutureWeather> {
  return new Promise(function (resolve, reject) {
    fetch(`${wmoUrl}/${locale}/json/${cityId}_${locale}.xml`, {
      next: {revalidate: 300},
    }).then(async (res) => {
      try {
        var json = (await res.json()) as WmoForecastResponse;
      } catch (e) {
        return reject(new Error("Invalid Locale"));
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
        forecasts: json.city.forecast.forecastDay
          .map((forecast) => ({
            date: forecast.forecastDate,
            description: forecast.wxdesc,
            weather: forecast.weather,
            temp: {
              unit: unit,
              min: unit == TempUnit.C ? forecast.minTemp : forecast.minTempF,
              max: unit == TempUnit.C ? forecast.maxTemp : forecast.maxTempF,
            },
            icon: wxIconUrl(forecast.weatherIcon.toString(), false),
          }))
          .slice(0, Math.max(Math.abs(days), 1)),
      });
    });
  });
}

/**
 * Get the present weather data
 */
export function present(
  cityId: number,
  locale: Locale,
  unit: TempUnit,
): Promise<PresentWeather> {
  return new Promise(function (resolve, reject) {
    fetch(`https://worldweather.wmo.int/${locale}/json/present.xml`, {
      next: {revalidate: 300},
    })
      .then(async (res) => {
        try {
          var json = (await res.json()) as WmoPresentWxResponse;
          var wx = Object.entries(json.present).filter(
            ([_, v]) => v.cityId == cityId,
          )[0][1];
        } catch (e) {
          if (e instanceof SyntaxError) {
            return reject(new Error("Invalid Locale"));
          } else {
            return reject(new Error("Invalid City ID"));
          }
        }

        if (!wx) {
          throw new Error(`No data for the city (id: ${cityId})`);
        }

        resolve({
          city: (await city(cityId, locale))!,
          issueAt: wx.issue
            ? new Date(
                wx.issue.slice(0, 4) as any,
                wx.issue.slice(5, 6) as any,
                wx.issue.slice(7, 8) as any,
                wx.issue.slice(9, 10) as any,
                wx.issue.slice(11, 12) as any,
              )
            : null,
          temp:
            wx.temp !== ""
              ? unit == TempUnit.C
                ? wx.temp
                : Math.round(((wx.temp * 9) / 5 + 32 + Number.EPSILON) * 100) /
                  100
              : null,
          tempUnit: unit,
          rh: wx.rh || null,
          weather: wx.wxdesc,
          icon:
            wx.iconNum !== ""
              ? wxIconUrl(wx.iconNum, true)
              : "/images/question_mark.png",
          wind:
            wx.wd !== "" && wx.ws !== ""
              ? {
                  direction: wx.wd,
                  speed:
                    wx.ws !== ""
                      ? Math.round(parseFloat(wx.ws) * 10) / 10
                      : null,
                }
              : null,
          sun: {
            rise: new Date(
              wx.sundate.slice(0, 4) as any,
              wx.sundate.slice(5, 6) as any,
              wx.sundate.slice(7, 8) as any,
              wx.sunrise.slice(0, 2) as any,
              wx.sunrise.slice(3, 4) as any,
            ),
            set: new Date(
              wx.sundate.slice(0, 4) as any,
              wx.sundate.slice(5, 6) as any,
              wx.sundate.slice(7, 8) as any,
              wx.sunset.slice(0, 2) as any,
              wx.sunset.slice(3, 4) as any,
            ),
          },
        });
      })
      .catch(reject);
  });
}

export async function cities(locale: Locale) {
  if (
    !cityCache.has(locale) ||
    (cityCache.has(locale) &&
      Date.now() - cityCache.get(locale)!.lastUpdate! > 604800) // 1 week
  ) {
    await fetch(
      `https://worldweather.wmo.int/${locale}/json/Country_${locale}.xml`,
    )
      .then((res) => res.json())
      .then((json: WmoCityResponse) => {
        /** @type {Array<City>} */
        let cities_ = [];

        for (const [_, country] of Object.entries(json.member)) {
          let c: Country = {
            id: country.memId,
            name: country.memName,
            orgName: country.orgName,
            logo: country.logo ? wmoUrl + `/images/logo/${country.logo}` : "",
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

        cityCache.set(locale, {lastUpdate: Date.now(), data: cities_});
      });
  }
  return cityCache.get(locale)!.data;
}

export async function city(cityId: number, locale: Locale) {
  return (await cities(locale)).find((el) => el.id == cityId);
}
