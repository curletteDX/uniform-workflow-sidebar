import React from 'react';

export interface WorkflowStage {
  id: string;
  name: string;
  state: 'completed' | 'current' | 'pending';
}

interface WorkflowTimelineProps {
  workflowName: string;
  stages: WorkflowStage[];
  onPrevious?: () => void;
  onNext?: () => void;
  isLoading?: boolean;
}

export function WorkflowTimeline({
  workflowName,
  stages,
  onPrevious,
  onNext,
  isLoading = false,
}: WorkflowTimelineProps) {
  const currentIndex = stages.findIndex((s) => s.state === 'current');
  const canGoPrevious = currentIndex > 0 && !isLoading;
  const canGoNext = currentIndex < stages.length - 1 && currentIndex >= 0 && !isLoading;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <span style={styles.label}>WORKFLOW</span>
        <h2 style={styles.title}>{workflowName}</h2>
      </div>

      {/* Timeline */}
      <div style={styles.timeline}>
        {stages.map((stage, index) => (
          <div key={stage.id} style={styles.stageContainer}>
            {/* Node and connecting line */}
            <div style={styles.nodeColumn}>
              <div
                style={{
                  ...styles.node,
                  ...(stage.state === 'completed' && styles.nodeCompleted),
                  ...(stage.state === 'current' && styles.nodeCurrent),
                  ...(stage.state === 'pending' && styles.nodePending),
                }}
              />
              {index < stages.length - 1 && <div style={styles.line} />}
            </div>

            {/* Label */}
            <div style={styles.labelColumn}>
              <span
                style={{
                  ...styles.stageName,
                  ...(stage.state === 'current' && styles.stageNameCurrent),
                  ...(stage.state === 'pending' && styles.stageNamePending),
                }}
              >
                {stage.name}
              </span>
              <span
                style={{
                  ...styles.stageStatus,
                  ...(stage.state === 'current' && styles.stageStatusCurrent),
                }}
              >
                {stage.state === 'completed' && 'Completed'}
                {stage.state === 'current' && 'Current'}
                {stage.state === 'pending' && 'Pending'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer with actions */}
      <div style={styles.footer}>
        <button
          style={{
            ...styles.button,
            ...(canGoPrevious ? styles.buttonEnabled : styles.buttonDisabled),
          }}
          onClick={onPrevious}
          disabled={!canGoPrevious}
        >
          ← Previous
        </button>
        <button
          style={{
            ...styles.button,
            ...(canGoNext ? styles.buttonEnabled : styles.buttonDisabled),
          }}
          onClick={onNext}
          disabled={!canGoNext}
        >
          Next →
        </button>
      </div>
    </div>
  );
}

const colors = {
  white: '#FFFFFF',
  gray100: '#F9FAFB',
  gray200: '#E5E7EB',
  gray400: '#9CA3AF',
  gray600: '#4B5563',
  gray900: '#1F2937',
  purple: '#6366F1',
  purpleLight: '#EEF2FF',
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: colors.white,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  },
  header: {
    padding: '20px 24px',
    borderBottom: `1px solid ${colors.gray200}`,
  },
  label: {
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.5px',
    color: colors.gray400,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: '18px',
    fontWeight: 600,
    color: colors.gray900,
    margin: '4px 0 0 0',
  },
  timeline: {
    flex: 1,
    padding: '24px',
    overflowY: 'auto',
  },
  stageContainer: {
    display: 'flex',
    alignItems: 'flex-start',
    marginBottom: '8px',
  },
  nodeColumn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginRight: '16px',
  },
  node: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  nodeCompleted: {
    backgroundColor: colors.gray200,
  },
  nodeCurrent: {
    width: '48px',
    height: '48px',
    backgroundColor: colors.purple,
    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
  },
  nodePending: {
    backgroundColor: colors.white,
    border: `2px solid ${colors.gray200}`,
  },
  line: {
    width: '2px',
    height: '40px',
    backgroundColor: colors.gray200,
    marginTop: '8px',
    marginBottom: '8px',
  },
  labelColumn: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    minHeight: '40px',
    paddingTop: '8px',
  },
  stageName: {
    fontSize: '15px',
    fontWeight: 500,
    color: colors.gray900,
    lineHeight: 1.3,
  },
  stageNameCurrent: {
    fontWeight: 600,
  },
  stageNamePending: {
    color: colors.gray400,
  },
  stageStatus: {
    fontSize: '13px',
    color: colors.gray400,
    marginTop: '2px',
  },
  stageStatusCurrent: {
    color: colors.purple,
  },
  footer: {
    display: 'flex',
    gap: '12px',
    padding: '16px 24px',
    borderTop: `1px solid ${colors.gray200}`,
  },
  button: {
    flex: 1,
    padding: '12px 16px',
    fontSize: '14px',
    fontWeight: 500,
    borderRadius: '8px',
    border: `1px solid ${colors.gray200}`,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    fontFamily: 'inherit',
  },
  buttonEnabled: {
    backgroundColor: colors.white,
    color: colors.purple,
    borderColor: colors.gray200,
  },
  buttonDisabled: {
    backgroundColor: colors.gray100,
    color: colors.gray400,
    borderColor: colors.gray200,
    cursor: 'not-allowed',
  },
};

export default WorkflowTimeline;
