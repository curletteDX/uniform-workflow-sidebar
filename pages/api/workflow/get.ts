import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchWorkflowDefinition } from '../../../lib/uniform-api';
import type { WorkflowDefinition } from '../../../types/workflow';

const UNIFORM_API_KEY = process.env.UNIFORM_API_KEY || '';
const UNIFORM_API_HOST = process.env.UNIFORM_API_HOST || 'https://uniform.app';

export interface GetWorkflowRequest {
  projectId: string;
  workflowId: string;
  apiHost?: string;
}

export interface GetWorkflowResponse {
  workflow?: WorkflowDefinition;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetWorkflowResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!UNIFORM_API_KEY) {
    return res.status(500).json({ error: 'UNIFORM_API_KEY not configured' });
  }

  const { projectId, workflowId, apiHost } = req.body as GetWorkflowRequest;

  if (!projectId || !workflowId) {
    return res.status(400).json({ error: 'projectId and workflowId are required' });
  }

  const result = await fetchWorkflowDefinition(
    UNIFORM_API_KEY,
    { projectId, apiHost: apiHost || UNIFORM_API_HOST },
    workflowId
  );

  if (result.error) {
    return res.status(result.workflow ? 200 : 404).json({ error: result.error });
  }

  return res.status(200).json({ workflow: result.workflow || undefined });
}
