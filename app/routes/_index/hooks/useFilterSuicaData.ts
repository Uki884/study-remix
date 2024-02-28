import { useActionData } from "@remix-run/react";
import { action } from "../route";
import { useAtomValue } from "jotai";
import { endStationAtom, startStationAtom } from "../components/FilterForm";

export const useFilterSuicaData = () => {
  const data = useActionData<typeof action>();
  const startStation = useAtomValue(startStationAtom)
  const endStation = useAtomValue(endStationAtom)

  const filteredSuicaData = data?.data.filter((item) => {
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
  }) ?? [];

  return {
    filteredSuicaData,
  }
};