import { forAppClient } from "../src/modules/auth/utils/app-cookie";

const cookie = { name: "usa_limo_refresh_token", path: "/" };
const request = (client?: string) =>
  ({ headers: client === undefined ? {} : { "x-app-client": client } }) as never;

describe("forAppClient", () => {
  it("gives the admin and customer apps their own cookie names", () => {
    expect(forAppClient(cookie, request("admin")).name).toBe("usa_limo_refresh_token_admin");
    expect(forAppClient(cookie, request("Customer")).name).toBe("usa_limo_refresh_token_customer");
  });

  it("keeps the shared name for other or missing clients", () => {
    expect(forAppClient(cookie, request()).name).toBe("usa_limo_refresh_token");
    expect(forAppClient(cookie, request("evil")).name).toBe("usa_limo_refresh_token");
  });

  it("does not change the original cookie settings", () => {
    forAppClient(cookie, request("admin"));
    expect(cookie.name).toBe("usa_limo_refresh_token");
  });
});
