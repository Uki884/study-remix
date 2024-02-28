import { Table } from "@mantine/core";
import { useFilterSuicaData } from "../../hooks/useFilterSuicaData";

export const SuicaTable = () => {
  const { filteredSuicaData } = useFilterSuicaData();

  const totalPrice = filteredSuicaData.reduce((acc, cur) => {
    return acc + cur.fare;
  }, 0);

  const rows = filteredSuicaData.map((element, index) => {
    return (
      <Table.Tr key={index}>
        <Table.Td>{index + 1}</Table.Td>
        <Table.Td>{element?.date}</Table.Td>
        <Table.Td>{element?.startStation}({ element?.startType})</Table.Td>
        <Table.Td>{element?.endStation}({ element?.endType})</Table.Td>
        <Table.Td>{element?.fare} 円</Table.Td>
      </Table.Tr>
    )});

  return (
    <>
      <Table>
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
    </>
  );
};