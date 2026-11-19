import styled from "styled-components";
import LoginForm from "../features/authentication/LoginForm.jsx";
import Logo from "../ui/Logo.jsx";
import Heading from "../ui/Heading.jsx";

const LoginLayout = styled.main`
	min-height: 100vh;
	display: grid;
	grid-template-columns:min(48rem,100%);
 padding:2.4rem;
	align-content: center;
	justify-content: center;
	gap: 3.2rem;
	background-color: var(--color-grey-50);
`;

function Login() {
	return (
		<LoginLayout>
			<Logo />
			<Heading as="h1">Log into your account</Heading>
			<LoginForm />
		</LoginLayout>
	);
}

export default Login;
