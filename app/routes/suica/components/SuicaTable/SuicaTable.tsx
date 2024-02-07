import { Table } from "@mantine/core";
import { useActionData } from "@remix-run/react";
import { action } from "../../route";

type Props = {
  startStation: string;
  endStation: string;
}

export const SuicaTable = (props: Props) => {
  const data = useActionData<typeof action>();

  const totalPrice = data?.data.reduce((acc, cur) => {
    return acc + Number(cur?.fare.replace('-', '').replace(/,/g, ""));
  }, 0);

  const rows = data?.data.filter((item) => {
      if (props.startStation === '' && props.endStation === '') return true

      // 乗車駅と降車駅が一致する場合
      if (item?.startStation === props.startStation && item?.endStation === props.endStation) return true
      // 乗車駅と降車駅が逆の場合
      if (item?.startStation === props.endStation && item?.endStation === props.startStation) return true
    
      return false;
    }).map((element, index) => {
      return (
        <Table.Tr key={index}>
          <Table.Td>{element?.date}</Table.Td>
          <Table.Td>{element?.startStation}({ element?.startType})</Table.Td>
          <Table.Td>{element?.endStation}({ element?.endType})</Table.Td>
          <Table.Td>{element?.fare.replace('-', '')}</Table.Td>
        </Table.Tr>
      )});

  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>日付</Table.Th>
          <Table.Th>乗車駅</Table.Th>
          <Table.Th>降車駅</Table.Th>
          <Table.Th>金額</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {rows}
        {/* 合計金額 */}
        <Table.Tr>
          <Table.Td colSpan={3}>合計金額</Table.Td>
          <Table.Td>{totalPrice}</Table.Td>
        </Table.Tr>
      </Table.Tbody>
    </Table>
  );
};