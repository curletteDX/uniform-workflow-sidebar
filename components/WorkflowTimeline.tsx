import React from 'react';
import type { WorkflowTransitionAction } from '../types/workflow';

export interface WorkflowStage {
  id: string;
  name: string;
  state: 'completed' | 'current' | 'pending';
  isInitial?: boolean;
}

interface WorkflowTimelineProps {
  workflowName: string;
  stages: WorkflowStage[];
  availableTransitions?: WorkflowTransitionAction[];
  onTransition?: (targetStageId: string) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
  error?: string | null;
}

export function WorkflowTimeline({
  workflowName,
  stages,
  availableTransitions = [],
  onTransition,
  onRefresh,
  isLoading = false,
  error,
}: WorkflowTimelineProps) {
  return (
    <div style={styles.container}>
      {/* Header with title and refresh */}
      <div style={styles.header}>
        <div style={styles.headerTop}>
          <span style={styles.label}>WORKFLOW</span>
          {onRefresh && (
            <button
              style={styles.refreshButton}
              onClick={onRefresh}
              disabled={isLoading}
              title="Refresh workflow data"
            >
              <RefreshIcon spinning={isLoading} />
            </button>
          )}
        </div>
        <h2 style={styles.title}>{workflowName}</h2>
      </div>

      {/* Error display */}
      {error && (
        <div style={styles.errorBanner}>
          <span>{error}</span>
        </div>
      )}

      {/* Timeline with stages */}
      <div style={styles.timeline}>
        <svg
          width="100%"
          height={stages.length * 80 + 20}
          style={styles.svg}
        >
          <SnakePath stages={stages} />
        </svg>
        
        <div style={styles.stagesOverlay}>
          {stages.map((stage, index) => (
            <StageNode
              key={stage.id}
              stage={stage}
              index={index}
              total={stages.length}
            />
          ))}
        </div>
      </div>

      {/* Transition buttons */}
      {availableTransitions.length > 0 && (
        <div style={styles.transitionsSection}>
          <span style={styles.transitionsLabel}>AVAILABLE ACTIONS</span>
          <div style={styles.transitionsContainer}>
            {availableTransitions.map((transition) => (
              <button
                key={transition.transitionId}
                style={{
                  ...styles.transitionButton,
                  ...(isLoading ? styles.transitionButtonDisabled : {}),
                }}
                onClick={() => onTransition?.(transition.targetStageId)}
                disabled={isLoading}
              >
                {transition.transitionName}
                <span style={styles.transitionTarget}>
                  → {transition.targetStageName}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No transitions available message */}
      {availableTransitions.length === 0 && stages.length > 0 && (
        <div style={styles.noTransitions}>
          <span style={styles.noTransitionsText}>
            No transitions available from current stage
          </span>
        </div>
      )}
    </div>
  );
}

function RefreshIcon({ spinning }: { spinning?: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={spinning ? { animation: 'spin 1s linear infinite' } : undefined}
    >
      <path d="M23 4v6h-6" />
      <path d="M1 20v-6h6" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}

interface StageNodeProps {
  stage: WorkflowStage;
  index: number;
  total: number;
}

function StageNode({ stage, index }: StageNodeProps) {
  const isLeft = index % 2 === 1;
  const nodeSize = stage.state === 'current' ? 44 : 36;
  const topOffset = index * 80 + 10;
  
  return (
    <div
      style={{
        ...styles.stageContainer,
        top: topOffset,
        flexDirection: isLeft ? 'row' : 'row-reverse',
      }}
    >
      <div
        style={{
          ...styles.node,
          width: nodeSize,
          height: nodeSize,
          ...(stage.state === 'completed' && styles.nodeCompleted),
          ...(stage.state === 'current' && styles.nodeCurrent),
          ...(stage.state === 'pending' && styles.nodePending),
        }}
      >
        {stage.state === 'completed' && (
          <CheckIcon />
        )}
        {stage.state === 'current' && (
          <span style={styles.currentDot} />
        )}
      </div>
      
      <div
        style={{
          ...styles.labelContainer,
          textAlign: isLeft ? 'right' : 'left',
          [isLeft ? 'marginRight' : 'marginLeft']: 12,
        }}
      >
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
          {stage.state === 'current' && 'Current Stage'}
          {stage.state === 'pending' && 'Pending'}
        </span>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

interface SnakePathProps {
  stages: WorkflowStage[];
}

function SnakePath({ stages }: SnakePathProps) {
  if (stages.length < 2) return null;

  const width = 280;
  const centerX = width / 2;
  const nodeOffset = 55;
  
  let pathD = '';
  
  stages.forEach((stage, index) => {
    const y = index * 80 + 28;
    const isLeft = index % 2 === 1;
    const x = isLeft ? centerX - nodeOffset : centerX + nodeOffset;
    
    if (index === 0) {
      pathD += `M ${x} ${y}`;
    } else {
      const prevY = (index - 1) * 80 + 28;
      const prevIsLeft = (index - 1) % 2 === 1;
      const prevX = prevIsLeft ? centerX - nodeOffset : centerX + nodeOffset;
      
      const midY = (prevY + y) / 2;
      pathD += ` C ${prevX} ${midY}, ${x} ${midY}, ${x} ${y}`;
    }
  });

  const currentIndex = stages.findIndex(s => s.state === 'current');

  return (
    <>
      {/* Background path */}
      <path
        d={pathD}
        fill="none"
        stroke={colors.gray200}
        strokeWidth={2}
        strokeLinecap="round"
      />
      {/* Progress path (completed portion) */}
      {currentIndex > 0 && (
        <ProgressPath stages={stages} currentIndex={currentIndex} />
      )}
    </>
  );
}

function ProgressPath({ stages, currentIndex }: { stages: WorkflowStage[]; currentIndex: number }) {
  const width = 280;
  const centerX = width / 2;
  const nodeOffset = 55;
  
  let pathD = '';
  
  for (let i = 0; i <= currentIndex; i++) {
    const y = i * 80 + 28;
    const isLeft = i % 2 === 1;
    const x = isLeft ? centerX - nodeOffset : centerX + nodeOffset;
    
    if (i === 0) {
      pathD += `M ${x} ${y}`;
    } else {
      const prevY = (i - 1) * 80 + 28;
      const prevIsLeft = (i - 1) % 2 === 1;
      const prevX = prevIsLeft ? centerX - nodeOffset : centerX + nodeOffset;
      
      const midY = (prevY + y) / 2;
      pathD += ` C ${prevX} ${midY}, ${x} ${midY}, ${x} ${y}`;
    }
  }

  return (
    <path
      d={pathD}
      fill="none"
      stroke={colors.purple}
      strokeWidth={2}
      strokeLinecap="round"
    />
  );
}

const colors = {
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray400: '#9CA3AF',
  gray600: '#4B5563',
  gray900: '#1F2937',
  purple: '#6366F1',
  purpleLight: '#EEF2FF',
  purpleDark: '#4F46E5',
  red100: '#FEE2E2',
  red600: '#DC2626',
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
    padding: '16px 20px',
    borderBottom: `1px solid ${colors.gray200}`,
  },
  headerTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.5px',
    color: colors.gray400,
    textTransform: 'uppercase' as const,
  },
  title: {
    fontSize: '17px',
    fontWeight: 600,
    color: colors.gray900,
    margin: '4px 0 0 0',
  },
  refreshButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    padding: 0,
    border: `1px solid ${colors.gray200}`,
    borderRadius: '6px',
    backgroundColor: colors.white,
    color: colors.gray600,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  errorBanner: {
    margin: '12px 20px 0',
    padding: '10px 12px',
    backgroundColor: colors.red100,
    color: colors.red600,
    borderRadius: '6px',
    fontSize: '13px',
  },
  timeline: {
    flex: 1,
    padding: '20px 28px',
    overflowY: 'auto',
    position: 'relative' as const,
  },
  svg: {
    position: 'absolute' as const,
    top: 20,
    left: 28,
    right: 28,
    pointerEvents: 'none' as const,
  },
  stagesOverlay: {
    position: 'relative' as const,
    width: '100%',
  },
  stageContainer: {
    position: 'absolute' as const,
    left: 0,
    right: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  node: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    flexShrink: 0,
    transition: 'all 0.15s ease',
  },
  nodeCompleted: {
    backgroundColor: colors.purple,
  },
  nodeCurrent: {
    backgroundColor: colors.purpleLight,
    border: `3px solid ${colors.purple}`,
    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
    boxSizing: 'border-box' as const,
  },
  nodePending: {
    backgroundColor: colors.white,
    border: `2px solid ${colors.gray200}`,
    boxSizing: 'border-box' as const,
  },
  currentDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: colors.purple,
  },
  labelContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    minWidth: 75,
  },
  stageName: {
    fontSize: '14px',
    fontWeight: 500,
    color: colors.gray900,
    lineHeight: 1.3,
  },
  stageNameCurrent: {
    fontWeight: 600,
    color: colors.purple,
  },
  stageNamePending: {
    color: colors.gray400,
  },
  stageStatus: {
    fontSize: '12px',
    color: colors.gray400,
    marginTop: '2px',
  },
  stageStatusCurrent: {
    color: colors.purpleDark,
    fontWeight: 500,
  },
  transitionsSection: {
    padding: '16px 20px',
    borderTop: `1px solid ${colors.gray200}`,
    backgroundColor: colors.gray50,
  },
  transitionsLabel: {
    display: 'block',
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.5px',
    color: colors.gray400,
    textTransform: 'uppercase' as const,
    marginBottom: '10px',
  },
  transitionsContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  transitionButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '12px 14px',
    fontSize: '14px',
    fontWeight: 500,
    color: colors.purple,
    backgroundColor: colors.white,
    border: `1px solid ${colors.gray200}`,
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    fontFamily: 'inherit',
  },
  transitionButtonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  transitionTarget: {
    fontSize: '12px',
    color: colors.gray400,
    fontWeight: 400,
  },
  noTransitions: {
    padding: '16px 20px',
    borderTop: `1px solid ${colors.gray200}`,
  },
  noTransitionsText: {
    fontSize: '13px',
    color: colors.gray400,
  },
};

const globalStyles = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

if (typeof document !== 'undefined') {
  const styleEl = document.createElement('style');
  styleEl.textContent = globalStyles;
  document.head.appendChild(styleEl);
}

export default WorkflowTimeline;
