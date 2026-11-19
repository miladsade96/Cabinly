import styled from "styled-components";
import Tag from "../../ui/Tag.jsx";
import {Flag} from "../../ui/Flag.jsx";
import Button from "../../ui/Button.jsx";
import {useNavigate} from "react-router-dom";
import CheckoutButton from "./CheckoutButton.jsx";

const StyledTodayItem = styled.li`
	display: grid;
	grid-template-columns: 9rem 2rem 1fr 7rem 9rem;
	gap: 1.2rem;
	align-items: center;

	@media(max-width:600px){grid-template-columns:auto 2rem minmax(0,1fr); & > :nth-child(4){grid-column:1 / 3;} & > button{justify-self:start;}}
	font-size: 1.4rem;
	padding: 0.8rem 0;
	border-bottom: 1px solid var(--color-grey-100);

	&:first-child {
		border-top: 1px solid var(--color-grey-100);
	}
`;

const Guest = styled.div`
	font-weight: 500;
`;

export default function TodayItem({activity}) {
	const {id, numNights, status, guests} = activity;
	const navigate = useNavigate();
	return (
		<StyledTodayItem>
			{status === "unconfirmed" && <Tag type="green">Arriving</Tag>}
			{status === "checked-in" && <Tag type="blue">Departing</Tag>}
			<Flag src={guests.countryFlag} alt={guests.nationality ? `Flag of ${guests.nationality}` : "Guest country flag"} />
			<Guest>{guests.fullName}</Guest>
			<div>{numNights} nights</div>
			{status === "unconfirmed" && (
				<Button size="small" variation="primary" onClick={() => navigate(`/checkin/${id}`)}>
					Check in
				</Button>
			)}
			{status === "checked-in" && <CheckoutButton bookingId={id} />}
		</StyledTodayItem>
	);
}
