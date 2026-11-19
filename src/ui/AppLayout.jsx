import {Outlet} from "react-router-dom";
import Header from "./Header.jsx";
import Sidebar from "./Sidebar.jsx";
import styled from "styled-components";

const StyledAppLayout = styled.div`
	display: grid;
	grid-template-columns: 26rem minmax(0, 1fr);
	grid-template-rows: auto 1fr;
	height: 100dvh;
 @media(max-width:900px){grid-template-columns:minmax(0,1fr);grid-template-rows:auto auto 1fr;height:auto;min-height:100dvh;}
`;

const Main = styled.main`
	background-color: var(--color-grey-50);
	padding: 4rem 4.8rem 6.4rem;
	overflow: auto;
 min-width:0;
 @media(max-width:900px){padding:2.4rem 1.6rem 4rem;}
`;

const Container = styled.div`
	max-width: 120rem;
	margin: 0 auto;
	display: flex;
	flex-direction: column;
	gap: 3.2rem;
`;

export default function AppLayout() {
	return (
		<StyledAppLayout>
			<Header />
			<Sidebar />
			<Main>
				<Container>
					<Outlet />
				</Container>
			</Main>
		</StyledAppLayout>
	);
}
