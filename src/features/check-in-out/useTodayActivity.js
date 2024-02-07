import {useQuery} from "@tanstack/react-query";
import {getStaysTodayActivity} from "../../services/apiBookings.js";

export function useTodayActivity() {
	const {data: todayActivities, isLoading} = useQuery({
		queryFn: getStaysTodayActivity,
		queryKey: ["today-activity"],
	});
	return {todayActivities, isLoading};
}
