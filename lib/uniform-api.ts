import { WorkflowClient, ContentClient, CanvasClient, CANVAS_DRAFT_STATE } from '@uniformdev/canvas';
import type { WorkflowDefinition } from '../types/workflow';

export interface UniformApiMetadata {
  projectId: string;
  apiHost?: string;
  releaseId?: string;
}

export interface FetchWorkflowResult {
  workflow: WorkflowDefinition | null;
  error?: string;
}

export interface UpdateWorkflowStageResult {
  success: boolean;
  newStageId?: string;
  error?: string;
}

/**
 * Fetch a workflow definition from Uniform
 */
export async function fetchWorkflowDefinition(
  apiKey: string,
  metadata: UniformApiMetadata,
  workflowId: string
): Promise<FetchWorkflowResult> {
  if (!metadata.projectId || !workflowId) {
    return { workflow: null, error: 'Missing projectId or workflowId' };
  }

  try {
    const workflowClient = new WorkflowClient({
      apiKey,
      apiHost: metadata.apiHost || 'https://uniform.app',
      projectId: metadata.projectId,
    });

    const response = await workflowClient.get({ workflowIDs: [workflowId] });

    if (!response.results || response.results.length === 0) {
      return { workflow: null, error: 'Workflow not found' };
    }

    const workflowData = response.results[0];
    const initialStageId = workflowData.initialStage;

    const workflow: WorkflowDefinition = {
      id: workflowData.id,
      name: workflowData.name,
      projectId: metadata.projectId,
      stages: Object.entries(workflowData.stages || {}).map(([stageId, stage]) => ({
        id: stageId,
        name: stage.name,
        isInitial: stageId === initialStageId,
        autoPublish: stage.autoPublish,
        requiresValidity: stage.requireValidity,
        permissions: stage.permissions,
        transitions: (stage.transitions || []).map(transition => ({
          id: `${stageId}-to-${transition.to}`,
          name: transition.name || 'Transition',
          targetStageId: transition.to,
          permissions: transition.permissions,
        })),
      })),
    };

    return { workflow };
  } catch (error) {
    console.error('Error fetching workflow:', error);
    return {
      workflow: null,
      error: error instanceof Error ? error.message : 'Failed to fetch workflow',
    };
  }
}

/**
 * Update an entry's workflow stage
 */
export async function updateEntryWorkflowStage(
  apiKey: string,
  metadata: UniformApiMetadata,
  entryId: string,
  workflowStageId: string
): Promise<UpdateWorkflowStageResult> {
  if (!metadata.projectId || !entryId || !workflowStageId) {
    return { success: false, error: 'Missing required parameters' };
  }

  try {
    const contentClient = new ContentClient({
      apiKey,
      apiHost: metadata.apiHost || 'https://uniform.app',
      projectId: metadata.projectId,
    });

    const getResponse = await contentClient.getEntries({
      entryIDs: [entryId],
      state: CANVAS_DRAFT_STATE,
      releaseId: metadata.releaseId,
      skipDataResolution: true,
      skipOverridesResolution: true,
      skipPatternResolution: true,
    });

    if (!getResponse.entries || getResponse.entries.length === 0) {
      return { success: false, error: 'Entry not found' };
    }

    const entryData = getResponse.entries[0].entry;

    await contentClient.upsertEntry({
      entry: {
        ...entryData,
        workflowStageId,
      } as typeof entryData,
      state: CANVAS_DRAFT_STATE,
      releaseId: metadata.releaseId,
      skipValidation: false,
    });

    return { success: true, newStageId: workflowStageId };
  } catch (error) {
    console.error('Error updating entry workflow stage:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update workflow stage',
    };
  }
}

/**
 * Update a composition's workflow stage
 */
export async function updateCompositionWorkflowStage(
  apiKey: string,
  metadata: UniformApiMetadata,
  compositionId: string,
  workflowStageId: string
): Promise<UpdateWorkflowStageResult> {
  if (!metadata.projectId || !compositionId || !workflowStageId) {
    return { success: false, error: 'Missing required parameters' };
  }

  try {
    const canvasClient = new CanvasClient({
      apiKey,
      apiHost: metadata.apiHost || 'https://uniform.app',
      projectId: metadata.projectId,
    });

    const getResponse = await canvasClient.getCompositionById({
      compositionId,
      state: CANVAS_DRAFT_STATE,
      releaseId: metadata.releaseId,
      skipPatternResolution: true,
      skipParameterResolution: true,
      skipOverridesResolution: true,
    });

    if (!getResponse.composition) {
      return { success: false, error: 'Composition not found' };
    }

    const composition = getResponse.composition;

    await canvasClient.updateComposition({
      composition: {
        ...composition,
        workflowStageId,
      } as typeof composition,
      state: CANVAS_DRAFT_STATE,
      releaseId: metadata.releaseId,
      skipValidation: false,
    });

    return { success: true, newStageId: workflowStageId };
  } catch (error) {
    console.error('Error updating composition workflow stage:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update workflow stage',
    };
  }
}
