import { useEffect } from "react";
import { bookingPage } from "../../services/validation.js";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {getBookings} from "../../services/apiBookings.js";
import {useSearchParams} from "react-router-dom";
import {PAGE_SIZE} from "../../utils/constants.js";

export function useBookings() {
	const queryClient = useQueryClient();
	const [searchParams] = useSearchParams();
	// Filter:
	const filterValue = searchParams.get("status");
	const filter =
		!["unconfirmed", "checked-in", "checked-out"].includes(filterValue) ? null : {field: "status", value: filterValue};
	// Sort:
	const raw = searchParams.get("sortBy");
 const sortByRaw = ["startDate-desc", "startDate-asc", "totalPrice-desc", "totalPrice-asc"].includes(raw) ? raw : "startDate-desc";
	const [field, direction] = sortByRaw.split("-");
	const sortBy = {field, direction};
	const page = bookingPage(searchParams.get("page"));
	// Query:
	const {
		isLoading,
		data: {data: bookings, count} = {},
		error,
        refetch,
	} = useQuery({
		queryKey: ["bookings", filter, sortBy, page],
		queryFn: () => getBookings({filter, sortBy, page}),
	});
 useEffect(() => {
  const filter = !["unconfirmed", "checked-in", "checked-out"].includes(filterValue) ? null : { field: "status", value: filterValue };
  const [field, direction] = sortByRaw.split("-");
  const sortBy = { field, direction };
  const pageCount = Math.ceil((count || 0) / PAGE_SIZE);
  if (page < pageCount) void queryClient.prefetchQuery({ queryKey: ["bookings", filter, sortBy, page + 1], queryFn: () => getBookings({ filter, sortBy, page: page + 1 }) });
 }, [count, page, filterValue, sortByRaw, queryClient]);
	return {isLoading, bookings: bookings || [], error, count: count || 0, refetch};
}
