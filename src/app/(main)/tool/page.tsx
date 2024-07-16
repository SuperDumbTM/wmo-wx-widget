"use client";

import "./style.css";

import {Locale} from "@/libs/wmo/enums";
import {useLocale, useTranslations} from "next-intl";
import {useEffect, useState} from "react";
import {createFilter} from "react-select";
import AsyncSelect from "react-select/async";
import {getCity} from "./actions";

export default function Page() {
  const t = useTranslations("common");
  const usrLocale = useLocale();

  const [language, setLanguage] = useState(
    {"zh-Hant": "tc", "zh-Hans": "zh"}[usrLocale] || usrLocale,
  );

  const [cityOption, setCityOption] = useState<
    Array<{value: string; label: string}>
  >([]);

  const [formData, setFormData] = useState({
    align: "start",
    city: "",
    days: "5",
    locale: "",
    unit: "C",
  });

  const [copied, setCopied] = useState(false);

  const [outUrl, setOutUrl] = useState("");

  useEffect(() => {
    // trigger change event to load the city options
    document
      .querySelector("select[name=locale]")
      ?.dispatchEvent(new Event("change", {bubbles: true}));
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <form>
        <div className="space-y-4">
          <div className="border-b border-gray-900/10 pb-6">
            <h1 className="text-xl font-semibold leading-7 text-gray-900">
              {t("Widget Customiser")}
            </h1>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              {t("widget_customiser_help")}
            </p>
          </div>

          <div className="border-b border-gray-900/10 pb-6">
            <div className="flex flex-wrap -mx-3 mb-3">
              <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                <label
                  htmlFor="locale"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  {t("Language")}
                </label>
                <div className="mt-2">
                  <select
                    name="locale"
                    defaultValue={language}
                    onChange={(e) => {
                      setFormData({...formData, locale: e.target.value});
                      setLanguage(e.target.value);

                      if (e.target.value.length != 2) {
                        setCityOption([]);
                        return;
                      }

                      getCity(
                        Locale[
                          (e.target.value[0].toUpperCase() +
                            e.target.value.slice(1)) as keyof typeof Locale
                        ],
                      )
                        .then((cities) => {
                          setCityOption(
                            cities.map((v, i) => {
                              return {value: v.id.toString(), label: v.name};
                            }),
                          );
                        })
                        .catch((_) => []);
                    }}
                    autoComplete="country-name"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                  >
                    <option value={undefined}>-----</option>
                    <option value="ar">لعربية</option>
                    <option value="en">English</option>
                    <option value="tc">繁體中文</option>
                    <option value="zh">简体中文</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                    <option value="it">Italiano</option>
                    <option value="kr">한국어</option>
                    <option value="pl">Polski</option>
                    <option value="pt">Português</option>
                    <option value="ru">Русский</option>
                    <option value="es">Español</option>
                  </select>
                </div>
              </div>

              <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                <label
                  htmlFor="country"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  {t("City")}
                </label>
                <div className="mt-2">
                  <AsyncSelect
                    instanceId="city"
                    name="city"
                    defaultOptions={cityOption}
                    loadOptions={(inputValue, callback) => {
                      callback(
                        cityOption.filter((c) =>
                          c.label
                            .toLocaleLowerCase()
                            .includes(inputValue.toLocaleLowerCase()),
                        ),
                      );
                    }}
                    onChange={(newValue) => {
                      setFormData({...formData, city: newValue!.value});
                    }}
                    filterOption={createFilter({ignoreAccents: false})}
                    className="block w-full sm:max-w-xs sm:text-sm sm:leading-6"
                  ></AsyncSelect>
                </div>
              </div>
            </div>
          </div>

          <div className="border-b border-gray-900/10 pb-6">
            <h2 className="text-base font-semibold leading-7 text-gray-900">
              {t("Display Settings")}
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-600"></p>

            <div className="mt-10 space-y-10">
              <fieldset>
                <legend className="text-sm font-semibold leading-6 text-gray-900">
                  {t("Temperature Unit")}
                </legend>
                <p className="mt-1 text-sm leading-6 text-gray-600"></p>

                <div className="flex mt-6 ">
                  <div className="flex items-center me-4">
                    <input
                      type="radio"
                      name="unit"
                      value="C"
                      checked={formData.unit == "C"}
                      onChange={(e) =>
                        setFormData({...formData, unit: e.target.value})
                      }
                      className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                    />
                    <label
                      htmlFor="inline-checkbox"
                      className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                    >
                      {t("Celsius")} (°C)
                    </label>
                  </div>

                  <div className="flex items-center me-4">
                    <input
                      type="radio"
                      name="unit"
                      value="F"
                      checked={formData.unit == "F"}
                      onChange={(e) =>
                        setFormData({...formData, unit: e.target.value})
                      }
                      className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                    />
                    <label
                      htmlFor="inline-2-checkbox"
                      className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                    >
                      {t("Fahrenheit")} (°F)
                    </label>
                  </div>
                </div>
              </fieldset>

              <fieldset>
                <legend className="text-sm font-semibold leading-6 text-gray-900">
                  {t("Widget Alignment")}
                </legend>
                <p className="mt-1 text-sm leading-6 text-gray-600"></p>

                <div className="flex mt-6 ">
                  <div className="flex items-center me-4">
                    <input
                      type="radio"
                      name="align"
                      value="start"
                      checked={formData.align == "start"}
                      onChange={(e) =>
                        setFormData({...formData, align: e.target.value})
                      }
                      className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                    />
                    <label
                      htmlFor="inline-checkbox"
                      className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                    >
                      {t("Start")}
                    </label>
                  </div>

                  <div className="flex items-center me-4">
                    <input
                      type="radio"
                      name="align"
                      value="center"
                      checked={formData.align == "center"}
                      onChange={(e) =>
                        setFormData({...formData, align: e.target.value})
                      }
                      className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                    />
                    <label
                      htmlFor="inline-2-checkbox"
                      className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                    >
                      {t("Center")}
                    </label>
                  </div>

                  <div className="flex items-center me-4">
                    <input
                      type="radio"
                      name="align"
                      value="end"
                      checked={formData.align == "end"}
                      onChange={(e) =>
                        setFormData({...formData, align: e.target.value})
                      }
                      className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                    />
                    <label
                      htmlFor="inline-2-checkbox"
                      className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                    >
                      {t("End")}
                    </label>
                  </div>
                </div>
              </fieldset>

              <fieldset>
                <legend className="text-sm font-semibold leading-6 text-gray-900">
                  {t("Max Forecast Period")}
                </legend>
                <p className="mt-1 text-sm leading-6 text-gray-600">
                  {t("max_forecast_help")}
                </p>

                <div className="flex mt-6 ">
                  <div className="flex items-center me-4">
                    <button
                      type="button"
                      className="bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-s-lg p-3 h-11 focus:ring-gray-100 focus:ring-2 focus:outline-none"
                      onClick={(_) => {
                        let d = parseInt(formData.days);
                        if (d > 1) {
                          setFormData({
                            ...formData,
                            days: (--d).toString(),
                          });
                        }
                      }}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      className="w-14 h-11 border-gray-300 text-center text-sm focus:ring-blue-300 focus:border-blue-300"
                      value={formData.days}
                      onChange={(e) => {
                        if (e.target.value == "") {
                          setFormData({...formData, days: ""});
                        }
                        if (e.target.value.match(/^[0-9]+$/)) {
                          let d = parseInt(e.target.value);
                          setFormData({
                            ...formData,
                            days: d > 0 ? d.toString() : "1",
                          });
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-e-lg p-3 h-11 focus:ring-gray-100 focus:ring-2 focus:outline-none"
                      onClick={(_) => {
                        let d = parseInt(formData.days);
                        setFormData({
                          ...formData,
                          days: (++d).toString(),
                        });
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              </fieldset>
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-lg font-medium text-gray-700">URL</label>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={outUrl}
                  className="w-full px-3 py-3 pr-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  readOnly
                  disabled
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 px-4 rounded-lg text-gray-500 hover:bg-gray-400/20"
                  onClick={(e) => {
                    if (!copied) {
                      setTimeout(() => {
                        setCopied(false);
                      }, 2000);
                    }
                    setCopied(true);

                    navigator.clipboard.writeText(outUrl);
                  }}
                >
                  <span className={copied ? "hidden" : ""}>
                    <svg
                      className="w-3.5 h-3.5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 18 20"
                    >
                      <path d="M16 1h-3.278A1.992 1.992 0 0 0 11 0H7a1.993 1.993 0 0 0-1.722 1H2a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2Zm-3 14H5a1 1 0 0 1 0-2h8a1 1 0 0 1 0 2Zm0-4H5a1 1 0 0 1 0-2h8a1 1 0 1 1 0 2Zm0-5H5a1 1 0 0 1 0-2h2V2h4v2h2a1 1 0 1 1 0 2Z" />
                    </svg>
                  </span>
                  <span
                    className={`${
                      copied ? "" : "hidden"
                    } inline-flex items-center`}
                  >
                    <svg
                      className="w-3.5 h-3.5 text-green-700"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 16 12"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M1 5.917 5.724 10.5 15 1.5"
                      />
                    </svg>
                  </span>
                </button>
              </div>
              <button
                type="button"
                className="px-4 py-3 text-white rounded-lg bg-indigo-600 hover:bg-indigo-500 focus:outline-none"
                onClick={(_) => {
                  if (formData.city == "") {
                    setOutUrl("");
                    return;
                  }

                  setOutUrl(
                    `${location.host}/forecast/${
                      formData.city
                    }?${new URLSearchParams(
                      Object.fromEntries(
                        Object.entries(formData).filter(([k, v]) => {
                          return v != null && v != "" && k != "city";
                        }),
                      ),
                    )}`,
                  );
                }}
              >
                {t("Generate")}
              </button>
            </div>
            <p
              className={`${
                formData.city == "" ? "" : "hidden"
              } text-red-500 text-xs italic`}
            >
              {t("empty_city_help")}
            </p>
          </div>
        </div>
      </form>
    </main>
  );
}
