import styled from "styled-components";
import Logo from "./Logo.jsx";
import MainNav from "./MainNav.jsx";

const StyledSidebar = styled.aside`
	background-color: var(--color-grey-0);
	padding: 3.2rem 2.4rem;
	border-right: 1px solid var(--color-grey-100);

	min-width:0;
	grid-row: 1 / -1;
	display: flex;
	flex-direction: column;
	gap: 3.2rem;
 @media(max-width:900px){grid-row:auto;grid-column:1;padding:1.4rem;gap:1.6rem;flex-direction:row;align-items:center;border-bottom:1px solid var(--color-grey-100); & nav { min-width:0;overflow-x:auto; } & nav ul{flex-direction:row;gap:.8rem} & a {padding:1rem;white-space:nowrap;} & img{height:5rem;} }

`;

export default function Sidebar() {
	return (
		<StyledSidebar>
			<Logo />
			<MainNav />
		</StyledSidebar>
	);
}
