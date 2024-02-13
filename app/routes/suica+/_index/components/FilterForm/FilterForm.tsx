import { TextInput } from "@mantine/core";
import { useAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

export const startStationAtom = atomWithStorage<string>('startStation', '');
export const endStationAtom = atomWithStorage<string>('endStation', '');

export const FilterForm = () => {
  const [startStation, setStartStation] =  useAtom(startStationAtom);
  const [endStation, setEndStation] = useAtom(endStationAtom);

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.currentTarget;
    if (name === 'startStation') {
      setStartStation(value);
    } else {
      setEndStation(value);
    }
  };

  return (
  <>
    <TextInput
      label={'乗車駅'}
      type='text'
      name='startStation'
      placeholder='乗車駅を入力してください'
      value={startStation}
      onChange={onChange}
    />
    <TextInput
      label={'降車駅'}
      type='text'
      name='endStation'
      placeholder='降車駅を入力してください'
      value={endStation}
      onChange={onChange}
    />
  </>);
};

