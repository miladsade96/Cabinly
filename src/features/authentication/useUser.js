import { isStaff, isAdmin } from "../../services/validation.js";
import {useQuery} from "@tanstack/react-query";
import {getCurrentUser} from "../../services/apiAuth";

export function useUser() {
	const {isLoading, data: user, error, refetch} = useQuery({
		queryKey: ["user"],
		queryFn: getCurrentUser,
	});

	return {isLoading, user, error, refetch, isAuthenticated: user?.role === "authenticated", isStaff: isStaff(user), isAdmin: isAdmin(user)};
}
