import { useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
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

function getSemaphoreColor(progress: number): string {
    if (progress >= 80) return '#10b981'
    if (progress >= 30) return '#f59e0b'
    return '#ef4444'
}

function parseMetric(result: string): number {
    const num = parseFloat(result)
    return isNaN(num) ? 0 : num
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
            
            const isMobile = window.innerWidth < 768
            const orientation = 'portrait'
            const pdf = new jsPDF({ orientation, unit: 'mm', format: 'a4' })
            const pageW = pdf.internal.pageSize.getWidth()
            const pageH = pdf.internal.pageSize.getHeight()
            
            if (isMobile) {
                const sections = reportRef.current.children as HTMLCollectionOf<HTMLElement>
                
                for (let i = 0; i < sections.length; i++) {
                    const section = sections[i]
                    const canvas = await html2canvas(section, {
                        scale: 2,
                        useCORS: true,
                        backgroundColor: '#ffffff',
                    })
                    
                    const imgData = canvas.toDataURL('image/png')
                    const imgW = canvas.width
                    const imgH = canvas.height
                    const ratio = pageW / imgW
                    const imgH_mm = imgH * ratio
                    
                    if (i > 0) pdf.addPage()
                    pdf.addImage(imgData, 'PNG', 0, 0, pageW, imgH_mm)
                }
            } else {
                const element = reportRef.current
                const originalOverflow = element.style.overflow
                const originalMaxHeight = element.style.maxHeight
                
                element.style.overflow = 'visible'
                element.style.maxHeight = 'none'
                
                const canvas = await html2canvas(element, {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: '#ffffff',
                })
                
                element.style.overflow = originalOverflow
                element.style.maxHeight = originalMaxHeight
                
                const imgW = canvas.width
                const imgH = canvas.height
                const ratio = pageW / imgW
                const pageHeightPx = pageH / ratio
                
                const totalPages = Math.ceil(imgH / pageHeightPx)
                
                for (let i = 0; i < totalPages; i++) {
                    if (i > 0) pdf.addPage()
                    
                    const sliceHeight = Math.min(pageHeightPx, imgH - (i * pageHeightPx))
                    
                    const tempCanvas = document.createElement('canvas')
                    tempCanvas.width = imgW
                    tempCanvas.height = sliceHeight
                    const ctx = tempCanvas.getContext('2d')!
                    ctx.fillStyle = '#ffffff'
                    ctx.fillRect(0, 0, imgW, sliceHeight)
                    ctx.drawImage(canvas, 0, i * pageHeightPx, imgW, sliceHeight, 0, 0, imgW, sliceHeight)
                    
                    const pageData = tempCanvas.toDataURL('image/png')
                    pdf.addImage(pageData, 'PNG', 0, 0, pageW, sliceHeight * ratio)
                }
            }
            
            pdf.save(`reporte-${project.projectName.replace(/\s+/g, '-')}.pdf`)
        } catch (e) {
            console.error(e)
        }
        setExporting(false)
    }

    const tasks       = data?.tasks ?? []
    const datasets    = data?.datasets ?? []
    const experiments = data?.experiments ?? []
    const decisions   = data?.decisions ?? []
    const stalledTasks = data?.stalledTasks ?? []

    // Trazabilidad por fase
    const traceabilityByPhase = phaseOrder.map(phase => ({
        phase,
        datasets: datasets.filter((d: any) => d.phase === phase).length,
        experiments: experiments.filter((e: any) => e.phase === phase).length,
        decisions: decisions.filter((d: any) => d.phase === phase).length,
    }))

    // Mejores experimentos (top 3)
    const topExperiments = [...experiments]
        .map((e: any) => ({ ...e, metricValue: parseMetric(e.result) }))
        .sort((a: any, b: any) => b.metricValue - a.metricValue)
        .slice(0, 3)



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
    const globalPct = phaseOrder.length
        ? Math.round(phaseOrder.reduce((acc, phase) => acc + calcPhaseProgress(tasks.filter((t: any) => t.phase === phase)), 0) / phaseOrder.length)
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
                            <Dialog.Panel className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl">

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
                                    <div ref={reportRef} className="bg-white p-3 sm:p-6 space-y-4 sm:space-y-6 max-h-[70vh] overflow-y-auto">
                                        <div className="border-b-2 border-cyan-500 pb-3 sm:pb-6">
                                            <div className="flex items-start justify-between flex-wrap gap-2 sm:gap-4">
                                                <div className="flex items-center gap-3">
                                                    <img 
                                                        src="/screen.png" 
                                                        alt="ADN DATA" 
                                                        className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
                                                    />
                                                    <div>
                                                        <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-cyan-600 mb-1">Reporte Ejecutivo · CRISP-DM</p>
                                                        <h1 className="text-lg sm:text-2xl font-black text-slate-900">{project.projectName}</h1>
                                                        <p className="text-slate-500 mt-1 text-xs sm:text-sm">{project.description}</p>
                                                        <p className="text-xs sm:text-sm text-slate-400 mt-1">Cliente: <span className="font-semibold text-slate-600">{project.clientName}</span></p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] sm:text-xs text-slate-400">Generado el</p>
                                                    <p className="text-xs sm:text-sm font-bold text-slate-700">{new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                                                    <div className="mt-1 sm:mt-2 inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-cyan-50 rounded-full">
                                                        <span className="text-lg sm:text-2xl font-black text-cyan-600">{globalPct}%</span>
                                                        <span className="text-[10px] sm:text-xs text-cyan-500 font-medium">avance</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Pipeline CRISP-DM Semáforo */}
                                        <section className="border border-slate-200 rounded-xl p-4 sm:p-6 mb-8">
                                            <h3 className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-cyan-500 inline-block"/>
                                                Pipeline CRISP-DM
                                            </h3>
                                            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4">
                                                {phaseOrder.map((phase) => {
                                                    const progress = calcPhaseProgress(tasks.filter((t: any) => t.phase === phase))
                                                    const semColor = getSemaphoreColor(progress)
                                                    const count = tasks.filter((t: any) => t.phase === phase).length
                                                    return (
                                                        <div key={phase} className="flex flex-col items-center">
                                                            <div 
                                                                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center border-2"
                                                                style={{ 
                                                                    backgroundColor: `${semColor}15`,
                                                                    borderColor: semColor,
                                                                }}
                                                            >
                                                                <span className="text-sm sm:text-base font-black" style={{ color: semColor }}>
                                                                    {progress}%
                                                                </span>
                                                            </div>
                                                            <span className="text-[9px] sm:text-[10px] text-slate-500 mt-1 text-center leading-tight">
                                                                {phaseLabels[phase]}
                                                            </span>
                                                            <span className="text-[8px] sm:text-[9px] text-slate-400">{count} tareas</span>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </section>

                                        {/* Trazabilidad por fase */}
                                        <section className="border border-slate-200 rounded-xl p-4 sm:p-6 mb-8">
                                            <h3 className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block"/>
                                                Trazabilidad por Fase
                                            </h3>
                                            <div className="space-y-2">
                                                {traceabilityByPhase.map((t) => {
                                                    const total = t.datasets + t.experiments + t.decisions
                                                    if (total === 0) return (
                                                        <div key={t.phase} className="flex items-center justify-between py-1">
                                                            <span className="text-xs text-slate-500">{phaseLabels[t.phase]}</span>
                                                            <span className="text-[10px] text-slate-400">Sin registros</span>
                                                        </div>
                                                    )
                                                    return (
                                                        <div key={t.phase} className="flex items-center justify-between py-1 border-b border-slate-100 last:border-0">
                                                            <span className="text-xs text-slate-600">{phaseLabels[t.phase]}</span>
                                                            <div className="flex gap-2">
                                                                {t.datasets > 0 && (
                                                                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                                                                        {t.datasets} Dataset{t.datasets > 1 ? 's' : ''}
                                                                    </span>
                                                                )}
                                                                {t.experiments > 0 && (
                                                                    <span className="text-[10px] px-2 py-0.5 rounded bg-purple-100 text-purple-700">
                                                                        {t.experiments} Experimento{t.experiments > 1 ? 's' : ''}
                                                                    </span>
                                                                )}
                                                                {t.decisions > 0 && (
                                                                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">
                                                                        {t.decisions} Decisión{t.decisions > 1 ? 'es' : ''}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </section>

                                        {/* Mejores experimentos */}
                                        {topExperiments.length > 0 && (
                                            <section className="border border-slate-200 rounded-xl p-4 sm:p-6 mb-8">
                                                <h3 className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-yellow-500 inline-block"/>
                                                    Mejores Experimentos
                                                </h3>
                                                <div className="space-y-2">
                                                    {topExperiments.map((e: any, i: number) => (
                                                        <div key={e._id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                                                            <div className="flex items-center gap-2">
                                                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                                                                    i === 0 ? 'bg-yellow-100 text-yellow-700' :
                                                                    i === 1 ? 'bg-slate-200 text-slate-600' :
                                                                    'bg-orange-100 text-orange-700'
                                                                }`}>
                                                                    {i + 1}
                                                                </span>
                                                                <div>
                                                                    <p className="text-xs sm:text-sm font-medium text-slate-800">{e.name}</p>
                                                                    <p className="text-[9px] sm:text-[10px] text-slate-500">{e.algorithmModel}</p>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-sm sm:text-base font-black text-cyan-600">{e.result}</p>
                                                                <p className="text-[9px] sm:text-[10px] text-slate-400">{e.metric}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </section>
                                        )}

                                        <div className="h-8 sm:h-12" />

                                        <section className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                                            <div>
                                                <h3 className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block"/>
                                                    Distribución por Estado
                                                </h3>
                                                {statusData.length === 0 ? (
                                                    <p className="text-slate-400 text-xs">Sin tareas</p>
                                                ) : (
                                                    <ResponsiveContainer width="100%" height={140} className="sm:!h-[160px]">
                                                        <PieChart>
                                                            <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={50} className="sm:!outer-radius-[60px]" label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                                                {statusData.map((_, i) => <Cell key={i} fill={statusData[i].color} />)}
                                                            </Pie>
                                                            <Tooltip />
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"/>
                                                    Tareas por Colaborador
                                                </h3>
                                                {collaboratorData.length === 0 ? (
                                                    <p className="text-slate-400 text-xs">Sin colaboradores</p>
                                                ) : (
                                                    <ul className="space-y-2">
                                                        {collaboratorData.slice(0, 3).map((c, i) => (
                                                            <li key={i} className="flex items-center justify-between">
                                                                <span className="text-xs text-slate-600">{c.name}</span>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-16 sm:w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                                                                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${c.total > 0 ? Math.round((c.completed / c.total) * 100) : 0}%` }} />
                                                                    </div>
                                                                    <span className="text-[10px] sm:text-xs text-slate-400">{c.total > 0 ? Math.round((c.completed / c.total) * 100) : 0}%</span>
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        </section>
                                        {stalledTasks.length > 0 && (
                                            <section className="border-t border-slate-200 pt-4 sm:pt-6">
                                                <h3 className="text-xs sm:text-sm font-black text-amber-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"/>
                                                    Tareas Detenidas ({stalledTasks.length})
                                                </h3>
                                                <ul className="space-y-2">
                                                    {stalledTasks.slice(0, 5).map(t => (
                                                        <li key={t._id} className="flex items-center justify-between p-2 sm:p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                                            <span className="text-xs sm:text-sm font-medium text-slate-800">{t.name}</span>
                                                            <span className="text-[10px] sm:text-xs text-amber-600">{phaseLabels[t.phase as TaskPhase]}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </section>
                                        )}
                                        <div className="border-t border-slate-200 pt-2 sm:pt-4 flex justify-between items-center flex-wrap gap-2">
                                            <p className="text-[10px] sm:text-xs text-slate-400">ADN DATA · Administración y Control de Datos</p>
                                            <p className="text-[10px] sm:text-xs text-slate-400">Generado con Pipeline CRISP-DM</p>
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
