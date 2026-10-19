import { EmptyState } from "@usa-limousine-corporation/ui/layout/empty-state";
import { PageHeader } from "@usa-limousine-corporation/ui/layout/page-header";

export default function HomePage() {
  return (
    <>
      <PageHeader
        title="Operations overview"
        description="No operational metrics are available until the API phase."
        breadcrumbs={[{ label: "Customer" }, { label: "Dashboard" }]}
      />
      <EmptyState
        title="No data available"
        description="This dashboard has no connected data sources yet."
      />
    </>
  );
}
