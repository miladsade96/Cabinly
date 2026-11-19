import Input from "../../ui/Input";
import Form from "../../ui/Form";
import Button from "../../ui/Button";
import FileInput from "../../ui/FileInput";
import Textarea from "../../ui/Textarea";
import {useForm} from "react-hook-form";
import FormRow from "../../ui/FormRow.jsx";
import {useCreateCabin} from "./useCreateCabin.js";
import {useEditCabin} from "./useEditCabin.js";

function CreateCabinForm({cabinToEdit = {}, onCloseModal}) {
	const {isCreating, createCabin} = useCreateCabin();
	const {isEditing, editCabin} = useEditCabin();
	const isWorking = isCreating || isEditing;

	const {id: editId, ...editValues} = cabinToEdit;
	const isEditSession = Boolean(editId);
	const {register, handleSubmit, reset, getValues, formState} = useForm({
		defaultValues: isEditSession ? editValues : {},
	});
	const {errors} = formState;

	function onSubmit(data) {
		const image = typeof data.image === "string" ? data.image : data.image?.[0] || cabinToEdit.image;
		if (isEditSession) {
			editCabin(
				{newCabinData: {...data, image}, id: editId},
				{
					onSuccess: () => {
						reset();
						onCloseModal?.();
					},
				},
			);
		} else {
			createCabin(
				{...data, image: image},
				{
					onSuccess: () => {
						reset();
						onCloseModal?.();
					},
				},
			);
		}
	}

	return (
		<Form
			onSubmit={handleSubmit(onSubmit)}
			data-test-id="create-cabin-form"
			type={onCloseModal ? "modal" : "regular"}>
			<FormRow label="Cabin name" error={errors?.name?.message}>
				<Input
					type="text"
					id="name"
					disabled={isWorking}
					{...register("name", {required: "This field is required"})}
				/>
			</FormRow>

			<FormRow label="Max capacity" error={errors?.maxCapacity?.message}>
				<Input
					type="number"
					id="maxCapacity"
					disabled={isWorking}
					{...register("maxCapacity", {
						required: "This field is required",
						min: {value: 1, message: "Capacity should be at least 1"},
					})}
				/>
			</FormRow>

			<FormRow label="Regular price" error={errors?.regularPrice?.message}>
				<Input
					type="number"
					id="regularPrice"
					disabled={isWorking}
					{...register("regularPrice", {required: "This field is required", min: { value: 0, message: "Price cannot be negative." }})}
				/>
			</FormRow>

			<FormRow label="Discount" error={errors?.discount?.message}>
				<Input
					type="number"
					id="discount"
					defaultValue={0}
					disabled={isWorking}
					{...register("discount", {
						required: "This field is required",
                        min: { value: 0, message: "Discount cannot be negative." },
						validate: value =>
							+value <= getValues().regularPrice || "Discount should be less than regular price",
					})}
				/>
			</FormRow>

			<FormRow label="Description for cabin" error={errors?.description?.message}>
				<Textarea
					id="description"
					defaultValue=""
					disabled={isWorking}
					{...register("description", {required: "This field is required"})}
				/>
			</FormRow>

			<FormRow label="Cabin photo" error={errors?.image?.message}>
				<FileInput
					id="image"
					disabled={isWorking}
					accept="image/*"
					{...register("image", {required: isEditSession ? false : "This field is required"})}
				/>
			</FormRow>

			<FormRow>
				{/* type is an HTML attribute! */}
				<Button
					variation="secondary"
					type="reset"
					disabled={isWorking}
					onClick={() => onCloseModal?.()}>
					Cancel
				</Button>
				<Button disabled={isWorking}>{isEditSession ? "Edit cabin" : "Create new cabin"}</Button>
			</FormRow>
		</Form>
	);
}

export default CreateCabinForm;
