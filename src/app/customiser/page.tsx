"use client";

import {useTranslations} from "next-intl";
import {useState} from "react";
import {Locale} from "@/libs/wmo/enums";
import {getCity} from "./actions";
import Select, {createFilter} from "react-select";
import AsyncSelect from "react-select/async";

export default function Page() {
  const t = useTranslations("common");

  const [language, setLanguage] = useState("");

  const [cityOption, setCityOption] = useState<
    Array<{value: string; label: string}>
  >([]);

  const [formData, setFormData] = useState({
    locale: "",
    city: "",
    unit: "C",
    align: "start",
  });

  const [copied, setCopied] = useState(false);

  const [outUrl, setOutUrl] = useState("");

  function updateUrl() {
    setOutUrl(
      `${location.host}/forecast/${formData.city}?${new URLSearchParams(
        Object.fromEntries(
          Object.entries(formData).filter(([k, v]) => {
            return v != null && v != "" && k != "city";
          }),
        ),
      )}`,
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <form>
        <div className="space-y-4">
          <div className="border-b border-gray-900/10 pb-6">
            <h1 className="text-xl font-semibold leading-7 text-gray-900">
              Widget Customiser
            </h1>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              This information will be displayed publicly so be careful what you
              share.
            </p>
          </div>

          <div className="border-b border-gray-900/10 pb-6">
            <div className="flex flex-wrap -mx-3 mb-3">
              <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                <label
                  htmlFor="country"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Language
                </label>
                <div className="mt-2">
                  <select
                    name="country"
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
              <div className="w-full md:w-1/2 px-3">
                <label
                  htmlFor="country"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  City
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
                    // className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                  ></AsyncSelect>
                </div>
              </div>
            </div>
          </div>

          <div className="border-b border-gray-900/10 pb-6">
            <h2 className="text-base font-semibold leading-7 text-gray-900">
              Display Settings
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              Customising on how the weather information will be displayed.
            </p>

            <div className="mt-10 space-y-10">
              <fieldset>
                <legend className="text-sm font-semibold leading-6 text-gray-900">
                  Temperature Unit
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
                      Celsius (°C)
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
                      Fahrenheit (°F)
                    </label>
                  </div>
                </div>
              </fieldset>

              <fieldset>
                <legend className="text-sm font-semibold leading-6 text-gray-900">
                  Widget Alignment
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
                      Start
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
                      Center
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
                      End
                    </label>
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
                onClick={(e) => {
                  updateUrl();
                }}
              >
                Generate
              </button>
            </div>
          </div>

          {/* <div className="mt-6 flex gap-x-2">
            <div className="w-full max-w-[16rem]">
              <div className="relative">
                <input
                  type="text"
                  className="col-span-6 bg-gray-50 border border-gray-300 text-gray-500 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  value={outUrl}
                  disabled
                  readOnly
                />
                <button
                  className="absolute end-2 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg p-2"
                  onClick={(e) => {
                    if (!copied) {
                      setTimeout(() => {
                        setCopied(false);
                      }, 2000);
                    }
                    setCopied(true);
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
                      className="w-3.5 h-3.5 text-blue-700 dark:text-blue-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 16 12"
                    >
                      <path
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M1 5.917 5.724 10.5 15 1.5"
                      />
                    </svg>
                  </span>
                </button>
                <div
                  id="tooltip-copy-npm-install-copy-button"
                  role="tooltip"
                  className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700"
                >
                  <span
                    id="default-tooltip-message"
                    className={copied ? "hidden" : ""}
                  >
                    Copy to clipboard
                  </span>
                  <span
                    id="success-tooltip-message"
                    className={copied ? "" : "hidden"}
                  >
                    Copied!
                  </span>
                  <div className="tooltip-arrow" data-popper-arrow></div>
                </div>
              </div>

              <button className="flex col-span-2 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                <span id="default-message">Copy</span>
                <span className="hidden inline-flex items-center">
                  <svg
                    className="w-3 h-3 text-white me-1.5"
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
                  Copied!
                </span>
              </button>
            </div>
          </div> */}
        </div>
      </form>
    </main>
  );
}
