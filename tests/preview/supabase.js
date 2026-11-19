export const supabaseUrl = "https://offline.example.test";
export const isSupabaseConfigured = true;
export default { auth: { onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }) } };
