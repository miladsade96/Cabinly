import {useMutation} from "@tanstack/react-query";
import {signup as signUpApi} from "../../services/apiAuth.js";
import toast from "react-hot-toast";

export function useSignup() {
	const {mutate: signup, isLoading} = useMutation({
		mutationFn: signUpApi,
		onError: (error) => toast.error(error.message),
        onSuccess: () => {
			toast.success("Staff invitation sent.");
		},
	});
	return {signup, isLoading};
}
