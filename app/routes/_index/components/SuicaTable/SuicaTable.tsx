import { Table } from "@mantine/core";
import { useActionData } from "@remix-run/react";
import { action } from "../../route";

export const SuicaTable = () => {
  const data = useActionData<typeof action>();
  const rows = data?.data.map((data, index) => (
    <Table.Tr key={index}>
      <Table.Td>{data.date}</Table.Td>
      <Table.Td>{data.startStation}</Table.Td>
      <Table.Td>{data.endStation}</Table.Td>
      <Table.Td>{data.fare.replace('-', '')}</Table.Td>
    </Table.Tr>
  ));

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