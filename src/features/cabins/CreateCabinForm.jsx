import Input from "../../ui/Input";
import Form from "../../ui/Form";
import Button from "../../ui/Button";
import FileInput from "../../ui/FileInput";
import Textarea from "../../ui/Textarea";
import {useForm} from "react-hook-form";
import toast from "react-hot-toast";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {createEditCabin} from "../../services/apiCabins.js";
import FormRow from "../../ui/FormRow.jsx";

function CreateCabinForm({cabinToEdit = {}}) {
	const {id: editId, ...editValues} = cabinToEdit;
	const isEditSession = Boolean(editId);
	const {register, handleSubmit, reset, getValues, formState} = useForm({
		defaultValues: isEditSession ? editValues : {},
	});
	const {errors} = formState;
	const queryClient = useQueryClient();

	const {mutate: createCabin, isLoading: isCreating} = useMutation({
		mutationFn: createEditCabin,
		onSuccess: () => {
			toast.success("New cabin successfully created");
			queryClient.invalidateQueries({queryKey: ["cabins"]});
			reset();
		},
		onError: err => toast(err.message),
	});

	const {mutate: editCabin, isLoading: isEditing} = useMutation({
		mutationFn: ({newCabinData, id}) => createEditCabin(newCabinData, id),
		onSuccess: () => {
			toast.success("Cabin successfully edited");
			queryClient.invalidateQueries({queryKey: ["cabins"]});
			reset();
		},
		onError: err => toast(err.message),
	});

	const isWorking = isCreating || isEditing;

	function onSubmit(data) {
		mutate({...data, image: data.image[0]});
	}

	// function onError(errors) {
	// 	console.log(errors);
	// }

	return (
		<Form onSubmit={handleSubmit(onSubmit)}>
			<FormRow label="Cabin name" error={errors?.name?.message}>
				<Input
					type="text"
					id="name"
					disabled={isCreating}
					{...register("name", {required: "This field is required"})}
				/>
			</FormRow>

			<FormRow label="Max capacity" error={errors?.maxCapacity?.message}>
				<Input
					type="number"
					id="maxCapacity"
					disabled={isCreating}
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
					disabled={isCreating}
					{...register("regularPrice", {required: "This field is required"})}
				/>
			</FormRow>

			<FormRow label="Discount" error={errors?.discount?.message}>
				<Input
					type="number"
					id="discount"
					defaultValue={0}
					disabled={isCreating}
					{...register("discount", {
						required: "This field is required",
						validate: value =>
							value <= getValues().regularPrice || "Discount should be less than regular price",
					})}
				/>
			</FormRow>

			<FormRow label="Description for cabin" error={errors?.description?.message}>
				<Textarea
					type="number"
					id="description"
					defaultValue=""
					disabled={isCreating}
					{...register("description", {required: "This field is required"})}
				/>
			</FormRow>

			<FormRow label="Cabin photo">
				<FileInput
					id="image"
					disabled={isCreating}
					accept="image/*"
					{...register("image", {required: "This field is required"})}
				/>
			</FormRow>

			<FormRow>
				{/* type is an HTML attribute! */}
				<Button variation="secondary" type="reset" disabled={isCreating}>
					Cancel
				</Button>
				<Button disabled={isCreating}>Add cabin</Button>
			</FormRow>
		</Form>
	);
}

export default CreateCabinForm;
