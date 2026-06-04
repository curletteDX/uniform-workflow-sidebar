import type { NextApiRequest, NextApiResponse } from 'next';
import { updateEntryWorkflowStage, updateCompositionWorkflowStage } from '../../../lib/uniform-api';

const UNIFORM_API_KEY = process.env.UNIFORM_API_KEY || '';
const UNIFORM_API_HOST = process.env.UNIFORM_API_HOST || 'https://uniform.app';

export interface TransitionWorkflowRequest {
  projectId: string;
  entityId: string;
  entityType: 'composition' | 'entry' | 'componentPattern' | 'entryPattern';
  targetStageId: string;
  apiHost?: string;
  releaseId?: string;
}

export interface TransitionWorkflowResponse {
  success?: boolean;
  newStageId?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TransitionWorkflowResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!UNIFORM_API_KEY) {
    return res.status(500).json({ error: 'UNIFORM_API_KEY not configured' });
  }

  const { 
    projectId, 
    entityId, 
    entityType, 
    targetStageId,
    apiHost,
    releaseId 
  } = req.body as TransitionWorkflowRequest;

  if (!projectId || !entityId || !entityType || !targetStageId) {
    return res.status(400).json({ 
      error: 'projectId, entityId, entityType, and targetStageId are required' 
    });
  }

  const metadata = { projectId, apiHost: apiHost || UNIFORM_API_HOST, releaseId };

  let result;
  if (entityType === 'composition' || entityType === 'componentPattern') {
    result = await updateCompositionWorkflowStage(
      UNIFORM_API_KEY,
      metadata,
      entityId,
      targetStageId
    );
  } else {
    result = await updateEntryWorkflowStage(
      UNIFORM_API_KEY,
      metadata,
      entityId,
      targetStageId
    );
  }

  if (result.error) {
    return res.status(500).json({ error: result.error });
  }

  return res.status(200).json({ 
    success: result.success, 
    newStageId: result.newStageId 
  });
}
