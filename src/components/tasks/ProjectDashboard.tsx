import { useQuery } from '@tanstack/react-query'
import { getProjectReport } from '@/api/ReportAPI'
import { TaskPhase } from '@/types/index'
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'

type Props = { projectId: string }

const phaseOrder: TaskPhase[] = ['business','data_understanding','data_preparation','modeling','evaluation','deployment']

const phaseLabels: Record<TaskPhase, string> = {
    business:           '01',
    data_understanding: '02',
    data_preparation:   '03',
    modeling:           '04',
    evaluation:         '05',
    deployment:         '06',
}

const phaseColors: Record<TaskPhase, string> = {
    business:           '#888780',
    data_understanding: '#534AB7',
    data_preparation:   '#0F6E56',
    modeling:           '#993556',
    evaluation:         '#BA7517',
    deployment:         '#185FA5',
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

function daysSince(dateStr: string): number {
    return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
}

export default function ProjectDashboard({ projectId }: Props) {
    const { data, isLoading } = useQuery({
        queryKey: ['report', projectId],
        queryFn: () => getProjectReport(projectId),
        staleTime: 0,
        refetchOnWindowFocus: true,
        refetchInterval: 30000, // refresca cada 30 segundos automáticamente
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

    // Métricas
    const globalPct = Math.round(
        phaseOrder.reduce((acc, phase) => {
            return acc + calcPhaseProgress(tasks.filter((t: any) => t.phase === phase))
        }, 0) / phaseOrder.length
    )
    const traceabilityCount = datasets.length + experiments.length + decisions.length

    // Progreso por fase
    const phaseProgressData = phaseOrder.map(phase => ({
        name: phaseLabels[phase],
        progreso: calcPhaseProgress(tasks.filter((t: any) => t.phase === phase)),
        color: phaseColors[phase],
    }))

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

            {/* Métricas */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: 'Progreso global', value: `${globalPct}%`, sub: 'promedio 6 fases', color: '#06b6d4' },
                    { label: 'Tareas totales', value: tasks.length, sub: `${tasks.filter((t:any) => t.status === 'completed').length} completadas`, color: '#a78bfa' },
                    { label: 'Trazabilidad', value: traceabilityCount, sub: `${datasets.length}D · ${experiments.length}E · ${decisions.length}Dec`, color: '#34d399' },
                    { label: 'Estancadas', value: stalledTasks.length, sub: '+7 días sin cambio', color: stalledTasks.length > 0 ? '#f87171' : '#34d399' },
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
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">

                {/* Progreso por fase */}
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3">Progreso por fase</p>
                    <ResponsiveContainer width="100%" height={140}>
                        <BarChart data={phaseProgressData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                            <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} unit="%" />
                            <Tooltip
                                contentStyle={{ background: '#1e293b', border: '0.5px solid #334155', borderRadius: 8, fontSize: 11 }}
                                labelStyle={{ color: '#94a3b8' }}
                                formatter={(v) => [`${v}%`, 'Progreso']}
                            />
                            <Bar dataKey="progreso" radius={[3, 3, 0, 0]} maxBarSize={32}>
                                {phaseProgressData.map((entry, i) => (
                                    <Cell key={i} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Distribución estados */}
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3">Distribución de estados</p>
                    {statusData.length === 0 ? (
                        <p className="text-slate-600 text-xs text-center py-10">Sin tareas registradas</p>
                    ) : (
                        <div className="flex items-center gap-4">
                            <ResponsiveContainer width={120} height={120}>
                                <PieChart>
                                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" strokeWidth={0}>
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

                {/* Colaboradores */}
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3">Carga por colaborador</p>
                    {collabData.length === 0 ? (
                        <p className="text-slate-600 text-xs text-center py-10">Sin asignaciones</p>
                    ) : (
                        <div className="space-y-3">
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

                {/* Estancados */}
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3">Procesos estancados</p>
                    {stalledTasks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-6 gap-2">
                            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <p className="text-emerald-500 text-xs font-bold">Sin procesos estancados</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {stalledTasks.slice(0, 3).map((t: any, i: number) => (
                                <div key={i} className="flex items-center justify-between p-2.5 bg-red-900/20 border border-red-900/40 rounded-lg">
                                    <div>
                                        <p className="text-xs font-bold text-red-300">{t.name}</p>
                                        <p className="text-[10px] text-slate-500 mt-0.5">
                                            {phaseLabels[t.phase as TaskPhase]} · {statusLabels[t.status]}
                                        </p>
                                    </div>
                                    <span className="text-[10px] font-black text-red-400 flex-shrink-0 ml-2">
                                        {daysSince(t.updatedAt)}d
                                    </span>
                                </div>
                            ))}
                            {stalledTasks.length > 3 && (
                                <p className="text-[10px] text-slate-600 text-center">+{stalledTasks.length - 3} más</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    )
}