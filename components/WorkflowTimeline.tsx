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

      {/* Timeline with alternating snake path */}
      <div style={styles.timeline}>
        <svg
          width="100%"
          height={stages.length * 100 + 20}
          style={styles.svg}
        >
          {/* Draw the winding path */}
          <SnakePath stages={stages} />
        </svg>
        
        {/* Stage nodes and labels */}
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

interface StageNodeProps {
  stage: WorkflowStage;
  index: number;
  total: number;
}

function StageNode({ stage, index, total }: StageNodeProps) {
  const isLeft = index % 2 === 1;
  const nodeSize = stage.state === 'current' ? 48 : 40;
  const topOffset = index * 100 + 10;
  
  return (
    <div
      style={{
        ...styles.stageContainer,
        top: topOffset,
        flexDirection: isLeft ? 'row' : 'row-reverse',
      }}
    >
      {/* Node */}
      <div
        style={{
          ...styles.node,
          width: nodeSize,
          height: nodeSize,
          ...(stage.state === 'completed' && styles.nodeCompleted),
          ...(stage.state === 'current' && styles.nodeCurrent),
          ...(stage.state === 'pending' && styles.nodePending),
        }}
      />
      
      {/* Label */}
      <div
        style={{
          ...styles.labelContainer,
          textAlign: isLeft ? 'right' : 'left',
          [isLeft ? 'marginRight' : 'marginLeft']: 16,
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
          {stage.state === 'current' && 'Current'}
          {stage.state === 'pending' && 'Pending'}
        </span>
      </div>
    </div>
  );
}

interface SnakePathProps {
  stages: WorkflowStage[];
}

function SnakePath({ stages }: SnakePathProps) {
  if (stages.length < 2) return null;

  const width = 280;
  const centerX = width / 2;
  const nodeOffset = 60;
  
  let pathD = '';
  
  stages.forEach((stage, index) => {
    const y = index * 100 + 30;
    const isLeft = index % 2 === 1;
    const x = isLeft ? centerX - nodeOffset : centerX + nodeOffset;
    
    if (index === 0) {
      pathD += `M ${x} ${y}`;
    } else {
      const prevY = (index - 1) * 100 + 30;
      const prevIsLeft = (index - 1) % 2 === 1;
      const prevX = prevIsLeft ? centerX - nodeOffset : centerX + nodeOffset;
      
      const midY = (prevY + y) / 2;
      
      pathD += ` C ${prevX} ${midY}, ${x} ${midY}, ${x} ${y}`;
    }
  });

  return (
    <path
      d={pathD}
      fill="none"
      stroke={colors.gray200}
      strokeWidth={2}
      strokeLinecap="round"
    />
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
    textTransform: 'uppercase' as const,
  },
  title: {
    fontSize: '18px',
    fontWeight: 600,
    color: colors.gray900,
    margin: '4px 0 0 0',
  },
  timeline: {
    flex: 1,
    padding: '24px 32px',
    overflowY: 'auto',
    position: 'relative' as const,
  },
  svg: {
    position: 'absolute' as const,
    top: 24,
    left: 32,
    right: 32,
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
    borderRadius: '50%',
    flexShrink: 0,
    transition: 'all 0.15s ease',
  },
  nodeCompleted: {
    backgroundColor: colors.gray200,
  },
  nodeCurrent: {
    backgroundColor: colors.purple,
    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
  },
  nodePending: {
    backgroundColor: colors.white,
    border: `2px solid ${colors.gray200}`,
    boxSizing: 'border-box' as const,
  },
  labelContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    minWidth: 80,
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
