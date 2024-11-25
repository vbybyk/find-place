"use client";
import Select from "../common/select";
import { useRouter, useSearchParams } from "next/navigation";
import { formUrlQuery, removeKeysFromQuery } from "../../utils";

interface IProps {
  options: any[];
  queryKey: string;
  placeholder?: string;
}

const FilterSelect = (props: IProps) => {
  const { options, queryKey, placeholder } = props;
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedValue = Number(searchParams.get(queryKey)) || 0;

  const onChange = (value: number) => {
    let newUrl = "";

    if (value) {
      newUrl = formUrlQuery({
        params: searchParams.toString(),
        key: queryKey,
        value: value.toString(),
      });
    } else {
      newUrl = removeKeysFromQuery({
        params: searchParams.toString(),
        keysToRemove: [queryKey],
      });
    }
    router.push(newUrl, { scroll: false });
  };

  return (
    <Select options={options} keyValue={"id"} value={selectedValue} onChange={onChange} placeholder={placeholder} />
  );
};

export default FilterSelect;
