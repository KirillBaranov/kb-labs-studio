import { useEffect, useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { qk } from '../query-keys'
import type { WorkflowDataSource, WorkflowRunsFilters } from '../sources/workflow-source'
import type { WorkflowLogEvent, WorkflowPresenterEvent } from '../contracts/workflows'

export function useWorkflowRuns(
  source: WorkflowDataSource,
  filters?: WorkflowRunsFilters,
) {
  const queryKey = useMemo(() => qk.workflows.list(filters), [filters])
  return useQuery({
    queryKey,
    queryFn: async () => {
      const response = await source.listRuns(filters)
      return response
    },
  })
}

export function useWorkflowRun(runId: string | null, source: WorkflowDataSource) {
  return useQuery({
    queryKey: qk.workflows.run(runId ?? ''),
    enabled: Boolean(runId),
    queryFn: async () => {
      if (!runId) {
        return null
      }
      return await source.getRun(runId)
    },
  })
}

export function useCancelWorkflowRun(source: WorkflowDataSource) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (runId: string) => source.cancelRun(runId),
    onSuccess: (run) => {
      void queryClient.invalidateQueries({ queryKey: qk.workflows.all, exact: false })
      if (run?.id) {
        void queryClient.invalidateQueries({ queryKey: qk.workflows.run(run.id) })
      }
    },
  })
}

export interface UseWorkflowLogsOptions {
  follow?: boolean
  idleTimeoutMs?: number
  enabled?: boolean
}

export function useWorkflowLogs(
  runId: string | null,
  options: UseWorkflowLogsOptions = {},
) {
  const { follow = true, idleTimeoutMs, enabled = true } = options
  const [events, setEvents] = useState<WorkflowLogEvent[]>([])
  const [error, setError] = useState<Error | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!runId || !enabled) {
      return
    }

    setEvents([])
    setError(null)
    if (typeof window === 'undefined') {
      return
    }

    const baseUrl =
      (window as any).__KB_LABS_API_BASE_URL__ ||
      (typeof import.meta !== 'undefined' ? (import.meta as any).env?.VITE_API_BASE_URL : undefined) ||
      'http://localhost:5050/api/v1'

    const params = new URLSearchParams()
    if (follow) {
      params.set('follow', '1')
    }
    if (typeof idleTimeoutMs === 'number') {
      params.set('idleTimeoutMs', String(idleTimeoutMs))
    }

    const url = `${baseUrl}/workflows/runs/${runId}/logs${params.toString() ? `?${params}` : ''}`
    const eventSource = new EventSource(url)

    const handleMessage = (event: MessageEvent) => {
      try {
        const payload = JSON.parse(event.data) as WorkflowLogEvent
        setEvents((prev) => [...prev, payload])
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to parse workflow log event'))
      }
    }

    eventSource.addEventListener('workflow.log', handleMessage)
    eventSource.onopen = () => {
      setIsConnected(true)
      setError(null)
    }
    eventSource.onerror = (_event) => {
      setIsConnected(false)
      setError(new Error('Workflow log stream disconnected'))
      eventSource.close()
    }

    return () => {
      eventSource.removeEventListener('workflow.log', handleMessage)
      eventSource.close()
    }
  }, [runId, follow, idleTimeoutMs, enabled])

  return {
    events,
    error,
    isConnected,
  }
}

export interface UseWorkflowEventsOptions {
  follow?: boolean
  pollIntervalMs?: number
  cursor?: string | null
  enabled?: boolean
}

export function useWorkflowEvents(
  runId: string | null,
  options: UseWorkflowEventsOptions = {},
) {
  const { follow = true, pollIntervalMs, cursor, enabled = true } = options
  const [events, setEvents] = useState<WorkflowPresenterEvent[]>([])
  const [error, setError] = useState<Error | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!runId || !enabled) {
      return
    }

    setEvents([])
    setError(null)
    if (typeof window === 'undefined') {
      return
    }

    const baseUrl =
      (window as any).__KB_LABS_API_BASE_URL__ ||
      (typeof import.meta !== 'undefined' ? (import.meta as any).env?.VITE_API_BASE_URL : undefined) ||
      'http://localhost:5050/api/v1'

    const params = new URLSearchParams()
    if (follow) {
      params.set('follow', '1')
    }
    if (typeof pollIntervalMs === 'number') {
      params.set('pollIntervalMs', String(pollIntervalMs))
    }
    if (cursor) {
      params.set('cursor', cursor)
    }

    const url = `${baseUrl}/workflows/runs/${runId}/events${params.toString() ? `?${params}` : ''}`
    const eventSource = new EventSource(url)

    const handleMessage = (event: MessageEvent) => {
      try {
        const payload = JSON.parse(event.data) as WorkflowPresenterEvent
        setEvents((prev) => [...prev, payload])
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to parse workflow event'))
      }
    }

    eventSource.addEventListener('workflow.event', handleMessage)
    eventSource.onopen = () => {
      setIsConnected(true)
      setError(null)
    }
    eventSource.onerror = () => {
      setIsConnected(false)
      setError(new Error('Workflow event stream disconnected'))
      eventSource.close()
    }

    return () => {
      eventSource.removeEventListener('workflow.event', handleMessage)
      eventSource.close()
    }
  }, [runId, follow, pollIntervalMs, cursor, enabled])

  return {
    events,
    error,
    isConnected,
  }
}
