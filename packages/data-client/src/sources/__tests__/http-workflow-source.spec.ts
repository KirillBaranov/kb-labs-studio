import { describe, expect, it, vi } from 'vitest'
import { HttpWorkflowSource } from '../http-workflow-source'
import { KBError } from '../../errors/kb-error'

class StubClient {
  fetch = vi.fn()
}

const SAMPLE_RUN = { id: 'run-1', status: 'queued' }

describe('HttpWorkflowSource', () => {
  it('lists runs with query filters', async () => {
    const client = new StubClient()
    client.fetch.mockResolvedValue({ runs: [], total: 0 })
    const source = new HttpWorkflowSource(client as any)

    await source.listRuns({ status: 'running', limit: 5 })

    expect(client.fetch).toHaveBeenCalledWith('/workflows/runs?status=running&limit=5')
  })

  it('returns null when run is not found', async () => {
    const client = new StubClient()
    client.fetch.mockRejectedValue(new KBError('NOT_FOUND', 'missing', 404))
    const source = new HttpWorkflowSource(client as any)

    const run = await source.getRun('unknown')

    expect(run).toBeNull()
  })

  it('passes inline spec to runWorkflow', async () => {
    const client = new StubClient()
    client.fetch.mockResolvedValue({ run: SAMPLE_RUN })
    const source = new HttpWorkflowSource(client as any)

    const result = await source.runWorkflow({
      spec: { name: 'demo', version: '1.0.0', jobs: {} },
      idempotencyKey: 'build#123',
      concurrencyGroup: 'branch:main',
      metadata: { trigger: 'ci' },
    })

    expect(result).toEqual(SAMPLE_RUN)
    expect(client.fetch).toHaveBeenCalledWith('/workflows/run', {
      method: 'POST',
      headers: expect.any(Headers),
      body: JSON.stringify({
        inlineSpec: { name: 'demo', version: '1.0.0', jobs: {} },
        idempotency: 'build#123',
        concurrency: { group: 'branch:main' },
        metadata: { trigger: 'ci' },
      }),
    })
  })
})





