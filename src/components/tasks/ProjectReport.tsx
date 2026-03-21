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

export default function ProjectReport({ project, show, onClose }: Props) {
    const reportRef = useRef<HTMLDivElement>(null)
    const reportPDFRef = useRef<HTMLDivElement>(null)
    const [exporting, setExporting] = useState(false)

    const { data, isLoading } = useQuery({
        queryKey: ['report', project._id],
        queryFn: () => getProjectReport(project._id),
        enabled: show,
    })

    const exportPDF = async () => {
        const elementToCapture = reportPDFRef.current || reportRef.current
        if (!elementToCapture) return
        setExporting(true)
        try {
            const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
                import('jspdf'),
                import('html2canvas'),
            ])
            const canvas = await html2canvas(elementToCapture, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
                windowWidth: 1200,
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
                            <Dialog.Panel className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden">

                                {/* Toolbar */}
                                <div className="flex items-center justify-between gap-3 px-6 py-4 bg-slate-50 border-b border-slate-200">
                                    <h2 className="text-base sm:text-lg font-bold text-slate-800">Reporte del Proyecto</h2>
                                    <div className="flex gap-2 sm:gap-3">
                                        <button
                                            onClick={exportPDF}
                                            disabled={exporting || isLoading}
                                            className="px-3 sm:px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs sm:text-sm font-bold rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            {exporting ? 'Exportando...' : 'Exportar PDF'}
                                        </button>
                                        <button onClick={onClose} className="px-3 sm:px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs sm:text-sm font-bold rounded-lg transition-colors">
                                            Cerrar
                                        </button>
                                    </div>
                                </div>

                                {isLoading ? (
                                    <div className="flex items-center justify-center h-64">
                                        <p className="text-slate-400 animate-pulse">Generando reporte...</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="hidden sm:block">
                                            <div ref={reportPDFRef} className="hidden bg-white p-6 space-y-6" style={{ width: '1100px' }}>
                                                <div className="border-b-2 border-cyan-500 pb-6">
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <p className="text-xs font-bold uppercase tracking-widest text-cyan-600 mb-1">Reporte Ejecutivo · CRISP-DM</p>
                                                            <h1 className="text-2xl font-black text-slate-900">{project.projectName}</h1>
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
                                                <section className="grid grid-cols-2 gap-8">
                                                    <div>
                                                        <h3 className="text-base font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                                                            <span className="w-3 h-3 rounded-full bg-indigo-500 inline-block"/>
                                                            Distribución por Estado
                                                        </h3>
                                                        {statusData.length === 0 ? (
                                                            <p className="text-slate-400 text-sm">Sin tareas</p>
                                                        ) : (
                                                            <ResponsiveContainer width="100%" height={200}>
                                                                <PieChart>
                                                                    <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                                                        {statusData.map((_, i) => <Cell key={i} fill={statusData[i].color} />)}
                                                                    </Pie>
                                                                    <Tooltip />
                                                                </PieChart>
                                                            </ResponsiveContainer>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-base font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                                                            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"/>
                                                            Tareas por Colaborador
                                                        </h3>
                                                        {collaboratorData.length === 0 ? (
                                                            <p className="text-slate-400 text-sm">Sin colaboradores</p>
                                                        ) : (
                                                            <ul className="space-y-2">
                                                                {collaboratorData.slice(0, 5).map((c, i) => (
                                                                    <li key={i} className="flex items-center justify-between">
                                                                        <span className="text-sm text-slate-600">{c.name}</span>
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                                                                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${c.total > 0 ? Math.round((c.completed / c.total) * 100) : 0}%` }} />
                                                                            </div>
                                                                            <span className="text-xs text-slate-400">{c.total > 0 ? Math.round((c.completed / c.total) * 100) : 0}%</span>
                                                                        </div>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </div>
                                                </section>
                                                {stalledTasks.length > 0 && (
                                                    <section className="border-t border-slate-200 pt-6">
                                                        <h3 className="text-base font-black text-amber-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"/>
                                                            Tareas Detenidas ({stalledTasks.length})
                                                        </h3>
                                                        <ul className="space-y-2">
                                                            {stalledTasks.map(t => (
                                                                <li key={t._id} className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                                                    <span className="text-sm font-medium text-slate-800">{t.name}</span>
                                                                    <span className="text-xs text-amber-600">{phaseLabels[t.phase as TaskPhase]}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </section>
                                                )}
                                                <div className="border-t border-slate-200 pt-4 flex justify-between items-center">
                                                    <p className="text-xs text-slate-400">ADN DATA · Administración y Control de Datos</p>
                                                    <p className="text-xs text-slate-400">Generado con Pipeline CRISP-DM</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div ref={reportRef} className="sm:hidden bg-white p-4 space-y-4">
                                            <div className="border-b-2 border-cyan-500 pb-4">
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-600 mb-1">Reporte Ejecutivo · CRISP-DM</p>
                                                <h1 className="text-xl font-black text-slate-900">{project.projectName}</h1>
                                                <p className="text-slate-500 mt-1 text-sm">{project.description}</p>
                                                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-cyan-50 rounded-full">
                                                    <span className="text-lg font-black text-cyan-600">{globalPct}%</span>
                                                    <span className="text-xs text-cyan-500 font-medium">avance</span>
                                                </div>
                                            </div>
                                            <ResponsiveContainer width="100%" height={180}>
                                                <BarChart data={phaseProgressData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                                                    <XAxis dataKey="name" tick={{ fontSize: 8, fill: '#64748b' }} />
                                                    <YAxis domain={[0, 100]} tick={{ fontSize: 8, fill: '#64748b' }} unit="%" />
                                                    <Tooltip formatter={(v) => [`${v}%`, 'Progreso']} />
                                                    <Bar dataKey="progreso" radius={[4, 4, 0, 0]}>
                                                        {phaseProgressData.map((entry, i) => (
                                                            <Cell key={i} fill={entry.color} />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                            <div className="flex flex-wrap gap-2">
                                                {statusData.map((d, i) => (
                                                    <span key={i} className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: d.color + '20', color: d.color }}>
                                                        {d.name}: {d.value}
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="border-t border-slate-200 pt-4 flex justify-between">
                                                <p className="text-[10px] text-slate-400">ADN DATA</p>
                                                <p className="text-[10px] text-slate-400">CRISP-DM</p>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}
