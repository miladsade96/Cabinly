import styled from "styled-components";
import {HiXMark} from "react-icons/hi2";
import {createPortal} from "react-dom";
import {cloneElement, createContext, useContext, useState, useCallback, useEffect} from "react";
import {useOutsideClick} from "../hooks/useOutsideClick.js";

const StyledModal = styled.div`
	position: fixed;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	background-color: var(--color-grey-0);
	border-radius: var(--border-radius-lg);
	box-shadow: var(--shadow-lg);
	padding: 3.2rem 4rem;
 width:min(90vw,84rem);max-height:calc(100dvh - 32px);overflow:auto;
 @media(max-width:600px){padding:3.2rem 1.6rem;}
	transition: all 0.5s;
`;

const Overlay = styled.div`
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100vh;
	background-color: var(--backdrop-color);
	backdrop-filter: blur(4px);
	z-index: 1000;
	transition: all 0.5s;
`;

const Button = styled.button`
	background: none;
	border: none;
	padding: 0.4rem;
	border-radius: var(--border-radius-sm);
	transform: translateX(0.8rem);
	transition: all 0.2s;
	position: absolute;
	top: 1.2rem;
	right: 1.9rem;

	&:hover {
		background-color: var(--color-grey-100);
	}

	& svg {
		width: 2.4rem;
		height: 2.4rem;
		/* Sometimes we need both */
		/* fill: var(--color-grey-500);
    stroke: var(--color-grey-500); */
		color: var(--color-grey-500);
	}
`;

// 1. Create the context:
const ModalContext = createContext();

// 2. Create the parent component
export default function Modal({children}) {
	const [openName, setOpenName] = useState("");

	const close = useCallback(() => setOpenName(""), []);
	const open = setOpenName;
	return <ModalContext.Provider value={{openName, close, open}}>{children}</ModalContext.Provider>;
}

function Open({children, opens: opensWindowName}) {
	const {open} = useContext(ModalContext);
	return cloneElement(children, {onClick: () => open(opensWindowName)});
}

function Window({children, name}) {
	const {openName, close} = useContext(ModalContext);

	const ref = useOutsideClick(close);
 const isOpen = name === openName;
 useEffect(() => {
  if (!isOpen) return;
  const previous = document.activeElement;
  const overflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  const focusable = () => [...(ref.current?.querySelectorAll('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]') || [])];
  const timer = setTimeout(() => focusable()[0]?.focus(), 0);
  const key = (event) => {
   if (event.key === "Escape") { event.preventDefault(); close(); }
   if (event.key === "Tab") {
    const items = focusable(); const first = items[0], last = items.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
   }
  };
  document.addEventListener("keydown", key);
  return () => { clearTimeout(timer); document.body.style.overflow = overflow; document.removeEventListener("keydown", key); previous?.focus(); };
 }, [isOpen, close, ref]);

	if (name !== openName) return null;

	return createPortal(
		<Overlay>
			<StyledModal ref={ref} role="dialog" aria-modal="true" aria-label={name.toLowerCase().includes("delete") ? "Confirm deletion" : "Cabin details"}>
				<Button type="button" aria-label="Close dialog" onClick={close} data-test-id="modal-x-close">
					<HiXMark />
				</Button>
				<div>{cloneElement(children, {onCloseModal: close})}</div>
			</StyledModal>
		</Overlay>,
		document.body,
	);
}

Modal.Open = Open;
Modal.Window = Window;
