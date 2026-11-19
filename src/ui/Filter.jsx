import styled, {css} from "styled-components";
import {useSearchParams} from "react-router-dom";

const StyledFilter = styled.div`
	border: 1px solid var(--color-grey-100);
	background-color: var(--color-grey-0);
	box-shadow: var(--shadow-sm);
	border-radius: var(--border-radius-sm);
	padding: 0.4rem;
	display: flex;
	flex-wrap: wrap;
	gap: 0.4rem;
`;

const FilterButton = styled.button`
	background-color: var(--color-grey-0);
	border: none;

	${props =>
		props.$active &&
		css`
			background-color: var(--color-brand-600);
			color: var(--color-brand-50);
		`}

	border-radius: var(--border-radius-sm);
	font-weight: 500;
	font-size: 1.4rem;
	/* To give the same height as select */
	padding: 0.44rem 0.8rem;
	transition: all 0.3s;

	&:hover:not(:disabled) {
		background-color: var(--color-brand-600);
		color: var(--color-brand-50);
	}
`;

export default function Filter({filterField, options}) {
	const [searchParams, setSearchParams] = useSearchParams();
	const raw = searchParams.get(filterField);
 const currentFilter = options.some((option) => option.value === raw) ? raw : options[0].value;
	function handleClick(value) {
		const updated = new URLSearchParams(searchParams);
        updated.set(filterField, value);
		if (updated.get("page")) {
			updated.set("page", 1);
		}
		setSearchParams(updated);
	}

	return (
		<StyledFilter>
			{options.map(option => (
				<FilterButton
					key={option.label}
					$active={option.value === currentFilter} aria-pressed={option.value === currentFilter}
					disabled={option.value === currentFilter}
					onClick={() => handleClick(option.value)}>
					{option.label}
				</FilterButton>
			))}
		</StyledFilter>
	);
}
