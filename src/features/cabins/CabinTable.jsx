import RequestError from "../../ui/RequestError.jsx";
import Spinner from "../../ui/Spinner.jsx";
import CabinRow from "./CabinRow.jsx";
import {useCabins} from "./useCabins.js";
import Table from "../../ui/Table.jsx";
import Menus from "../../ui/Menus.jsx";
import {useSearchParams} from "react-router-dom";
import Empty from "../../ui/Empty.jsx";

export function CabinTable() {
	const {isLoading, cabins, error, refetch} = useCabins();
	const [searchParams] = useSearchParams();
	if (isLoading) return <Spinner />;
	if (error) return <RequestError onRetry={refetch} message="Cabins could not be loaded." />;
 if (!cabins?.length) return <Empty resourceName="cabins" />;

	// Filter:
	const filterValue = searchParams.get("discount") || "all";
	let filteredCabins = cabins;
	if (filterValue === "all") filteredCabins = cabins;
	else if (filterValue === "no-discount")
		filteredCabins = cabins.filter(cabin => cabin.discount === 0);
	else if (filterValue === "with-discount")
		filteredCabins = cabins.filter(cabin => cabin.discount > 0);

	// Sort:
	const sortBy = searchParams.get("sortBy") || "name-asc";
	const [field, direction] = sortBy.split("-");
	const modifier = direction === "asc" ? 1 : -1;
	const sortField = ["name", "regularPrice", "maxCapacity"].includes(field) ? field : "name";
 const sortedCabins = [...filteredCabins].sort((a,b) => (sortField === "name" ? String(a.name).localeCompare(String(b.name), undefined, { numeric: true }) : a[sortField] - b[sortField]) * modifier);
	return (
		<Menus>
			<Table columns="0.65fr 1.5fr 2.2fr 1.2fr 1.2fr 0.2fr">
				<Table.Header>
					<div></div>
					<div>Cabin</div>
					<div>Capacity</div>
					<div>Price</div>
					<div>Discount</div>
					<div></div>
				</Table.Header>
				<Table.Body
					data={sortedCabins}
					render={cabin => <CabinRow cabin={cabin} key={cabin.id} />}
				/>
			</Table>
		</Menus>
	);
}
