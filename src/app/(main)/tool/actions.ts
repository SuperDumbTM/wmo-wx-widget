"use server";

import {Locale} from "@/libs/wmo/enums";
import * as wmo from "@/libs/wmo/wmo";

export async function getCity(locale: Locale) {
  return (await wmo.cities(locale)).map((city) => {
    return {
      id: city.id,
      name: city.name,
    };
  });
}
