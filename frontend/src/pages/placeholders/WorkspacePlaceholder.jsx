import PageContainer from "../../components/common/PageContainer";
import "./WorkspacePlaceholder.css";

export default function WorkspacePlaceholder({ title, description }) {
  return (
    <PageContainer className="workspace-placeholder">
      <header className="workspace-placeholder__header">
        <p className="workspace-placeholder__eyebrow">ClickCart workspace</p>
        <h1 className="cc-h2">{title}</h1>
        <p className="cc-body cc-text-secondary">{description}</p>
      </header>
      <section
        className="workspace-placeholder__notice"
        aria-label="Page setup status"
      >
        <span className="workspace-placeholder__notice-mark" aria-hidden="true">
          i
        </span>
        <div>
          <h2 className="cc-h4">Page scaffolding</h2>
          <p className="cc-body-sm cc-text-secondary">
            The provider navigation and page shell are in place. Feature-specific
            content can be added here.
          </p>
        </div>
      </section>
    </PageContainer>
  );
}
