export function createInviteHandler({ createClient, env }) {
 return async function handle(request) {
  const allowedOrigin = env("STAFF_SITE_URL");
  let site;
  try { site = new URL(allowedOrigin); if (!["http:", "https:"].includes(site.protocol)) site = undefined; } catch { site = undefined; }
  const origin = request.headers.get("origin");
  const headers = { "Content-Type": "application/json", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS", "Vary": "Origin" };
  if (site && origin === site.origin) headers["Access-Control-Allow-Origin"] = origin;
  const response = (body, status) => new Response(JSON.stringify(body), { status, headers });
  if (!site || !env("SUPABASE_URL") || !env("SUPABASE_ANON_KEY") || !env("SUPABASE_SERVICE_ROLE_KEY")) return response({ error: "Staff invitations are not configured." }, 503);
  if (origin && origin !== site.origin) return response({ error: "Origin is not allowed." }, 403);
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
  if (request.method !== "POST") return response({ error: "Method not allowed." }, 405);
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return response({ error: "Sign in to continue." }, 401);
  try {
   const caller = createClient(env("SUPABASE_URL"), env("SUPABASE_ANON_KEY"), { auth: { persistSession: false } });
   const { data, error } = await caller.auth.getUser(authorization.slice(7));
   if (error || !data?.user) return response({ error: "Invalid session." }, 401);
   if (data.user.app_metadata?.app_role !== "admin") return response({ error: "Only administrators can invite staff." }, 403);
   let body;
   try { body = await request.json(); } catch { return response({ error: "Enter valid invitation details." }, 400); }
   const email = typeof body.email === "string" ? body.email.trim() : "";
   const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
   if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || !fullName || fullName.length > 100) return response({ error: "Enter a name and valid email address." }, 400);
   const admin = createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), { auth: { persistSession: false } });
   const invitation = await admin.auth.admin.inviteUserByEmail(email, { data: { fullName }, redirectTo: new URL("/account", allowedOrigin).href });
   if (invitation.error || !invitation.data?.user) return response({ error: "The invitation could not be sent." }, 400);
   const role = await admin.auth.admin.updateUserById(invitation.data.user.id, { app_metadata: { ...invitation.data.user.app_metadata, app_role: "staff" } });
   if (role.error) return response({ error: "The invitation was sent, but staff access needs an administrator to finish setup." }, 500);
   return response({ invited: true }, 200);
  } catch { return response({ error: "The invitation could not be completed. Please try again." }, 500); }
 };
}
