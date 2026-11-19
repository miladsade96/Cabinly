import styled from "styled-components";
import BookingDataBox from "../../features/bookings/BookingDataBox";

import Row from "../../ui/Row";
import Heading from "../../ui/Heading";
import ButtonGroup from "../../ui/ButtonGroup";
import Button from "../../ui/Button";
import ButtonText from "../../ui/ButtonText";

import {useMoveBack} from "../../hooks/useMoveBack";
import {useBooking} from "../bookings/useBooking.js";
import Spinner from "../../ui/Spinner.jsx";
import {useEffect, useState} from "react";
import Checkbox from "../../ui/Checkbox.jsx";
import {formatCurrency} from "../../utils/helpers.js";
import {useCheckin} from "./useCheckin.js";
import {useSettings} from "../settings/useSettings.js";

const Box = styled.div`
	/* Box */
	background-color: var(--color-grey-0);
	border: 1px solid var(--color-grey-100);
	border-radius: var(--border-radius-md);
	padding: 2.4rem 4rem;
 @media(max-width:600px){padding:2rem;}
`;

function CheckinBooking() {
	const [confirmPaid, setConfirmPaid] = useState(false);
	const [addBreakfast, setAddBreakfast] = useState(false);
	const moveBack = useMoveBack();
	const {booking, isLoading} = useBooking();
	const {checkin, isCheckingIn} = useCheckin();
	const {settings, isLoading: isLoadingSettings, error: settingsError, refetch: retrySettings} = useSettings();

	useEffect(() => {
        setConfirmPaid(booking?.isPaid ?? false);
        setAddBreakfast(false);
    }, [booking?.id, booking?.isPaid]);

	if (isLoading || isLoadingSettings) return <Spinner />;

	if (settingsError || !settings) return <p role="alert">Settings could not be loaded. <Button onClick={() => retrySettings()}>Retry settings</Button></p>;
	if (!booking) return <p role="alert">This booking could not be found.</p>;
 const {id: bookingId, guests, totalPrice, numGuests, hasBreakfast, numNights} = booking;
	const optionalBreakfastPrice = (settings?.breakfastPrice || 0) * numNights * numGuests;

	function handleCheckin() {
		if (!confirmPaid) return;
		if (addBreakfast) {
			checkin({
				bookingId,
				breakfast: {
					hasBreakfast: true,
					extrasPrice: optionalBreakfastPrice,
					totalPrice: totalPrice + optionalBreakfastPrice,
				},
			});
		} else {
			checkin({bookingId, breakfast: {}});
		}
	}

	return (
		<>
			<Row type="horizontal">
				<Heading as="h1">Check in booking #{bookingId}</Heading>
				<ButtonText onClick={moveBack}>&larr; Back</ButtonText>
			</Row>

			<BookingDataBox booking={booking} />

			{!hasBreakfast && (
				<Box>
					<Checkbox
						checked={addBreakfast}
						onChange={() => {
							setAddBreakfast(add => !add);
							setConfirmPaid(false);
						}}
						id="breakfast"
                        disabled={isCheckingIn}>
						Want to add breakfast for {formatCurrency(optionalBreakfastPrice)}
					</Checkbox>
				</Box>
			)}

			<Box>
				<Checkbox
					id="confirm"
					checked={confirmPaid}
					disabled={(booking.isPaid && !addBreakfast) || isCheckingIn}
					onChange={() => setConfirmPaid(confirm => !confirm)}>
					I confirm that {guests.fullName} has paid the total amount of{" "}
					{!addBreakfast
						? formatCurrency(totalPrice)
						: `${formatCurrency(totalPrice + optionalBreakfastPrice)} (${formatCurrency(
								totalPrice,
						  )} + ${formatCurrency(optionalBreakfastPrice)})`}
				</Checkbox>
			</Box>

			<ButtonGroup>
				<Button onClick={handleCheckin} disabled={!confirmPaid || isCheckingIn}>
					Check in booking #{bookingId}
				</Button>
				<Button variation="secondary" onClick={moveBack}>
					Back
				</Button>
			</ButtonGroup>
		</>
	);
}

export default CheckinBooking;
