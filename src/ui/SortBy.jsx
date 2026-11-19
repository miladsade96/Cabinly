import {Select} from "./Select.jsx";
import {useSearchParams} from "react-router-dom";

export default function SortBy({options}) {
	const [searchParams, setSearchParams] = useSearchParams();
	const current = searchParams.get("sortBy");
 const sortBy = options.some((option) => option.value === current) ? current : options[0].value;
	function handleChange(e) {
		const updated = new URLSearchParams(searchParams); updated.set("sortBy", e.target.value); updated.set("page", "1"); setSearchParams(updated);
	}
	return <Select aria-label="Sort results" options={options} type="white" value={sortBy} onChange={handleChange} />;
}
