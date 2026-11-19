import { useEffect } from "react";
import { useForm } from "react-hook-form";
import Form from "../../ui/Form.jsx";
import FormRow from "../../ui/FormRow.jsx";
import Input from "../../ui/Input.jsx";
import Button from "../../ui/Button.jsx";
import Spinner from "../../ui/Spinner.jsx";
import RequestError from "../../ui/RequestError.jsx";
import { useSettings } from "./useSettings.js";
import { useUpdateSetting } from "./useUpdateSetting.js";
const fields = [["minBookingLength","Minimum nights/booking",1], ["maxBookingLength","Maximum nights/booking",1], ["maxGuestsPerBooking","Maximum guests/booking",1], ["breakfastPrice","Breakfast price",0]];
export default function UpdateSettingsForm() {
 const { settings, isLoading, error, refetch } = useSettings();
 const { isUpdating, updateSetting } = useUpdateSetting();
 const { register, handleSubmit, reset, getValues, formState: { errors, isDirty } } = useForm();
 useEffect(() => { if (settings && !isDirty) reset(settings); }, [settings, reset, isDirty]);
 if (isLoading) return <Spinner />;
 if (error || !settings) return <RequestError onRetry={refetch} message="Settings could not be loaded." />;
 return <Form onSubmit={handleSubmit((values) => updateSetting(Object.fromEntries(fields.map(([key]) => [key, values[key]])), { onSuccess: (updated) => reset(updated) }))}>
 {fields.map(([name,label,min]) => <FormRow key={name} label={label} error={errors[name]?.message}><Input id={name} type="number" min={min} step={name === "breakfastPrice" ? "0.01" : "1"} disabled={isUpdating} {...register(name, { valueAsNumber: true, required: "Enter a value.", min: { value: min, message: `Use a value of at least ${min}.` }, validate: (value) => Number.isFinite(value) && (name === "breakfastPrice" || Number.isInteger(value)) && (name !== "minBookingLength" || value <= Number(getValues("maxBookingLength"))) || "Use a valid value. Minimum nights cannot exceed maximum nights." })} /></FormRow>)}
 <FormRow><Button type="submit" disabled={isUpdating || !isDirty}>{isUpdating ? "Saving…" : "Save settings"}</Button></FormRow>
 </Form>;
}
