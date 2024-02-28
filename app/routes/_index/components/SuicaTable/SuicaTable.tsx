import { Table } from "@mantine/core";
import { useActionData } from "@remix-run/react";
import { action } from "../../route";
import { useAtomValue } from 'jotai'
import { endStationAtom, startStationAtom } from "../FilterForm";

export const SuicaTable = () => {
  const data = useActionData<typeof action>();
  const startStation = useAtomValue(startStationAtom)
  const endStation = useAtomValue(endStationAtom)

  if (!data) {
    return null;
  }

  const filteredData = data?.data.filter((item) => {
    if (startStation === '' && endStation === '') return true

    // 乗車駅と降車駅が一致する場合
    if (item?.startStation === startStation && item?.endStation === endStation) return true
    // 乗車駅と降車駅が逆の場合
    if (item?.startStation === endStation && item?.endStation === startStation) return true

    if (item?.startStation === endStation) return true
  
    return false;
  });

  const totalPrice = filteredData?.reduce((acc, cur) => {
    return acc + Number(cur?.fare.replace('-', '').replace(/,/g, ""));
  }, 0);

  const rows = filteredData?.map((element, index) => {
    return (
      <Table.Tr key={index}>
        <Table.Td>{index + 1}</Table.Td>
        <Table.Td>{element?.date}</Table.Td>
        <Table.Td>{element?.startStation}({ element?.startType})</Table.Td>
        <Table.Td>{element?.endStation}({ element?.endType})</Table.Td>
        <Table.Td>{element?.fare.replace('-', '')} 円</Table.Td>
      </Table.Tr>
    )});

  if (!filteredData) {
    return null;
  }

  return (
    <Table mt='lg'>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>No.</Table.Th>
          <Table.Th>日付</Table.Th>
          <Table.Th>乗車駅</Table.Th>
          <Table.Th>降車駅</Table.Th>
          <Table.Th>金額</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {rows}
        { totalPrice && totalPrice > 0 && <Table.Tr>
          <Table.Td colSpan={4}>合計金額</Table.Td>
          <Table.Td>{totalPrice?.toLocaleString()} 円</Table.Td>
        </Table.Tr> }
      </Table.Tbody>
    </Table>
  );
};