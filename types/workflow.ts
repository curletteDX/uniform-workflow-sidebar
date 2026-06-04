export interface WorkflowStageTransition {
  id: string;
  name: string;
  targetStageId: string;
  targetStageName?: string;
  permissions?: {
    canTransition?: string[];
  };
}

export interface WorkflowStage {
  id: string;
  name: string;
  isInitial?: boolean;
  autoPublish?: boolean;
  requiresValidity?: boolean;
  permissions?: {
    canEdit?: string[];
    canPublish?: string[];
  };
  transitions?: WorkflowStageTransition[];
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  projectId?: string;
  stages: WorkflowStage[];
}

export interface EntityWorkflowState {
  workflowId: string;
  workflowName?: string;
  stageId: string;
  stageName?: string;
}

export interface WorkflowStageDisplay {
  id: string;
  name: string;
  state: 'completed' | 'current' | 'pending';
  isInitial?: boolean;
}

export interface WorkflowTransitionAction {
  transitionId: string;
  transitionName: string;
  targetStageId: string;
  targetStageName: string;
}
