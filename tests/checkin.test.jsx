import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, expect, it, vi } from "vitest";
import CheckinBooking from "../src/features/check-in-out/CheckinBooking";

const state = vi.hoisted(() => ({ settingsError: null, checkin: vi.fn() }));
vi.mock("../src/features/bookings/useBooking.js", () => ({ useBooking: () => ({
  booking: { id: 1, isPaid: true, hasBreakfast: false, numNights: 3, numGuests: 2,
    totalPrice: 600, guests: { fullName: "Sample Guest" } }, isLoading: false,
}) }));
vi.mock("../src/features/settings/useSettings.js", () => ({ useSettings: () => ({
  settings: { breakfastPrice: 15 }, error: state.settingsError, refetch: vi.fn(),
}) }));
vi.mock("../src/features/check-in-out/useCheckin.js", () => ({ useCheckin: () => ({ checkin: state.checkin, isCheckingIn: false }) }));
vi.mock("../src/features/bookings/BookingDataBox", () => ({ default: () => <div>Booking details</div> }));
beforeEach(() => { state.settingsError = null; state.checkin.mockClear(); });

it("requires a new payment confirmation when breakfast is added to a paid booking", () => {
  render(<MemoryRouter><CheckinBooking /></MemoryRouter>);
  const submit = screen.getByRole("button", { name: "Check in booking #1" });
  const paid = screen.getByRole("checkbox", { name: /I confirm/ });
  expect(paid).toBeChecked();
  fireEvent.click(screen.getByRole("checkbox", { name: /Want to add breakfast/ }));
  expect(paid).not.toBeChecked(); expect(paid).toBeEnabled(); expect(submit).toBeDisabled();
  fireEvent.click(paid); fireEvent.click(submit);
  expect(state.checkin).toHaveBeenCalledWith({ bookingId: 1, breakfast: { hasBreakfast: true, extrasPrice: 90, totalPrice: 690 } });
});

it("blocks check-in when breakfast settings fail to load", () => {
  state.settingsError = new Error("Unavailable");
  render(<MemoryRouter><CheckinBooking /></MemoryRouter>);
  expect(screen.getByRole("alert")).toHaveTextContent("Settings could not be loaded");
  expect(screen.queryByRole("button", { name: "Check in booking #1" })).not.toBeInTheDocument();
});
