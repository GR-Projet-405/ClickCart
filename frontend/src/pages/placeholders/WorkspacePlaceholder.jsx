import React from 'react';
import PageContainer from "../../components/common/PageContainer";
import "./WorkspacePlaceholder.css";

export default function WorkspacePlaceholder({ title, description }) {
  return (
    <PageContainer className="workspace-placeholder">
      <h1 className="cc-h2">{title}</h1>
      <p className="cc-body cc-text-secondary">{description}</p>
    </PageContainer>
  );
}
