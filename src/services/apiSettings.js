import supabase from "./supabase.js";
import { finiteNumber } from "./validation.js";
export async function getSettings() {
 const { data, error } = await supabase.from("settings").select("*").eq("id", 1).single();
 if (error || !data) throw new Error("Settings could not be loaded. Please try again.");
 return data;
}
export async function updateSetting(newSetting = {}) {
 const keys = Object.keys(newSetting);
 const allowed = ["minBookingLength", "maxBookingLength", "maxGuestsPerBooking", "breakfastPrice"];
 if (!keys.length || keys.some((key) => !allowed.includes(key))) throw new Error("Choose a valid setting to update.");
 const values = Object.fromEntries(keys.map((key) => [key, finiteNumber(newSetting[key], key === "breakfastPrice" ? "Breakfast price" : "Setting", key === "breakfastPrice" ? 0 : 1, key !== "breakfastPrice")]));
 const current = await getSettings();
 const merged = { ...current, ...values };
 if (merged.minBookingLength > merged.maxBookingLength) throw new Error("Minimum nights cannot exceed maximum nights.");
 const { data, error } = await supabase.from("settings").update(values).eq("id", 1).select().single();
 if (error || !data) throw new Error("Settings could not be updated. Please try again.");
 return data;
}
