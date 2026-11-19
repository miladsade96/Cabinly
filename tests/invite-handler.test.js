// @vitest-environment node
import { beforeEach, expect, it, vi } from "vitest";
import { createInviteHandler } from "../supabase/functions/invite-staff/handler.js";
let getUser, invite, update, createClient, env;
beforeEach(() => {
 getUser = vi.fn().mockResolvedValue({ data: { user: { app_metadata: { app_role: "admin" } } }, error: null });
 invite = vi.fn().mockResolvedValue({ data: { user: { id: "invited" } }, error: null });
 update = vi.fn().mockResolvedValue({ error: null });
 createClient = vi.fn((_url, key) => key === "server-only-test-key" ? { auth: { admin: { inviteUserByEmail: invite, updateUserById: update } } } : { auth: { getUser } });
 const values = { SUPABASE_URL: "https://sample.supabase.co", SUPABASE_ANON_KEY: "public-test-key", SUPABASE_SERVICE_ROLE_KEY: "server-only-test-key", STAFF_SITE_URL: "https://staff.example.test" };
 env = (name) => values[name];
});
function request({ auth = true, origin = "https://staff.example.test", body = { fullName: "Sample Staff", email: "sample@example.test" } } = {}) {
 return new Request("https://sample.supabase.co/functions/v1/invite-staff", { method: "POST", headers: { ...(auth ? { Authorization: "Bearer test-token" } : {}), Origin: origin, "Content-Type": "application/json" }, body: JSON.stringify(body) });
}
it("rejects unauthenticated requests before inviting anyone", async () => {
 expect((await createInviteHandler({ createClient, env })(request({ auth: false }))).status).toBe(401);
 expect(invite).not.toHaveBeenCalled();
});
it("does not grant admin rights from editable user metadata", async () => {
 getUser.mockResolvedValueOnce({ data: { user: { app_metadata: {}, user_metadata: { app_role: "admin" } } }, error: null });
 expect((await createInviteHandler({ createClient, env })(request())).status).toBe(403);
 expect(invite).not.toHaveBeenCalled();
});
it("validates the bearer token with the identity service", async () => {
 getUser.mockResolvedValueOnce({ data: { user: null }, error: new Error("Invalid") });
 expect((await createInviteHandler({ createClient, env })(request())).status).toBe(401);
 expect(getUser).toHaveBeenCalledWith("test-token"); expect(invite).not.toHaveBeenCalled();
});
it("rejects an unrelated website origin", async () => {
 expect((await createInviteHandler({ createClient, env })(request({ origin: "https://evil.test" }))).status).toBe(403);
 expect(invite).not.toHaveBeenCalled();
});
it.each([{ fullName: "", email: "valid@example.test" }, { fullName: "Test", email: "invalid" }])("validates staff details %j", async (body) => {
 expect((await createInviteHandler({ createClient, env })(request({ body }))).status).toBe(400);
 expect(invite).not.toHaveBeenCalled();
});
it("assigns the invited account a staff role using only server credentials", async () => {
 const result = await createInviteHandler({ createClient, env })(request());
 expect(result.status).toBe(200); expect(await result.json()).toEqual({ invited: true });
 expect(update).toHaveBeenCalledWith("invited", { app_metadata: { app_role: "staff" } });
 expect(invite).toHaveBeenCalledWith("sample@example.test", { data: { fullName: "Sample Staff" }, redirectTo: "https://staff.example.test/account" });
});
it("reports incomplete staff setup instead of a successful invitation", async () => {
 update.mockResolvedValueOnce({ error: new Error("Offline") });
 const result = await createInviteHandler({ createClient, env })(request());
 expect(result.status).toBe(500); expect(await result.text()).not.toContain("server-only-test-key");
});
it("reports missing configuration without calling external services", async () => {
 expect((await createInviteHandler({ createClient, env: () => undefined })(request())).status).toBe(503);
 expect(createClient).not.toHaveBeenCalled();
});
