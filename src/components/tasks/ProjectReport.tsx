import { useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { getProjectReport } from '@/api/ReportAPI'
import { Project, TaskPhase } from '@/types/index'

type Props = {
    project: Project
    show: boolean
    onClose: () => void
}

const phaseLabels: Record<TaskPhase, string> = {
    business:          '01 Business',
    data_understanding:'02 Data Und.',
    data_preparation:  '03 Data Prep.',
    modeling:          '04 Modeling',
    evaluation:        '05 Evaluation',
    deployment:        '06 Deployment',
}

const phaseColors: Record<TaskPhase, string> = {
    business:          '#888780',
    data_understanding:'#534AB7',
    data_preparation:  '#0F6E56',
    modeling:          '#993556',
    evaluation:        '#BA7517',
    deployment:        '#185FA5',
}

const statusColors: Record<string, string> = {
    pending:     '#64748b',
    onHold:      '#6366f1',
    inProgress:  '#06b6d4',
    underReview: '#d946ef',
    completed:   '#10b981',
}

const statusLabels: Record<string, string> = {
    pending:     'Pendiente',
    onHold:      'En Espera',
    inProgress:  'En Progreso',
    underReview: 'En Revisión',
    completed:   'Completado',
}

const phaseOrder: TaskPhase[] = ['business','data_understanding','data_preparation','modeling','evaluation','deployment']

const statusWeight: Record<string, number> = {
    pending: 0, onHold: 25, inProgress: 50, underReview: 75, completed: 100
}

function calcPhaseProgress(tasks: any[]): number {
    if (!tasks.length) return 0
    return Math.round(tasks.reduce((acc, t) => acc + (statusWeight[t.status] ?? 0), 0) / tasks.length)
}

function formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

function daysBetween(a: string | null | undefined, b: string | null | undefined): string {
    if (!a) return '—'
    const end = b ? new Date(b) : new Date()
    const days = Math.floor((end.getTime() - new Date(a).getTime()) / 86400000)
    return `${days} día${days !== 1 ? 's' : ''}`
}

export default function ProjectReport({ project, show, onClose }: Props) {
    const reportRef = useRef<HTMLDivElement>(null)
    const [exporting, setExporting] = useState(false)

    const { data, isLoading } = useQuery({
        queryKey: ['report', project._id],
        queryFn: () => getProjectReport(project._id),
        enabled: show,
    })

    const exportPDF = async () => {
        if (!reportRef.current) return
        setExporting(true)
        try {
            const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
                import('jspdf'),
                import('html2canvas'),
            ])
            const canvas = await html2canvas(reportRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
            })
            const imgData = canvas.toDataURL('image/png')
            const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
            const pageW = pdf.internal.pageSize.getWidth()
            const pageH = pdf.internal.pageSize.getHeight()
            const imgH = (canvas.height * pageW) / canvas.width
            let y = 0
            while (y < imgH) {
                if (y > 0) pdf.addPage()
                pdf.addImage(imgData, 'PNG', 0, -y, pageW, imgH)
                y += pageH
            }
            pdf.save(`reporte-${project.projectName.replace(/\s+/g, '-')}.pdf`)
        } catch (e) {
            console.error(e)
        }
        setExporting(false)
    }

    const tasks = data?.tasks ?? []
    const datasets = data?.datasets ?? []
    const experiments = data?.experiments ?? []
    const decisions = data?.decisions ?? []
    const stalledTasks = data?.stalledTasks ?? []

    // Phase progress chart data
    const phaseProgressData = phaseOrder.map(phase => ({
        name: phaseLabels[phase],
        progreso: calcPhaseProgress(tasks.filter((t: any) => t.phase === phase)),
        color: phaseColors[phase],
    }))

    // Status distribution
    const statusData = Object.keys(statusLabels).map(status => ({
        name: statusLabels[status],
        value: tasks.filter((t: any) => t.status === status).length,
        color: statusColors[status],
    })).filter(d => d.value > 0)

    // Tasks by collaborator
    const collaboratorMap: Record<string, { name: string; total: number; completed: number }> = {}
    tasks.forEach((t: any) => {
        if (t.assignedTo && typeof t.assignedTo === 'object') {
            const id = t.assignedTo._id
            if (!collaboratorMap[id]) collaboratorMap[id] = { name: t.assignedTo.name, total: 0, completed: 0 }
            collaboratorMap[id].total++
            if (t.status === 'completed') collaboratorMap[id].completed++
        }
    })
    const collaboratorData = Object.values(collaboratorMap)

    // Global progress
    const globalPct = phaseProgressData.length
        ? Math.round(phaseProgressData.reduce((a, b) => a + b.progreso, 0) / phaseProgressData.length)
        : 0

    return (
        <Transition appear show={show} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child as={Fragment}
                    enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
                    leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-start justify-center p-4 pt-8">
                        <Transition.Child as={Fragment}
                            enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-[95vw] sm:max-w-5xl lg:max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden">

                                {/* Toolbar */}
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-4 sm:px-8 py-4 bg-slate-50 border-b border-slate-200">
                                    <h2 className="text-lg font-bold text-slate-800">Reporte del Proyecto</h2>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={exportPDF}
                                            disabled={exporting || isLoading}
                                            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            {exporting ? 'Exportando...' : 'Exportar PDF'}
                                        </button>
                                        <button onClick={onClose} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-bold rounded-lg transition-colors">
                                            Cerrar
                                        </button>
                                    </div>
                                </div>

                                {isLoading ? (
                                    <div className="flex items-center justify-center h-64">
                                        <p className="text-slate-400 animate-pulse">Generando reporte...</p>
                                    </div>
                                ) : (
                                    <div ref={reportRef} className="bg-white p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">

                                        {/* Encabezado */}
                                        <div className="border-b-2 border-cyan-500 pb-4 sm:pb-6">
                                            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                                                <div>
                                                    <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-cyan-600 mb-1">Reporte Ejecutivo · CRISP-DM</p>
                                                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900">{project.projectName}</h1>
                                                    <p className="text-slate-500 mt-1">{project.description}</p>
                                                    <p className="text-sm text-slate-400 mt-1">Cliente: <span className="font-semibold text-slate-600">{project.clientName}</span></p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-slate-400">Generado el</p>
                                                    <p className="text-sm font-bold text-slate-700">{new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                                                    <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-cyan-50 rounded-full">
                                                        <span className="text-2xl font-black text-cyan-600">{globalPct}%</span>
                                                        <span className="text-xs text-cyan-500 font-medium">avance global</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 1. Progreso por fase */}
                                        <section>
                                            <h3 className="text-base font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                                                <span className="w-3 h-3 rounded-full bg-cyan-500 inline-block"/>
                                                Progreso por Fase CRISP-DM
                                            </h3>
                                            <ResponsiveContainer width="100%" height={220}>
                                                <BarChart data={phaseProgressData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                                                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} />
                                                    <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} unit="%" />
                                                    <Tooltip formatter={(v) => [`${v}%`, 'Progreso']} />
                                                    <Bar dataKey="progreso" radius={[4, 4, 0, 0]}>
                                                        {phaseProgressData.map((entry, i) => (
                                                            <Cell key={i} fill={entry.color} />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </section>

                                        {/* 2. Distribución de estados + colaboradores */}
                                        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                                            <div>
                                                <h3 className="text-base font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                                                    <span className="w-3 h-3 rounded-full bg-indigo-500 inline-block"/>
                                                    Distribución por Estado
                                                </h3>
                                                {statusData.length === 0 ? (
                                                    <p className="text-slate-400 text-sm">Sin tareas registradas</p>
                                                ) : (
                                                    <ResponsiveContainer width="100%" height={200}>
                                                        <PieChart>
                                                            <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                                                                {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                                            </Pie>
                                                            <Tooltip />
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                )}
                                            </div>

                                            <div>
                                                <h3 className="text-base font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                                                    <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"/>
                                                    Carga por Colaborador
                                                </h3>
                                                {collaboratorData.length === 0 ? (
                                                    <p className="text-slate-400 text-sm">Sin asignaciones registradas</p>
                                                ) : (
                                                    <div className="space-y-3">
                                                        {collaboratorData.map((c, i) => (
                                                            <div key={i}>
                                                                <div className="flex justify-between text-sm mb-1">
                                                                    <span className="font-medium text-slate-700">{c.name}</span>
                                                                    <span className="text-slate-500">{c.completed}/{c.total} tareas</span>
                                                                </div>
                                                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.round((c.completed / c.total) * 100)}%` }} />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </section>

                                        {/* 3. Tiempos de ejecución */}
                                        <section>
                                            <h3 className="text-base font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                                                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"/>
                                                Tiempos de Ejecución
                                            </h3>
                                            <table className="w-full text-sm border-collapse">
                                                <thead>
                                                    <tr className="bg-slate-50">
                                                        <th className="text-left p-2 text-slate-600 font-bold border border-slate-200">Tarea</th>
                                                        <th className="text-left p-2 text-slate-600 font-bold border border-slate-200">Fase</th>
                                                        <th className="text-left p-2 text-slate-600 font-bold border border-slate-200">Inicio</th>
                                                        <th className="text-left p-2 text-slate-600 font-bold border border-slate-200">Fin</th>
                                                        <th className="text-left p-2 text-slate-600 font-bold border border-slate-200">Duración</th>
                                                        <th className="text-left p-2 text-slate-600 font-bold border border-slate-200">Estado</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {tasks.length === 0 ? (
                                                        <tr><td colSpan={6} className="p-3 text-slate-400 text-center border border-slate-200">Sin tareas</td></tr>
                                                    ) : tasks.map((t: any) => (
                                                        <tr key={t._id} className="hover:bg-slate-50">
                                                            <td className="p-2 border border-slate-200 font-medium text-slate-800">{t.name}</td>
                                                            <td className="p-2 border border-slate-200 text-slate-600">{phaseLabels[t.phase as TaskPhase] ?? t.phase}</td>
                                                            <td className="p-2 border border-slate-200 text-slate-600">{formatDate(t.startedAt)}</td>
                                                            <td className="p-2 border border-slate-200 text-slate-600">{formatDate(t.finishedAt)}</td>
                                                            <td className="p-2 border border-slate-200 text-slate-600">{daysBetween(t.startedAt, t.finishedAt)}</td>
                                                            <td className="p-2 border border-slate-200">
                                                                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold text-white" style={{ background: statusColors[t.status] }}>
                                                                    {statusLabels[t.status]}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </section>

                                        {/* 4. Procesos estancados */}
                                        {stalledTasks.length > 0 && (
                                            <section>
                                                <h3 className="text-base font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                                                    <span className="w-3 h-3 rounded-full bg-red-500 inline-block"/>
                                                    Procesos Estancados (+7 días sin cambio)
                                                </h3>
                                                <div className="space-y-2">
                                                    {stalledTasks.map((t: any) => (
                                                        <div key={t._id} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                                                            <div>
                                                                <p className="font-bold text-slate-800 text-sm">{t.name}</p>
                                                                <p className="text-xs text-slate-500">{phaseLabels[t.phase as TaskPhase]} · {statusLabels[t.status]}</p>
                                                            </div>
                                                            <span className="text-xs font-bold text-red-600">Sin cambios hace {daysBetween(t.updatedAt, null)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </section>
                                        )}

                                        {/* 5. Trazabilidad */}
                                        <section className="grid grid-cols-3 gap-6">
                                            <div>
                                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block"/>
                                                    Datasets ({datasets.length})
                                                </h3>
                                                {datasets.length === 0
                                                    ? <p className="text-slate-400 text-xs">Sin datasets</p>
                                                    : datasets.map((d: any) => (
                                                        <div key={d._id} className="mb-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                                                            <p className="text-xs font-bold text-slate-800">{d.name}</p>
                                                            <p className="text-[11px] text-slate-500">{d.source}</p>
                                                            <p className="text-[11px] text-slate-400">{phaseLabels[d.phase as TaskPhase]}</p>
                                                        </div>
                                                    ))
                                                }
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                    <span className="w-2.5 h-2.5 rounded-full bg-fuchsia-500 inline-block"/>
                                                    Experimentos ({experiments.length})
                                                </h3>
                                                {experiments.length === 0
                                                    ? <p className="text-slate-400 text-xs">Sin experimentos</p>
                                                    : experiments.map((e: any) => (
                                                        <div key={e._id} className="mb-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                                                            <p className="text-xs font-bold text-slate-800">{e.name}</p>
                                                            <p className="text-[11px] text-slate-500">{e.algorithmModel} · {e.metric}: {e.result}</p>
                                                            <p className="text-[11px] text-slate-400">{phaseLabels[e.phase as TaskPhase]}</p>
                                                        </div>
                                                    ))
                                                }
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"/>
                                                    Decisiones ({decisions.length})
                                                </h3>
                                                {decisions.length === 0
                                                    ? <p className="text-slate-400 text-xs">Sin decisiones</p>
                                                    : decisions.map((d: any) => (
                                                        <div key={d._id} className="mb-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                                                            <p className="text-xs font-bold text-slate-800">{d.description}</p>
                                                            <p className="text-[11px] text-slate-400">{phaseLabels[d.phase as TaskPhase]}</p>
                                                        </div>
                                                    ))
                                                }
                                            </div>
                                        </section>

                                        {/* Footer */}
                                        <div className="border-t border-slate-200 pt-4 flex justify-between items-center">
                                            <p className="text-xs text-slate-400">ADN DATA · Administración y Control de Datos</p>
                                            <p className="text-xs text-slate-400">Generado con Pipeline CRISP-DM</p>
                                        </div>
                                    </div>
                                )}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}
