import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => {
 const query = { select: vi.fn(), insert: vi.fn(), update: vi.fn(), delete: vi.fn(), eq: vi.fn(), order: vi.fn(), range: vi.fn(), single: vi.fn() };
 return { query, responses: [], from: vi.fn(), upload: vi.fn(), remove: vi.fn(), getPublicUrl: vi.fn(), getSession: vi.fn(), getUser: vi.fn(), updateUser: vi.fn(), invoke: vi.fn(), signUp: vi.fn() };
});
vi.mock("../src/services/supabase.js", () => ({ supabaseUrl: "https://sample.supabase.co", default: { from: mocks.from, storage: { from: () => ({ upload: mocks.upload, remove: mocks.remove, getPublicUrl: mocks.getPublicUrl }) }, auth: { getSession: mocks.getSession, getUser: mocks.getUser, updateUser: mocks.updateUser, signUp: mocks.signUp }, functions: { invoke: mocks.invoke } } }));
import { createEditCabin } from "../src/services/apiCabins";
import { getBookings, updateBooking } from "../src/services/apiBookings";
import { updateSetting } from "../src/services/apiSettings";
import { signup, updateCurrentUser } from "../src/services/apiAuth";
import { bookingPage, cabinValues, isStaff, isAdmin } from "../src/services/validation";
const cabin = { name: "001", description: "A sample cabin", maxCapacity: 2, regularPrice: 200, discount: 0, image: "https://sample.supabase.co/storage/v1/object/public/cabin-images/one.jpg" };
beforeEach(() => {
 vi.resetAllMocks(); mocks.responses.length = 0;
 for (const fn of Object.values(mocks.query)) if (vi.isMockFunction(fn)) fn.mockReturnValue(mocks.query);
 mocks.query.then = (resolve) => resolve(mocks.responses.shift() || { data: { id: 1 }, error: null });
 mocks.from.mockReturnValue(mocks.query);
 mocks.upload.mockResolvedValue({ error: null }); mocks.remove.mockResolvedValue({ error: null });
 mocks.getPublicUrl.mockReturnValue({ data: { publicUrl: "https://sample.supabase.co/storage/v1/object/public/cabin-images/new.jpg" } });
 mocks.getSession.mockResolvedValue({ data: { session: { user: { id: "staff" } } } });
 mocks.getUser.mockResolvedValue({ data: { user: { id: "staff", app_metadata: { app_role: "admin" }, user_metadata: { fullName: "Sample" } } } });
 mocks.invoke.mockResolvedValue({ data: { invited: true }, error: null });
});
describe("cabin image safety", () => {
 it("preserves an existing cabin when an edited photo fails to upload", async () => {
  mocks.upload.mockResolvedValueOnce({ error: new Error("Offline") });
  await expect(createEditCabin({ ...cabin, image: new File(["sample"], "image.png", { type: "image/png" }) }, 7)).rejects.toThrow("has not been changed");
  expect(mocks.query.update).not.toHaveBeenCalled(); expect(mocks.query.delete).not.toHaveBeenCalled();
 });
 it("removes only the newly uploaded photo if saving the record fails", async () => {
  mocks.responses.push({ data: null, error: new Error("Offline") });
  await expect(createEditCabin({ ...cabin, image: new File(["sample"], "image.png", { type: "image/png" }) }, 7)).rejects.toThrow("could not be saved");
  expect(mocks.remove).toHaveBeenCalledTimes(1); expect(mocks.query.delete).not.toHaveBeenCalled();
  expect(mocks.remove.mock.calls[0][0][0]).not.toBe("one.jpg");
 });
 it("edits or duplicates a cabin with an existing image without a file upload", async () => {
  await createEditCabin(cabin, 3);
  expect(mocks.upload).not.toHaveBeenCalled(); expect(mocks.query.update).toHaveBeenCalledWith(cabin);
 });
 it.each([new File(["svg"], "a.svg", { type: "image/svg+xml" }), undefined, "https://evil.test/photo.png"])("rejects unsupported photo input before modifying records", async (image) => {
  await expect(createEditCabin({ ...cabin, image }, 1)).rejects.toThrow();
  expect(mocks.query.update).not.toHaveBeenCalled();
 });
 it.each([{ discount: -1 }, { regularPrice: -3 }, { discount: 201 }, { maxCapacity: 1.5 }, { maxCapacity: 0 }])("rejects invalid cabin values %j", (patch) => expect(() => cabinValues({ ...cabin, ...patch })).toThrow());
});
describe("bookings and settings", () => {
 it("fetches non-overlapping page ranges", async () => {
  await getBookings({ page: 1 }); await getBookings({ page: 2 });
  const first = mocks.query.range.mock.calls[0], second = mocks.query.range.mock.calls[1];
  expect(second[0]).toBe(first[1] + 1); expect(second[1] - second[0]).toBe(first[1] - first[0]);
 });
 it.each(["bad", -1, Infinity, 0])( "normalizes bad page %s", (value) => expect(bookingPage(value)).toBe(1));
 it("validates filter and sort inputs", async () => {
  await expect(getBookings({ filter: { field: "email", value: "x" } })).rejects.toThrow("status");
  await expect(getBookings({ sortBy: { field: "password", direction: "asc" } })).rejects.toThrow("sort");
 });
 it("saves numeric zero for breakfast and requests the updated settings row", async () => {
  mocks.responses.push({ data: { minBookingLength: 1, maxBookingLength: 10 }, error: null }, { data: { breakfastPrice: 0 }, error: null });
  expect(await updateSetting({ breakfastPrice: "0" })).toEqual({ breakfastPrice: 0 });
  expect(mocks.query.update).toHaveBeenCalledWith({ breakfastPrice: 0 });
  expect(mocks.query.select).toHaveBeenCalledTimes(2);
 });
 it("rejects inconsistent minimum/maximum nights", async () => {
  mocks.responses.push({ data: { minBookingLength: 1, maxBookingLength: 10 }, error: null });
  await expect(updateSetting({ minBookingLength: 20 })).rejects.toThrow("cannot exceed");
  expect(mocks.query.update).not.toHaveBeenCalled();
 });
 it("rejects a checkout from an unconfirmed booking", async () => {
  mocks.responses.push({ data: { status: "unconfirmed" }, error: null });
  await expect(updateBooking(1, { status: "checked-out" })).rejects.toThrow("checked-in");
  expect(mocks.query.update).not.toHaveBeenCalled();
 });
 it("rejects arbitrary booking fields and negative prices", async () => {
  await expect(updateBooking(1, { guestId: 7 })).rejects.toThrow("valid booking");
  await expect(updateBooking(1, { totalPrice: -1 })).rejects.toThrow("negative");
 });
});
describe("staff identity", () => {
 it("does not grant access from editable user metadata", () => {
  const user = { role: "authenticated", user_metadata: { app_role: "admin" } };
  expect(isStaff(user)).toBe(false); expect(isAdmin(user)).toBe(false);
 });
 it("invites staff through the server without signing in as the new user", async () => {
  await signup({ fullName: "New Staff", email: "staff@example.test" });
  expect(mocks.invoke).toHaveBeenCalledWith("invite-staff", { body: { fullName: "New Staff", email: "staff@example.test" } });
  expect(mocks.signUp).not.toHaveBeenCalled();
 });
 it("blocks non-admin staff invitations", async () => {
  mocks.getUser.mockResolvedValueOnce({ data: { user: { app_metadata: { app_role: "staff" } } } });
  await expect(signup({ fullName: "Other", email: "staff@example.test" })).rejects.toThrow("administrators");
  expect(mocks.invoke).not.toHaveBeenCalled();
 });
 it("can update a name and password together while preserving metadata", async () => {
  mocks.updateUser.mockResolvedValueOnce({ data: { user: { id: "staff" } }, error: null });
  await updateCurrentUser({ fullName: "Updated Name", password: "new-test-password" });
  expect(mocks.updateUser).toHaveBeenCalledWith({ password: "new-test-password", data: { fullName: "Updated Name" } });
 });
});
