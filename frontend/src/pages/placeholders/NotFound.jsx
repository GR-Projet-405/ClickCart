import PageContainer from "../../components/common/PageContainer";
import "./WorkspacePlaceholder.css";

export default function NotFound() {
  return (
    <PageContainer className="workspace-placeholder">
      <h1 className="cc-h2">Page Not Found</h1>
      <p className="cc-body cc-text-secondary">
        The requested route is not registered in the ClickCart foundation.
      </p>
    </PageContainer>
  );
}
