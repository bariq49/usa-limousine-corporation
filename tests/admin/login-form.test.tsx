import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const useAuthLogin = vi.fn();

vi.mock("@/hooks/queries/use-auth", () => ({
  useAuthLogin: () => useAuthLogin(),
}));

import { LoginForm } from "../../apps/admin/components/forms/login-form";

describe("LoginForm", () => {
  beforeEach(() => {
    useAuthLogin.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });
  });

  it("renders a connected sign-in button", () => {
    render(<LoginForm />);
    expect(screen.queryByText(/Sign-in is presentational/i)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign In" })).toBeEnabled();
  });
});
