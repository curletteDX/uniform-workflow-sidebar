import React, { useMemo, useEffect, useCallback } from 'react';
import { useMeshLocation } from '@uniformdev/mesh-sdk-react';
import { WorkflowTimeline } from '../../components/WorkflowTimeline';
import { useWorkflow } from '../../hooks/useWorkflow';

function EditorToolContent() {
  const { value, metadata } = useMeshLocation<'canvasEditorTools'>();
  
  useEffect(() => {
    console.log('=== Workflow Sidebar Debug ===');
    console.log('Project ID:', metadata?.projectId);
    console.log('Release ID:', metadata?.releaseId);
    console.log('Entity Type:', value?.entityType);
    console.log('Root Entity keys:', value?.rootEntity ? Object.keys(value.rootEntity) : 'null');
    console.log('Root Entity:', value?.rootEntity);
    
    const entity = value?.rootEntity as any;
    if (entity) {
      console.log('workflowId:', entity.workflowId);
      console.log('workflowStageId:', entity.workflowStageId);
      console.log('_workflowStage:', entity._workflowStage);
      const underscoreProps = Object.keys(entity).filter(k => k.startsWith('_') || k.toLowerCase().includes('workflow'));
      console.log('Workflow-related props:', underscoreProps);
      underscoreProps.forEach(prop => {
        console.log(`  ${prop}:`, entity[prop]);
      });
    }
  }, [value, metadata]);

  const entityId = value?.rootEntity?._id;
  const entityType = value?.entityType;
  const projectId = metadata?.projectId;
  const releaseId = metadata?.releaseId;
  
  const entity = value?.rootEntity as any;
  const workflowId = entity?.workflowId || entity?._workflowStage?.workflowId;
  const workflowStageId = entity?.workflowStageId || entity?._workflowStage?.stageId;

  const {
    workflow,
    stages,
    availableTransitions,
    isLoading,
    error,
    refresh,
    transition,
  } = useWorkflow({
    projectId,
    entityId,
    entityType,
    releaseId,
    workflowId,
    workflowStageId,
  });

  const handleTransition = useCallback(async (targetStageId: string) => {
    const success = await transition(targetStageId);
    if (success) {
      await refresh();
    }
  }, [transition, refresh]);

  const handleRefresh = useCallback(async () => {
    await refresh();
  }, [refresh]);

  if (!workflowId) {
    return (
      <div style={styles.emptyState}>
        <div style={styles.emptyIcon}>
          <WorkflowIcon />
        </div>
        <h3 style={styles.emptyTitle}>No Workflow Assigned</h3>
        <p style={styles.emptyText}>
          This {entityType || 'content'} does not have a workflow assigned.
          Assign a workflow to the content type or component definition to enable workflow stages.
        </p>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <WorkflowTimeline
        workflowName={workflow?.name || 'Workflow'}
        stages={stages}
        availableTransitions={availableTransitions}
        onTransition={handleTransition}
        onRefresh={handleRefresh}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
}

function WorkflowIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#9CA3AF"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="5" r="3" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <circle cx="6" cy="19" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="12" y1="12" x2="6" y2="16" />
      <line x1="12" y1="12" x2="18" y2="16" />
    </svg>
  );
}

export default function EditorToolPage() {
  return <EditorToolContent />;
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    height: '100vh',
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    padding: '32px',
    textAlign: 'center',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  emptyIcon: {
    marginBottom: '16px',
    opacity: 0.6,
  },
  emptyTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#374151',
    margin: '0 0 8px 0',
  },
  emptyText: {
    fontSize: '14px',
    color: '#6B7280',
    margin: 0,
    maxWidth: '280px',
    lineHeight: 1.5,
  },
};
