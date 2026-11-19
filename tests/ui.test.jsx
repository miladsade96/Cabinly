import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import Button from "../src/ui/Button";
import Modal from "../src/ui/Modal";
import { useLocalStorageState } from "../src/hooks/useLocalStorageState";
import { renderHook } from "@testing-library/react";

it("forwards disabled, type, and accessibility properties to the real button", () => {
 const click = vi.fn(); render(<Button disabled type="reset" aria-label="Cancel changes" onClick={click}>Cancel</Button>);
 const button = screen.getByRole("button", { name: "Cancel changes" });
 expect(button).toBeDisabled(); expect(button).toHaveAttribute("type", "reset");
 fireEvent.click(button); expect(click).not.toHaveBeenCalled();
});
it("opens and closes a labeled modal with Escape", () => {
 render(<Modal><Modal.Open opens="edit"><Button type="button">Edit cabin</Button></Modal.Open><Modal.Window name="edit"><input aria-label="Cabin name" /></Modal.Window></Modal>);
 fireEvent.click(screen.getByRole("button", { name: "Edit cabin" }));
 expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
 fireEvent.keyDown(document, { key: "Escape" });
 expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
 expect(document.body.style.overflow).not.toBe("hidden");
});
it("survives corrupt browser storage instead of crashing the app", () => {
 window.localStorage.setItem("test-state", "invalid-json");
 const { result } = renderHook(() => useLocalStorageState(false, "test-state"));
 expect(result.current[0]).toBe(false);
 window.localStorage.removeItem("test-state");
});
