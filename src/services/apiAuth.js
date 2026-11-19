import { isAdmin, imageFile } from "./validation.js";
import supabase from "./supabase.js";

export async function signup({ fullName, email }) {
 const user = await getCurrentUser();
 if (!isAdmin(user)) throw new Error("Only administrators can invite staff.");
 if (!fullName?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || "")) throw new Error("Enter a name and valid email address.");
 const { data, error } = await supabase.functions.invoke("invite-staff", { body: { fullName: fullName.trim(), email: email.trim() } });
 if (error || data?.error) throw new Error("The invitation could not be sent. Please try again.");
 return data;
}

export async function login({email, password}) {
	const {data, error} = await supabase.auth.signInWithPassword({
		email,
		password,
	});

	if (error) throw new Error(error.message);

	return data;
}

export async function getCurrentUser() {
	const {data: session} = await supabase.auth.getSession();
	if (!session.session) return null;

	const {data, error} = await supabase.auth.getUser();

	if (error) throw new Error(error.message);
	return data?.user;
}

export async function logout() {
	const {error} = await supabase.auth.signOut();
	if (error) throw new Error(error.message);
}

export async function updateCurrentUser({ fullName, password, avatar }) {
 const current = await getCurrentUser();
 if (!current) throw new Error("Please sign in to continue.");
 const values = {};
 if (password !== undefined) { if (password.length < 8) throw new Error("Use a password with at least 8 characters."); values.password = password; }
 if (fullName !== undefined) { if (!fullName.trim()) throw new Error("Enter your full name."); values.data = { ...current.user_metadata, fullName: fullName.trim() }; }
 let uploadedPath;
 if (avatar) {
  const file = imageFile(avatar);
  uploadedPath = `${current.id}/${crypto.randomUUID()}.${{ "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }[file.type]}`;
  const { error } = await supabase.storage.from("avatars").upload(uploadedPath, file, { upsert: false, contentType: file.type });
  if (error) throw new Error("Your avatar could not be uploaded.");
  values.data = { ...current.user_metadata, ...values.data, avatar: supabase.storage.from("avatars").getPublicUrl(uploadedPath).data.publicUrl };
 }
 if (!Object.keys(values).length) return { user: current };
 const { data, error } = await supabase.auth.updateUser(values);
 if (error) {
  if (uploadedPath) await supabase.storage.from("avatars").remove([uploadedPath]).catch(() => undefined);
  throw new Error("Your account could not be updated. Please try again.");
 }
 return data;
}
