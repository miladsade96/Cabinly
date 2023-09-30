import {useQuery, useQueryClient} from "@tanstack/react-query";
import {getBookings} from "../../services/apiBookings.js";
import {useSearchParams} from "react-router-dom";
import {PAGE_SIZE} from "../../utils/constants.js";

export function useBookings() {
	const [searchParams] = useSearchParams();
	// Filter:
	const filterValue = searchParams.get("status");
	const filter =
		!filterValue || filterValue === "all" ? null : {field: "status", value: filterValue};
	// Sort:
	const sortByRaw = searchParams.get("sortBy") || "startDate-desc";
	const [field, direction] = sortByRaw.split("-");
	const sortBy = {field, direction};
	const page = searchParams.get("page") || 1;
	const {
		isLoading,
		data: {data: bookings, count} = {},
		error,
	} = useQuery({
		queryKey: ["bookings", filter, sortBy, page],
		queryFn: () => getBookings({filter, sortBy, page}),
	});

	return {isLoading, bookings, error, count};
}
