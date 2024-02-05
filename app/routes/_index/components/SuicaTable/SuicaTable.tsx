import { Table } from "@mantine/core";
import { useActionData } from "@remix-run/react";
import { action } from "../../route";

export const SuicaTable = () => {
  const data = useActionData<typeof action>();

  const rows = data?.data.map((element, index) => {
    return (
      <Table.Tr key={index}>
        <Table.Td>{element?.date}</Table.Td>
        <Table.Td>{element?.startStation}</Table.Td>
        <Table.Td>{element?.endStation}</Table.Td>
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
      <Table.Tbody>{rows}</Table.Tbody>
    </Table>
  );
};