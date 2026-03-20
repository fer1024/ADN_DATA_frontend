import { isAxiosError } from 'axios'
import api from '@/lib/axios'

export type ReportData = {
    tasks: any[]
    datasets: any[]
    experiments: any[]
    decisions: any[]
    stalledTasks: any[]
}

export async function getProjectReport(projectId: string): Promise<ReportData> {
    try {
        const { data } = await api(`/projects/${projectId}/report`)
        return data
    } catch (error) {
        if (isAxiosError(error) && error.response) throw new Error(error.response.data.error)
        return { tasks: [], datasets: [], experiments: [], decisions: [], stalledTasks: [] }
    }
}
