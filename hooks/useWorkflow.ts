import { useState, useCallback, useEffect, useRef } from 'react';
import type { 
  WorkflowDefinition, 
  WorkflowStageDisplay,
  WorkflowTransitionAction 
} from '../types/workflow';
import type { GetWorkflowResponse } from '../pages/api/workflow/get';
import type { TransitionWorkflowResponse } from '../pages/api/workflow/transition';

export interface WorkflowEntityData {
  workflowId?: string;
  workflowStageId?: string;
}

export interface UseWorkflowOptions {
  projectId?: string;
  entityId?: string;
  entityType?: string;
  releaseId?: string;
  workflowId?: string;
  workflowStageId?: string;
}

export interface UseWorkflowResult {
  workflow: WorkflowDefinition | null;
  stages: WorkflowStageDisplay[];
  currentStage: WorkflowStageDisplay | null;
  availableTransitions: WorkflowTransitionAction[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  transition: (targetStageId: string) => Promise<boolean>;
}

export function useWorkflow({
  projectId,
  entityId,
  entityType,
  releaseId,
  workflowId,
  workflowStageId: initialStageId,
}: UseWorkflowOptions): UseWorkflowResult {
  const [workflow, setWorkflow] = useState<WorkflowDefinition | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStageId, setCurrentStageId] = useState<string | null>(initialStageId || null);
  
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (initialStageId) {
      setCurrentStageId(initialStageId);
    }
  }, [initialStageId]);

  const fetchWorkflow = useCallback(async () => {
    if (!projectId || !workflowId) {
      setWorkflow(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/workflow/get', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, workflowId }),
      });

      const data: GetWorkflowResponse = await response.json();

      if (!mountedRef.current) return;

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to fetch workflow');
      }

      if (data.workflow) {
        setWorkflow(data.workflow);
        
        if (!currentStageId && data.workflow.stages.length > 0) {
          const initialStage = data.workflow.stages.find(s => s.isInitial);
          if (initialStage) {
            setCurrentStageId(initialStage.id);
          }
        }
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to fetch workflow');
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [projectId, workflowId, currentStageId]);

  useEffect(() => {
    fetchWorkflow();
  }, [fetchWorkflow]);

  const stages: WorkflowStageDisplay[] = (workflow?.stages || []).map((stage, index) => {
    const currentIndex = workflow?.stages.findIndex(s => s.id === currentStageId) ?? -1;
    
    let state: 'completed' | 'current' | 'pending';
    if (stage.id === currentStageId) {
      state = 'current';
    } else if (currentIndex === -1) {
      state = stage.isInitial ? 'current' : 'pending';
    } else if (index < currentIndex) {
      state = 'completed';
    } else {
      state = 'pending';
    }

    return {
      id: stage.id,
      name: stage.name,
      state,
      isInitial: stage.isInitial,
    };
  });

  const currentStage = stages.find(s => s.state === 'current') || null;

  const availableTransitions: WorkflowTransitionAction[] = (() => {
    if (!workflow || !currentStageId) return [];
    
    const currentWorkflowStage = workflow.stages.find(s => s.id === currentStageId);
    if (!currentWorkflowStage?.transitions) return [];

    return currentWorkflowStage.transitions.map(transition => {
      const targetStage = workflow.stages.find(s => s.id === transition.targetStageId);
      return {
        transitionId: transition.id,
        transitionName: transition.name,
        targetStageId: transition.targetStageId,
        targetStageName: targetStage?.name || transition.targetStageId,
      };
    });
  })();

  const transition = useCallback(async (targetStageId: string): Promise<boolean> => {
    if (!projectId || !entityId || !entityType) {
      setError('Missing required parameters for transition');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/workflow/transition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          entityId,
          entityType,
          targetStageId,
          releaseId,
        }),
      });

      const data: TransitionWorkflowResponse = await response.json();

      if (!mountedRef.current) return false;

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to transition workflow');
      }

      if (data.success && data.newStageId) {
        setCurrentStageId(data.newStageId);
        return true;
      }

      return false;
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to transition workflow');
      }
      return false;
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [projectId, entityId, entityType, releaseId]);

  const refresh = useCallback(async () => {
    await fetchWorkflow();
  }, [fetchWorkflow]);

  return {
    workflow,
    stages,
    currentStage,
    availableTransitions,
    isLoading,
    error,
    refresh,
    transition,
  };
}
