import supabase, { supabaseUrl } from "./supabase.js";
import { cabinValues, imageFile, positiveId } from "./validation.js";
export async function getCabins() {
 const { data, error } = await supabase.from("cabins").select("*").order("name");
 if (error) throw new Error("Cabins could not be loaded. Please try again.");
 return data || [];
}
export async function createEditCabin(newCabin, id) {
 const values = cabinValues(newCabin);
 const recordId = id === undefined ? undefined : positiveId(id);
 let uploadedPath;
 let image;
 if (typeof newCabin.image === "string") {
  let url;
  try { url = new URL(newCabin.image); } catch { throw new Error("Choose a valid cabin photo."); }
  if (url.origin !== new URL(supabaseUrl).origin || !url.pathname.startsWith("/storage/v1/object/public/cabin-images/") || !url.pathname.split("/").at(-1)) throw new Error("Choose a valid cabin photo.");
  image = url.href;
 } else {
  const file = imageFile(newCabin.image);
  const extension = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }[file.type];
  uploadedPath = `${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from("cabin-images").upload(uploadedPath, file, { upsert: false, contentType: file.type });
  if (error) throw new Error("The photo could not be uploaded. Your cabin has not been changed.");
  image = supabase.storage.from("cabin-images").getPublicUrl(uploadedPath).data.publicUrl;
 }
 try {
  const query = recordId ? supabase.from("cabins").update({ ...values, image }).eq("id", recordId) : supabase.from("cabins").insert([{ ...values, image }]);
  const { data, error } = await query.select().single();
  if (error || !data) throw new Error("The cabin could not be saved. Please try again.");
  return data;
 } catch (error) {
  if (uploadedPath) await supabase.storage.from("cabin-images").remove([uploadedPath]).catch(() => undefined);
  throw error;
 }
}
export async function deleteCabin(id) {
 const { error } = await supabase.from("cabins").delete().eq("id", positiveId(id));
 if (error) throw new Error("Cabin could not be deleted. It may still have reservations.");
}
