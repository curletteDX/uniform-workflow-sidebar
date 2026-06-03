import React, { useCallback, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { MeshApp, useMeshLocation } from '@uniformdev/mesh-sdk-react';
import { WorkflowTimeline, WorkflowStage } from '../../components/WorkflowTimeline';

interface WorkflowStageDefinition {
  id: string;
  name: string;
}

interface WorkflowDefinition {
  id: string;
  name: string;
  stages: WorkflowStageDefinition[];
}

// Demo workflow shown when not in Uniform context or no workflow assigned
const DEMO_WORKFLOW: WorkflowDefinition = {
  id: 'demo',
  name: 'Content Review',
  stages: [
    { id: 'editing', name: 'Editing' },
    { id: 'review', name: 'Review' },
    { id: 'published', name: 'Published' },
  ],
};

function EditorToolContent() {
  // Get location value and metadata from Uniform via MESH SDK
  const { value, metadata } = useMeshLocation('canvasEditorTools');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [demoStageId, setDemoStageId] = useState<string>('review');

  // Extract workflow info from the location value
  // Value contains the composition/entry being edited
  const entityData = (value as any)?.composition || (value as any)?.entry;
  const workflowStage = entityData?._workflowStage;
  const workflowId = workflowStage?.workflowId;
  const currentStageId = workflowStage?.stageId || demoStageId;

  // Get workflow definition from metadata or use demo
  const workflowDef: WorkflowDefinition = useMemo(() => {
    // Check if workflow definitions are available in metadata
    const workflows = (metadata as any)?.workflows;
    if (workflows && workflowId && workflows[workflowId]) {
      return workflows[workflowId];
    }
    
    // Check for workflow stages in the workflowStage itself
    if (workflowStage?.workflowName) {
      return {
        id: workflowId || 'unknown',
        name: workflowStage.workflowName,
        stages: DEMO_WORKFLOW.stages, // Use demo stages as fallback
      };
    }
    
    return DEMO_WORKFLOW;
  }, [metadata, workflowId, workflowStage]);

  // Build stages array with current state
  const stages: WorkflowStage[] = useMemo(() => {
    if (!workflowDef) return [];

    const currentIndex = workflowDef.stages.findIndex(
      (s) => s.id === currentStageId
    );

    return workflowDef.stages.map((stage, index) => {
      let state: 'completed' | 'current' | 'pending';
      if (currentIndex === -1) {
        state = index === 0 ? 'current' : 'pending';
      } else if (index < currentIndex) {
        state = 'completed';
      } else if (index === currentIndex) {
        state = 'current';
      } else {
        state = 'pending';
      }

      return {
        id: stage.id,
        name: stage.name,
        state,
      };
    });
  }, [workflowDef, currentStageId]);

  const handlePrevious = useCallback(async () => {
    if (!workflowDef || !stages.length) return;
    
    const currentIndex = stages.findIndex((s) => s.state === 'current');
    if (currentIndex <= 0) return;

    const previousStage = workflowDef.stages[currentIndex - 1];
    
    setIsLoading(true);
    setError(null);
    
    try {
      // TODO: Call Uniform API to transition workflow stage
      console.log('Transitioning to previous stage:', previousStage.name);
      
      // For demo mode, update local state
      if (!workflowId) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        setDemoStageId(previousStage.id);
      }
      
    } catch (err) {
      setError('Failed to transition workflow');
      console.error('Workflow transition error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [workflowDef, stages, workflowId]);

  const handleNext = useCallback(async () => {
    if (!workflowDef || !stages.length) return;
    
    const currentIndex = stages.findIndex((s) => s.state === 'current');
    if (currentIndex >= stages.length - 1 || currentIndex < 0) return;

    const nextStage = workflowDef.stages[currentIndex + 1];
    
    setIsLoading(true);
    setError(null);
    
    try {
      // TODO: Call Uniform API to transition workflow stage
      console.log('Transitioning to next stage:', nextStage.name);
      
      // For demo mode, update local state
      if (!workflowId) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        setDemoStageId(nextStage.id);
      }
      
    } catch (err) {
      setError('Failed to transition workflow');
      console.error('Workflow transition error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [workflowDef, stages, workflowId]);

  return (
    <div style={styles.wrapper}>
      <WorkflowTimeline
        workflowName={workflowDef.name}
        stages={stages}
        onPrevious={handlePrevious}
        onNext={handleNext}
        isLoading={isLoading}
      />
      {error && <div style={styles.error}>{error}</div>}
    </div>
  );
}

// Loading component for MeshApp
function LoadingState() {
  return (
    <div style={styles.loading}>
      <span>Loading workflow...</span>
    </div>
  );
}

// Error component for MeshApp
function ErrorState({ error }: { error: Error }) {
  return (
    <div style={styles.errorState}>
      <span>Error loading: {error.message}</span>
    </div>
  );
}

// Wrap with MeshApp which provides the required context
function EditorToolWithMeshApp() {
  return (
    <MeshApp loadingComponent={LoadingState} errorComponent={ErrorState}>
      <EditorToolContent />
    </MeshApp>
  );
}

// Dynamic import with SSR disabled - required because MeshApp
// depends on browser APIs and iframe messaging with Uniform
const EditorTool = dynamic(() => Promise.resolve(EditorToolWithMeshApp), {
  ssr: false,
  loading: () => <LoadingState />,
});

export default function EditorToolPage() {
  return <EditorTool />;
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    height: '100vh',
    width: '100%',
    overflow: 'hidden',
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    color: '#6B7280',
    fontSize: '14px',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  error: {
    position: 'absolute',
    bottom: '80px',
    left: '16px',
    right: '16px',
    padding: '12px',
    backgroundColor: '#FEE2E2',
    color: '#DC2626',
    borderRadius: '8px',
    fontSize: '13px',
  },
  errorState: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    color: '#DC2626',
    fontSize: '14px',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
};
