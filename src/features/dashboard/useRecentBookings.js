import {useSearchParams} from "react-router-dom";
import {subDays} from "date-fns";
import {useQuery} from "@tanstack/react-query";
import {getBookingsAfterDate} from "../../services/apiBookings.js";

export function useRecentBookings() {
	const [searchParams] = useSearchParams();
	const requested = Number(searchParams.get("last"));
 const numDays = [7, 30, 90].includes(requested) ? requested : 7;
	const queryDate = subDays(new Date(), numDays).toISOString();
	const {
		data: bookings,
		error,
		isLoading,
	} = useQuery({
		queryFn: () => getBookingsAfterDate(queryDate),
		queryKey: ["bookings", `last-${numDays}`],
	});

	if (error) throw new Error(error.message);
	return {bookings, isLoading};
}
