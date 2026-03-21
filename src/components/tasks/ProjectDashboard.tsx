import { useQuery } from '@tanstack/react-query'
import { getProjectReport } from '@/api/ReportAPI'
import { TaskPhase } from '@/types/index'
import { Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'

type Props = { projectId: string }

const phaseOrder: TaskPhase[] = ['business','data_understanding','data_preparation','modeling','evaluation','deployment']

const phaseLabels: Record<TaskPhase, string> = {
    business:           'Business',
    data_understanding: 'Data Und.',
    data_preparation:   'Data Prep.',
    modeling:           'Modeling',
    evaluation:         'Evaluation',
    deployment:         'Deployment',
}

const statusColors: Record<string, string> = {
    pending:     '#475569',
    onHold:      '#6366f1',
    inProgress:  '#06b6d4',
    underReview: '#d946ef',
    completed:   '#10b981',
}

const statusLabels: Record<string, string> = {
    pending:     'Pendiente',
    onHold:      'En espera',
    inProgress:  'En progreso',
    underReview: 'En revisión',
    completed:   'Completado',
}

const statusWeight: Record<string, number> = {
    pending: 0, onHold: 25, inProgress: 50, underReview: 75, completed: 100
}

function calcPhaseProgress(tasks: any[]): number {
    if (!tasks.length) return 0
    return Math.round(tasks.reduce((acc, t) => acc + (statusWeight[t.status] ?? 0), 0) / tasks.length)
}

function getSemaphoreColor(progress: number): string {
    if (progress >= 80) return '#10b981'
    if (progress >= 30) return '#f59e0b'
    return '#ef4444'
}

function parseMetric(result: string): number {
    const num = parseFloat(result)
    return isNaN(num) ? 0 : num
}

export default function ProjectDashboard({ projectId }: Props) {
    const { data, isLoading } = useQuery({
        queryKey: ['report', projectId],
        queryFn: () => getProjectReport(projectId),
        staleTime: 0,
        refetchOnWindowFocus: true,
        refetchInterval: 30000,
    })

    if (isLoading) return (
        <div className="bg-[#0f172a] rounded-2xl p-6 border border-slate-800 mb-8">
            <p className="text-slate-600 text-xs font-mono animate-pulse text-center">Cargando dashboard...</p>
        </div>
    )

    const tasks       = data?.tasks ?? []
    const datasets    = data?.datasets ?? []
    const experiments = data?.experiments ?? []
    const decisions   = data?.decisions ?? []
    const stalledTasks = data?.stalledTasks ?? []

    // Tareas sin asignar
    const unassignedTasks = tasks.filter((t: any) => !t.assignedTo || t.assignedTo === '')

    // Trazabilidad por fase
    const traceabilityByPhase = phaseOrder.map(phase => ({
        phase,
        datasets: datasets.filter((d: any) => d.phase === phase).length,
        experiments: experiments.filter((e: any) => e.phase === phase).length,
        decisions: decisions.filter((d: any) => d.phase === phase).length,
    }))

    // Mejores experimentos (top 3 por métrica)
    const topExperiments = [...experiments]
        .map((e: any) => ({ ...e, metricValue: parseMetric(e.result) }))
        .sort((a: any, b: any) => b.metricValue - a.metricValue)
        .slice(0, 3)

    // Métricas
    const globalPct = Math.round(
        phaseOrder.reduce((acc, phase) => {
            return acc + calcPhaseProgress(tasks.filter((t: any) => t.phase === phase))
        }, 0) / phaseOrder.length
    )
    const traceabilityCount = datasets.length + experiments.length + decisions.length

    // Distribución de estados
    const statusData = Object.keys(statusLabels).map(status => ({
        name: statusLabels[status],
        value: tasks.filter((t: any) => t.status === status).length,
        color: statusColors[status],
    })).filter(d => d.value > 0)

    // Carga por colaborador
    const collabMap: Record<string, { name: string; completed: number; inProgress: number }> = {}
    tasks.forEach((t: any) => {
        if (t.assignedTo && typeof t.assignedTo === 'object') {
            const id = t.assignedTo._id
            if (!collabMap[id]) collabMap[id] = { name: t.assignedTo.name, completed: 0, inProgress: 0 }
            if (t.status === 'completed') collabMap[id].completed++
            else collabMap[id].inProgress++
        }
    })
    const collabData = Object.values(collabMap)

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-[#0f172a] rounded-2xl p-5 border border-slate-800 mb-8 space-y-4"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                    Dashboard del proyecto
                </p>
                <p className="text-[10px] text-slate-700 font-mono">
                    Actualizado en tiempo real
                </p>
            </div>

            {/* Pipeline CRISP-DM Semáforo */}
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3">Pipeline CRISP-DM</p>
                <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
                    {phaseOrder.map((phase, i) => {
                        const progress = calcPhaseProgress(tasks.filter((t: any) => t.phase === phase))
                        const semColor = getSemaphoreColor(progress)
                        const count = tasks.filter((t: any) => t.phase === phase).length
                        return (
                            <div key={phase} className="flex items-center">
                                <div className="flex flex-col items-center min-w-[80px] sm:min-w-[100px] md:min-w-[120px]">
                                    <div 
                                        className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center border-[3px]"
                                        style={{ 
                                            backgroundColor: `${semColor}20`,
                                            borderColor: semColor,
                                        }}
                                    >
                                        <span className="text-sm sm:text-base md:text-lg font-black" style={{ color: semColor }}>
                                            {progress}%
                                        </span>
                                    </div>
                                    <span className="text-[9px] sm:text-[10px] text-slate-400 mt-1.5 text-center leading-tight font-medium">
                                        {phaseLabels[phase]}
                                    </span>
                                    <span className="text-[8px] sm:text-[9px] text-slate-600">{count} tareas</span>
                                </div>
                                {i < phaseOrder.length - 1 && (
                                    <div className="w-3 sm:w-6 h-0.5 bg-slate-700 flex-shrink-0" />
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Alertas */}
            {(unassignedTasks.length > 0 || stalledTasks.length > 0) && (
                <div className="flex flex-wrap gap-2">
                    {unassignedTasks.length > 0 && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                            <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span className="text-[10px] text-amber-400 font-bold">
                                {unassignedTasks.length} tarea{unassignedTasks.length > 1 ? 's' : ''} sin asignar
                            </span>
                        </div>
                    )}
                    {stalledTasks.length > 0 && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg">
                            <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-[10px] text-red-400 font-bold">
                                {stalledTasks.length} tarea{stalledTasks.length > 1 ? 's' : ''} estancada{stalledTasks.length > 1 ? 's' : ''}
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Métricas */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: 'Progreso global', value: `${globalPct}%`, sub: 'promedio 6 fases', color: '#06b6d4' },
                    { label: 'Tareas totales', value: tasks.length, sub: `${tasks.filter((t:any) => t.status === 'completed').length} completadas`, color: '#a78bfa' },
                    { label: 'Trazabilidad', value: traceabilityCount, sub: `${datasets.length}D · ${experiments.length}E · ${decisions.length}Dec`, color: '#34d399' },
                    { label: 'Asignadas', value: tasks.length - unassignedTasks.length, sub: `${unassignedTasks.length} sin asignar`, color: unassignedTasks.length > 0 ? '#f59e0b' : '#34d399' },
                ].map((m, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08, duration: 0.4 }}
                        className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50"
                    >
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">{m.label}</p>
                        <p className="text-2xl font-black tabular-nums leading-none" style={{ color: m.color }}>{m.value}</p>
                        <p className="text-[10px] text-slate-600 mt-1">{m.sub}</p>
                    </motion.div>
                ))}
            </div>

            {/* Gráficas */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">

                {/* Distribución estados */}
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3">Distribución de estados</p>
                    {statusData.length === 0 ? (
                        <p className="text-slate-600 text-xs text-center py-10">Sin tareas registradas</p>
                    ) : (
                        <div className="flex items-center gap-4">
                            <ResponsiveContainer width={100} height={100} className="sm:!w-[120px] sm:!h-[120px]">
                                <PieChart>
                                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={30} outerRadius={45} dataKey="value" strokeWidth={0}>
                                        {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ background: '#1e293b', border: '0.5px solid #334155', borderRadius: 8, fontSize: 11 }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex flex-col gap-1.5 flex-1">
                                {statusData.map((s, i) => (
                                    <div key={i} className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: s.color }} />
                                            <span className="text-[10px] text-slate-400">{s.name}</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-300">{s.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Carga por colaborador */}
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3">Carga por colaborador</p>
                    {collabData.length === 0 ? (
                        <p className="text-slate-600 text-xs text-center py-10">Sin asignaciones</p>
                    ) : (
                        <div className="space-y-3 max-h-[140px] overflow-y-auto pr-1">
                            {collabData.map((c, i) => {
                                const total = c.completed + c.inProgress
                                const pct = total === 0 ? 0 : Math.round((c.completed / total) * 100)
                                return (
                                    <div key={i}>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs text-slate-300 font-medium">{c.name}</span>
                                            <span className="text-[10px] text-slate-500 font-mono">{c.completed}/{total}</span>
                                        </div>
                                        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full rounded-full bg-emerald-500"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${pct}%` }}
                                                transition={{ duration: 0.8, ease: 'easeOut', delay: i * 0.1 }}
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* Trazabilidad por fase */}
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3">Trazabilidad por fase</p>
                    <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                        {traceabilityByPhase.map((t) => {
                            const total = t.datasets + t.experiments + t.decisions
                            if (total === 0) return null
                            return (
                                <div key={t.phase} className="flex items-center justify-between">
                                    <span className="text-[10px] text-slate-400 w-24 truncate">{phaseLabels[t.phase]}</span>
                                    <div className="flex gap-2">
                                        {t.datasets > 0 && (
                                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">
                                                {t.datasets}D
                                            </span>
                                        )}
                                        {t.experiments > 0 && (
                                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400">
                                                {t.experiments}E
                                            </span>
                                        )}
                                        {t.decisions > 0 && (
                                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                                                {t.decisions}Dec
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                        {traceabilityByPhase.every(t => t.datasets + t.experiments + t.decisions === 0) && (
                            <p className="text-slate-600 text-xs text-center py-4">Sin trazabilidad registrada</p>
                        )}
                    </div>
                </div>

                {/* Mejores experimentos */}
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 md:col-span-2 xl:col-span-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3">Mejores experimentos</p>
                    {topExperiments.length === 0 ? (
                        <p className="text-slate-600 text-xs text-center py-6">Sin experimentos registrados</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[140px] overflow-y-auto pr-1">
                            {topExperiments.map((e: any, i: number) => (
                                <div key={e._id} className="flex items-center justify-between p-2 bg-slate-900/50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                                            i === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                                            i === 1 ? 'bg-slate-400/20 text-slate-300' :
                                            'bg-orange-700/20 text-orange-400'
                                        }`}>
                                            {i + 1}
                                        </span>
                                        <div>
                                            <p className="text-xs text-white font-medium truncate max-w-[150px]">{e.name}</p>
                                            <p className="text-[9px] text-slate-500">{e.algorithmModel}</p>
                                        </div>
                                    </div>
                                    <div className="text-right ml-2">
                                        <p className="text-sm font-black text-cyan-400">{e.result}</p>
                                        <p className="text-[9px] text-slate-500">{e.metric}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    )
}