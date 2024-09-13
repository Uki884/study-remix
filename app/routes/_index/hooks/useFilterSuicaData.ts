import { useAtomValue } from "jotai";
import { endStationAtom, startStationAtom } from "../components/FilterForm";
import { SuicaResponse } from "../serverActions/suica.server";

export const useFilterSuicaData = (data: SuicaResponse) => {
  const startStation = useAtomValue(startStationAtom)
  const endStation = useAtomValue(endStationAtom)

  if (!data) return { filteredSuicaData: [] }

  const filteredSuicaData = data.filter((item) => {
    if (startStation === '' && endStation === '') return true

    // 乗車駅と降車駅が一致する場合
    if (item?.startStation === startStation && item?.endStation === endStation) return true
    // 乗車駅と降車駅が逆の場合
    if (item?.startStation === endStation && item?.endStation === startStation) return true

    if (item?.startStation === endStation) return true
  
    return false;
  }).filter((data) => {
    if (data?.startStation === startStation) return true
    return false;
  }).map(data=> {
    return {
      ...data,
      fare: Number(data?.fare.replace('-', '').replace(/,/g, "")) * 2
    }
  }) ?? [];

  return {
    filteredSuicaData,
  }
};