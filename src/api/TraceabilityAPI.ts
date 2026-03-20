import { isAxiosError } from 'axios'
import api from '@/lib/axios'
import {
    DatasetFormData, datasetsSchema,
    ExperimentFormData, experimentsSchema,
    DecisionFormData, decisionsSchema,
    TaskPhase
} from '../types'

type TraceabilityParams = {
    projectId: string
    phase?: TaskPhase
    id?: string
}

// ── Datasets ──────────────────────────────────────────────────────────────

export async function getDatasets({ projectId, phase }: TraceabilityParams) {
    try {
        const url = `/projects/${projectId}/datasets${phase ? `?phase=${phase}` : ''}`
        const { data } = await api(url)
        const response = datasetsSchema.safeParse(data)
        if (response.success) return response.data
        return []
    } catch (error) {
        if (isAxiosError(error) && error.response) throw new Error(error.response.data.error)
        return []
    }
}

export async function createDataset({ projectId, formData }: { projectId: string; formData: DatasetFormData }) {
    try {
        const { data } = await api.post<string>(`/projects/${projectId}/datasets`, formData)
        return data
    } catch (error) {
        if (isAxiosError(error) && error.response) throw new Error(error.response.data.error)
    }
}

export async function deleteDataset({ projectId, id }: { projectId: string; id: string }) {
    try {
        const { data } = await api.delete<string>(`/projects/${projectId}/datasets/${id}`)
        return data
    } catch (error) {
        if (isAxiosError(error) && error.response) throw new Error(error.response.data.error)
    }
}

// ── Experiments ───────────────────────────────────────────────────────────

export async function getExperiments({ projectId, phase }: TraceabilityParams) {
    try {
        const url = `/projects/${projectId}/experiments${phase ? `?phase=${phase}` : ''}`
        const { data } = await api(url)
        const response = experimentsSchema.safeParse(data)
        if (response.success) return response.data
        return []
    } catch (error) {
        if (isAxiosError(error) && error.response) throw new Error(error.response.data.error)
        return []
    }
}

export async function createExperiment({ projectId, formData }: { projectId: string; formData: ExperimentFormData }) {
    try {
        const { data } = await api.post<string>(`/projects/${projectId}/experiments`, formData)
        return data
    } catch (error) {
        if (isAxiosError(error) && error.response) throw new Error(error.response.data.error)
    }
}

export async function deleteExperiment({ projectId, id }: { projectId: string; id: string }) {
    try {
        const { data } = await api.delete<string>(`/projects/${projectId}/experiments/${id}`)
        return data
    } catch (error) {
        if (isAxiosError(error) && error.response) throw new Error(error.response.data.error)
    }
}

// ── Decisions ─────────────────────────────────────────────────────────────

export async function getDecisions({ projectId, phase }: TraceabilityParams) {
    try {
        const url = `/projects/${projectId}/decisions${phase ? `?phase=${phase}` : ''}`
        const { data } = await api(url)
        const response = decisionsSchema.safeParse(data)
        if (response.success) return response.data
        return []
    } catch (error) {
        if (isAxiosError(error) && error.response) throw new Error(error.response.data.error)
        return []
    }
}

export async function createDecision({ projectId, formData }: { projectId: string; formData: DecisionFormData }) {
    try {
        const { data } = await api.post<string>(`/projects/${projectId}/decisions`, formData)
        return data
    } catch (error) {
        if (isAxiosError(error) && error.response) throw new Error(error.response.data.error)
    }
}

export async function deleteDecision({ projectId, id }: { projectId: string; id: string }) {
    try {
        const { data } = await api.delete<string>(`/projects/${projectId}/decisions/${id}`)
        return data
    } catch (error) {
        if (isAxiosError(error) && error.response) throw new Error(error.response.data.error)
    }
}