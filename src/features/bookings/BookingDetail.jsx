import styled from "styled-components";

import BookingDataBox from "./BookingDataBox";
import Row from "../../ui/Row";
import Heading from "../../ui/Heading";
import Tag from "../../ui/Tag";
import ButtonGroup from "../../ui/ButtonGroup";
import Button from "../../ui/Button";
import ButtonText from "../../ui/ButtonText";

import {useMoveBack} from "../../hooks/useMoveBack";
import {useBooking} from "./useBooking.js";
import Spinner from "../../ui/Spinner.jsx";
import {useNavigate} from "react-router-dom";
import {useCheckout} from "../check-in-out/useCheckout.js";
import Modal from "../../ui/Modal.jsx";
import ConfirmDelete from "../../ui/ConfirmDelete.jsx";
import {useDeleteBooking} from "./useDeleteBooking.js";
import Empty from "../../ui/Empty.jsx";

const HeadingGroup = styled.div`
	display: flex;
	gap: 2.4rem;
 flex-wrap:wrap;
	align-items: center;
`;

function BookingDetail() {
	const {booking, isLoading} = useBooking();
	const moveBack = useMoveBack();
	const navigate = useNavigate();
	const {checkout, isCheckingOut} = useCheckout();
	const {deleteBooking, isDeleting} = useDeleteBooking();

	if (isLoading) return <Spinner />;
	if (!booking) return <Empty resourceName="booking" />;

	const statusToTagName = {
		unconfirmed: "blue",
		"checked-in": "green",
		"checked-out": "silver",
	};

	return (
		<>
			<Row type="horizontal">
				<HeadingGroup>
					<Heading as="h1">Booking #{booking.id}</Heading>
					<Tag type={statusToTagName[booking.status]}>{booking.status.replace("-", " ")}</Tag>
				</HeadingGroup>
				<ButtonText onClick={moveBack}>&larr; Back</ButtonText>
			</Row>

			<BookingDataBox booking={booking} />

			<ButtonGroup>
				{booking.status === "unconfirmed" && (
					<Button onClick={() => navigate(`/checkin/${booking.id}`)}>Check in</Button>
				)}
				{booking.status === "checked-in" && (
					<Button
						disabled={isCheckingOut}
						onClick={() => {
							checkout(booking.id);
						}}>
						Check out
					</Button>
				)}
				<Modal>
					<Modal.Open opens="delete">
						<Button variation="danger">Delete</Button>
					</Modal.Open>
					<Modal.Window name="delete">
						<ConfirmDelete
							disabled={isDeleting}
							resourceName="booking"
							onConfirm={() => {
								deleteBooking(booking.id, {
									onSuccess: () => {
										navigate(-1);
									},
								});
							}}></ConfirmDelete>
					</Modal.Window>
				</Modal>
				<Button variation="secondary" onClick={moveBack}>
					Back
				</Button>
			</ButtonGroup>
		</>
	);
}

export default BookingDetail;
