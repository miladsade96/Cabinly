import { useUser } from "../features/authentication/useUser.js";
import RequestError from "../ui/RequestError.jsx";
import Heading from "../ui/Heading";
import SignupForm from "../features/authentication/SignupForm.jsx";

function NewUsers() {
  const { isAdmin } = useUser();
  if (!isAdmin) return <RequestError message="Only administrators can invite staff." />;
	return (
		<>
			<Heading as="h1">Invite a staff member</Heading>
			<SignupForm />
		</>
	);
}

export default NewUsers;
