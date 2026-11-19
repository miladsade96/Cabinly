import {useState} from "react";
import Button from "../../ui/Button";
import Form from "../../ui/Form";
import Input from "../../ui/Input";
import FormRowVertical from "../../ui/FormRowVertical.jsx";
import {useLogin} from "./useLogin.js";
import SpinnerMini from "../../ui/SpinnerMini.jsx";

function LoginForm() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const {login, isLoggingIn} = useLogin();

	function handleSubmit(e) {
		e.preventDefault();
		if (!email || !password) return;
		login(
			{email, password},
			{
				onSuccess: () => {
					setEmail("");
					setPassword("");
				},
			},
		);
	}

	return (
		<Form onSubmit={handleSubmit}>
			<FormRowVertical label="Email address">
				<Input
					type="email"
					id="email"
					disabled={isLoggingIn}
					// This makes this form better for password managers
					autoComplete="username"
					value={email}
					onChange={e => setEmail(e.target.value)}
					placeholder="you@example.com"
                    required
				/>
			</FormRowVertical>
			<FormRowVertical label="Password">
				<Input
					type="password"
					id="password"
					disabled={isLoggingIn}
					autoComplete="current-password"
					value={password}
					onChange={e => setPassword(e.target.value)}
					required
				/>
			</FormRowVertical>
			<FormRowVertical>
				<Button size="large" disabled={isLoggingIn}>
					{!isLoggingIn ? "Login" : <SpinnerMini />}
				</Button>
			</FormRowVertical>
		</Form>
	);
}

export default LoginForm;
