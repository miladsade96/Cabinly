import { useForm } from "react-hook-form";
import { useSignup } from "./useSignup.js";
import Button from "../../ui/Button.jsx";
import Input from "../../ui/Input.jsx";
import Form from "../../ui/Form.jsx";
import FormRow from "../../ui/FormRow.jsx";
export default function SignupForm() {
 const { signup, isLoading } = useSignup();
 const { register, handleSubmit, reset, formState: { errors } } = useForm();
 return <Form onSubmit={handleSubmit((values) => signup(values, { onSuccess: () => reset() }))}>
 <FormRow label="Full name" error={errors.fullName?.message}><Input id="fullName" disabled={isLoading} {...register("fullName", { required: "Enter the staff member’s name." })} /></FormRow>
 <FormRow label="Email address" error={errors.email?.message}><Input id="email" type="email" disabled={isLoading} {...register("email", { required: "Enter an email address.", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email address." } })} /></FormRow>
 <p>The staff member receives an invitation to choose their own password.</p>
 <FormRow><Button type="reset" variation="secondary" disabled={isLoading}>Cancel</Button><Button disabled={isLoading}>Send staff invitation</Button></FormRow>
 </Form>;
}
