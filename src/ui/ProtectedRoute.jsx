import { Navigate } from "react-router-dom";
import { useUser } from "../features/authentication/useUser.js";
import { useLogout } from "../features/authentication/useLogout.js";
import Spinner from "./Spinner.jsx";
import RequestError from "./RequestError.jsx";
import Button from "./Button.jsx";
export default function ProtectedRoute({ children }) {
 const { isAuthenticated, isStaff, isLoading, error, refetch } = useUser();
 const { logout, isLoading: signingOut } = useLogout();
 if (isLoading) return <Spinner />;
 if (error) return <RequestError message="Your session could not be verified." onRetry={refetch} />;
 if (!isAuthenticated) return <Navigate to="/login" replace />;
 if (!isStaff) return <main style={{ padding: "4rem", maxWidth: "65rem", margin: "auto" }}><h1>Staff access is required</h1><p>Please contact an administrator to enable access for your account.</p><Button type="button" disabled={signingOut} onClick={() => logout()}>Sign out</Button></main>;
 return children;
}
