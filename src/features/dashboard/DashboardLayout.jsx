import styled from "styled-components";
import {useRecentBookings} from "./useRecentBookings.js";
import Spinner from "../../ui/Spinner.jsx";
import {useRecentStays} from "./useRecentStays.js";
import Stats from "./Stats.jsx";
import {useCabins} from "../cabins/useCabins.js";
import SalesChart from "./SalesChart.jsx";
import DurationChart from "./DurationChart.jsx";
import TodayActivity from "../check-in-out/TodayActivity.jsx";

const StyledDashboardLayout = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr 1fr 1fr;
	grid-template-rows: auto 34rem auto;
	gap: 2.4rem;
 min-width:0;
 @media(max-width:1000px){grid-template-columns:repeat(2,minmax(0,1fr));grid-template-rows:auto; & > *{min-width:0;}}
 @media(max-width:600px){grid-template-columns:minmax(0,1fr); & > *{grid-column:1/-1;}}
`;

export default function DashboardLayout() {
	const {bookings, isLoading: isLoadingBookings} = useRecentBookings();
	const {confirmedStays, isLoading: isLoadingStays, numDays} = useRecentStays();
	const {cabins, isLoading: isLoadingCabins} = useCabins();
	if (isLoadingBookings || isLoadingStays || isLoadingCabins) return <Spinner />;

	return (
		<StyledDashboardLayout>
			<Stats
				bookings={bookings}
				confirmedStays={confirmedStays}
				numDays={numDays}
				cabinCount={cabins.length}
			/>
			<TodayActivity />
			<DurationChart confirmedStays={confirmedStays} />
			<SalesChart bookings={bookings} numDays={numDays} />
		</StyledDashboardLayout>
	);
}
