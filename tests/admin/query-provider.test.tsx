import { render, screen } from "@testing-library/react";
import { useQueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import {
  createQueryClient,
  QUERY_CLIENT_DEFAULTS,
  QueryProvider,
} from "../../apps/admin/providers/query-provider";

function QueryProbe() {
  const client = useQueryClient();
  return <span data-testid="query-ready">{client ? "ready" : "missing"}</span>;
}

describe("admin QueryClient foundation", () => {
  it("creates a QueryClient with conservative defaults", () => {
    const client = createQueryClient();
    expect(client).toBeDefined();
    expect(client.getDefaultOptions().queries).toMatchObject({
      retry: QUERY_CLIENT_DEFAULTS.queries.retry,
      staleTime: QUERY_CLIENT_DEFAULTS.queries.staleTime,
      gcTime: QUERY_CLIENT_DEFAULTS.queries.gcTime,
      refetchOnWindowFocus: QUERY_CLIENT_DEFAULTS.queries.refetchOnWindowFocus,
    });
    expect(client.getDefaultOptions().mutations).toMatchObject({
      retry: QUERY_CLIENT_DEFAULTS.mutations.retry,
    });
  });

  it("renders children inside the dashboard QueryProvider", () => {
    render(
      <QueryProvider>
        <QueryProbe />
      </QueryProvider>,
    );

    expect(screen.getByTestId("query-ready")).toHaveTextContent("ready");
  });
});
