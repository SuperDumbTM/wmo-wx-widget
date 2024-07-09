import "bootstrap-icons/font/bootstrap-icons.css";

import * as wmo from "@/libs/wmo/wmo";
import {Locale, TempUnit} from "@/libs/wmo/enums";
import HorizontalLayout from "./components/horizontal_layout";
import VerticalLayout from "./components/vertical_layout";

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
    TempUnit[(searchParams?.unit).toUpperCase() as keyof typeof TempUnit] ||
    TempUnit["C"];

  const [pwx, wx] = await Promise.all([
    wmo.present(params.id, locale, unit),
    wmo.forecasts(
      params.id,
      locale,
      unit,
      isNaN(parseInt(searchParams?.days)) ? 7 : parseInt(searchParams!.days),
    ),
  ]);

  return (
    <div
      className={`flex items-${searchParams?.align || "start"} min-h-screen`}
    >
      <div className="hidden md:block w-full">
        <HorizontalLayout locale={locale} weather={pwx} forecast={wx} />
      </div>
      <div className="block md:hidden w-full">
        <VerticalLayout locale={locale} weather={pwx} forecast={wx} />
      </div>
    </div>
  );
}
