import "bootstrap-icons/font/bootstrap-icons.css";

import {Locale, TempUnit} from "@/libs/wmo/enums";
import * as wmo from "@/libs/wmo/wmo";
import {Metadata} from "next";
import {default as HForecasts} from "./components/horizontal/forecasts";
import {default as HPresent} from "./components/horizontal/present";
import {default as VForecasts} from "./components/vertical/forecasts";
import {default as VPresent} from "./components/vertical/present";

export async function generateMetadata({
  params,
}: {
  params: {id: number};
}): Promise<Metadata> {
  return {
    title: (await wmo.city(params.id, Locale["En"]))?.name,
  };
}

export default async function Page({
  params,
  searchParams,
}: {
  params: {id: number};
  searchParams?: {[key: string]: any};
}) {
  const locale =
    Locale[
      (searchParams?.locale &&
        searchParams.locale[0].toUpperCase() +
          searchParams.locale.slice(1).toLowerCase()) as keyof typeof Locale
    ] || Locale["En"];

  const unit =
    TempUnit[searchParams?.unit?.toUpperCase() as keyof typeof TempUnit] ||
    TempUnit["C"];

  const visPresent = (searchParams?.present || "y").toLowerCase() == "y";

  const visFuture = (searchParams?.future || "y").toLowerCase() == "y";

  const [pwx, wx] = await Promise.all([
    wmo.present(params.id, locale, unit),
    wmo.forecasts(
      params.id,
      locale,
      unit,
      isNaN(parseInt(searchParams?.days)) ? 5 : parseInt(searchParams!.days),
    ),
  ]);

  return (
    <div
      className={`flex items-${searchParams?.align || "start"} min-h-screen`}
    >
      <div className="hidden md:block w-full">
        <div
          className="flex flex-row justify-around items-center m-1 p-2"
          style={{border: "1px lightgray solid", borderRadius: "5px"}}
        >
          {visPresent ? (
            <div className={`mx-1 lg:mx-0 w-60 ${visFuture ? "border-r" : ""}`}>
              <HPresent weather={pwx}></HPresent>
            </div>
          ) : null}

          {visFuture ? (
            <div className="flex flex-1 justify-center">
              <HForecasts locale={locale} forecast={wx}></HForecasts>
            </div>
          ) : null}
        </div>
      </div>

      <div className="block md:hidden w-full">
        <div className="flex flex-col flex-nowrap">
          {visPresent ? <VPresent weather={pwx}></VPresent> : null}
          {visFuture ? (
            <VForecasts locale={locale} forecast={wx}></VForecasts>
          ) : null}
        </div>
      </div>
    </div>
  );
}
