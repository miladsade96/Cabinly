import styled from "styled-components";

const StyledLogo = styled.div`
	text-align: center;
 flex-shrink:0;
`;

const Img = styled.img`
	height: 9.6rem;
	width: auto;
`;

function Logo() {
	return (
		<StyledLogo>
			<Img src="/Cabinly.png" alt="Logo" />
		</StyledLogo>
	);
}

export default Logo;
