import {useSearchParams} from "react-router-dom";
import {subDays} from "date-fns";
import {useQuery} from "@tanstack/react-query";
import {getStaysAfterDate} from "../../services/apiBookings.js";

export function useRecentStays() {
	const [searchParams] = useSearchParams();
	const requested = Number(searchParams.get("last"));
 const numDays = [7, 30, 90].includes(requested) ? requested : 7;
	const queryDate = subDays(new Date(), numDays).toISOString();
	const {
		data: stays,
		error,
		isLoading,
	} = useQuery({
		queryFn: () => getStaysAfterDate(queryDate),
		queryKey: ["stays", `last-${numDays}`],
	});

	if (error) throw new Error(error.message);
	const confirmedStays = stays?.filter(
		stay => stay.status === "checked-in" || stay.status === "checked-out",
	);
	return {stays, confirmedStays, isLoading, numDays};
}
