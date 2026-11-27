import { Link } from "react-router";
import { PageHeader } from "../components/PageHeader";
import { pagePath } from "../routes";

export function NotFoundPage() {
  return (
    <>
      <PageHeader title="Page not found" />
      <Link to={pagePath("dashboard")}>Back to the dashboard</Link>
    </>
  );
}
