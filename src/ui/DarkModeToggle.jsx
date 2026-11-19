import {HiOutlineMoon, HiOutlineSun} from "react-icons/hi2";
import ButtonIcon from "./ButtonIcon.jsx";
import {useDarkMode} from "../context/DarkModeContext.jsx";

export default function DarkModeToggle() {
	const {isDarkMode, toggleDarkMode} = useDarkMode();
	return (
		<ButtonIcon aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"} onClick={toggleDarkMode}>
			{isDarkMode ? <HiOutlineSun /> : <HiOutlineMoon />}
		</ButtonIcon>
	);
}
