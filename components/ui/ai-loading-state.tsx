type AiLoadingStateProps = {
  eyebrow: string;
  title: string;
  body: string;
  steps: string[];
};

export function AiLoadingState({ eyebrow, title, body, steps }: AiLoadingStateProps) {
  return (
    <div className="ai-loading-state" aria-live="polite" aria-busy="true">
      <div className="loading-orb" aria-hidden="true">
        <span className="loading-orb-core" />
      </div>
      <div className="stack-sm">
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        <p>{body}</p>
      </div>
      <div className="loading-step-list">
        {steps.map((step) => (
          <div className="loading-step" key={step}>
            <span className="loading-step-dot" aria-hidden="true" />
            <span>{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
