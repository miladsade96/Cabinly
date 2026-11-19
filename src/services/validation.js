export function positiveId(value) {
 const id = Number(value);
 if (!Number.isSafeInteger(id) || id < 1) throw new Error("Choose a valid record.");
 return id;
}
export function finiteNumber(value, label, min = 0, integer = false) {
 if (value === "" || value === null || value === undefined || !Number.isFinite(Number(value)) || Number(value) < min || (integer && !Number.isInteger(Number(value)))) throw new Error(`${label} must be ${integer ? "a whole number" : "a number"} of at least ${min}.`);
 return Number(value);
}
export function cabinValues(value) {
 const name = typeof value.name === "string" ? value.name.trim() : "";
 const description = typeof value.description === "string" ? value.description.trim() : "";
 if (!name || name.length > 100 || !description || description.length > 10000) throw new Error("Enter a cabin name and description.");
 const maxCapacity = finiteNumber(value.maxCapacity, "Capacity", 1, true);
 const regularPrice = finiteNumber(value.regularPrice, "Price");
 const discount = finiteNumber(value.discount, "Discount");
 if (discount > regularPrice) throw new Error("Discount cannot exceed the regular price.");
 return { name, description, maxCapacity, regularPrice, discount };
}
export function imageFile(value) {
 if (!(value instanceof File) || !["image/jpeg","image/png","image/webp"].includes(value.type) || value.size > 5 * 1024 * 1024 || value.size === 0) throw new Error("Choose a JPG, PNG or WebP image under 5 MB.");
 return value;
}
export function isStaff(user) { return ["staff", "admin"].includes(user?.app_metadata?.app_role); }
export function isAdmin(user) { return user?.app_metadata?.app_role === "admin"; }
export function bookingPage(value) { const page = Number(value); return Number.isSafeInteger(page) && page > 0 && page <= 10000 ? page : 1; }
