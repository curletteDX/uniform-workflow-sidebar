import React, { useCallback, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
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

// Demo workflow for development/preview
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [workflowDef, setWorkflowDef] = useState<WorkflowDefinition>(DEMO_WORKFLOW);
  const [currentStageId, setCurrentStageId] = useState<string>('review');
  const [meshLocation, setMeshLocation] = useState<any>(null);

  // Initialize MESH SDK when in Uniform iframe
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if we're in an iframe (Uniform context)
    const isInIframe = window.self !== window.top;
    
    if (isInIframe) {
      // Dynamically import and initialize the MESH SDK
      import('@uniformdev/mesh-sdk-react').then(async (mod) => {
        try {
          // The SDK communicates with the parent Uniform window
          // For now, we'll rely on message events
          console.log('MESH SDK loaded in Uniform iframe context');
        } catch (err) {
          console.error('Failed to initialize MESH SDK:', err);
        }
      });
    }
  }, []);

  // Build stages array with current state
  const stages: WorkflowStage[] = React.useMemo(() => {
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
      console.log('Transitioning to previous stage:', previousStage.name);
      
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // Update local state for demo
      setCurrentStageId(previousStage.id);
      
    } catch (err) {
      setError('Failed to transition workflow');
      console.error('Workflow transition error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [workflowDef, stages]);

  const handleNext = useCallback(async () => {
    if (!workflowDef || !stages.length) return;
    
    const currentIndex = stages.findIndex((s) => s.state === 'current');
    if (currentIndex >= stages.length - 1 || currentIndex < 0) return;

    const nextStage = workflowDef.stages[currentIndex + 1];
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Transitioning to next stage:', nextStage.name);
      
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // Update local state for demo
      setCurrentStageId(nextStage.id);
      
    } catch (err) {
      setError('Failed to transition workflow');
      console.error('Workflow transition error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [workflowDef, stages]);

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

// Use dynamic import with SSR disabled to avoid hydration issues
const EditorTool = dynamic(() => Promise.resolve(EditorToolContent), {
  ssr: false,
  loading: () => (
    <div style={styles.loading}>
      <span>Loading workflow...</span>
    </div>
  ),
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
};
