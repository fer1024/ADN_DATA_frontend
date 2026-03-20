import { useState } from 'react'
import { DndContext, DragEndEvent, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import { Project, TaskProject, TaskStatus, TaskPhase } from "@/types/index"
import TaskCard from "./TaskCard"
import DropTask from "./DropTask"
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateStatus, toggleTaskCompleted } from '@/api/TaskAPI'
import TraceabilityPanel from './TraceabilityPanel'
import { toast } from 'react-toastify'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

type TaskListProps = {
    tasks: TaskProject[]
    canEdit: boolean
}

type GroupedTasks = { [key: string]: TaskProject[] }

type PhaseDef = {
    num: string
    label: string
    desc: string
    accentColor: string
    phase: TaskPhase
}

const phaseDefs: Record<TaskPhase, PhaseDef> = {
    business:          { num: '01', label: 'Business Understanding', desc: 'Objetivos, alcance y plan',          accentColor: '#888780', phase: 'business' },
    data_understanding:{ num: '02', label: 'Data Understanding',     desc: 'Exploración y calidad de datos',     accentColor: '#534AB7', phase: 'data_understanding' },
    data_preparation:  { num: '03', label: 'Data Preparation',       desc: 'Limpieza, ETL y feature engineering',accentColor: '#0F6E56', phase: 'data_preparation' },
    modeling:          { num: '04', label: 'Modeling',               desc: 'Entrenamiento y ajuste de modelos',  accentColor: '#993556', phase: 'modeling' },
    evaluation:        { num: '05', label: 'Evaluation',             desc: 'Validación y criterios de éxito',    accentColor: '#BA7517', phase: 'evaluation' },
    deployment:        { num: '06', label: 'Deployment',             desc: 'Despliegue, monitoreo y reporte',    accentColor: '#185FA5', phase: 'deployment' },
}

const phaseOrder: TaskPhase[] = ['business', 'data_understanding', 'data_preparation', 'modeling', 'evaluation', 'deployment']

const kanbanStatusLabels: Record<TaskStatus, { label: string; style: string }> = {
    pending:     { label: 'Pendiente',    style: 'border-t-slate-500 bg-slate-500/10 text-slate-400' },
    onHold:      { label: 'En Espera',    style: 'border-t-indigo-500 bg-indigo-500/10 text-indigo-400' },
    inProgress:  { label: 'En Progreso',  style: 'border-t-cyan-500 bg-cyan-500/10 text-cyan-400' },
    underReview: { label: 'En Revisión',  style: 'border-t-fuchsia-500 bg-fuchsia-500/10 text-fuchsia-400' },
    completed:   { label: 'Completado',   style: 'border-t-emerald-500 bg-emerald-500/10 text-emerald-400' },
}

const kanbanOrder: TaskStatus[] = ['pending', 'onHold', 'inProgress', 'underReview', 'completed']

const initialStatusGroups: GroupedTasks = {
    pending: [], onHold: [], inProgress: [], underReview: [], completed: [],
}

// Valor de progreso por status (0-100)
const statusWeight: Record<TaskStatus, number> = {
    pending:     0,
    onHold:      25,
    inProgress:  50,
    underReview: 75,
    completed:   100,
}

// Calcula el progreso de una lista de tareas (0-100)
function calcPhaseProgress(phaseTasks: TaskProject[]): number {
    if (phaseTasks.length === 0) return 0
    const sum = phaseTasks.reduce((acc, t) => acc + statusWeight[t.status], 0)
    return Math.round(sum / phaseTasks.length)
}

// Sub-componente: tarjeta de fase
type PhaseCardProps = {
    def: PhaseDef
    phaseTasks: TaskProject[]
    isActive: boolean
    onSelect: () => void
    onToggle: (taskId: string) => void
    projectId: string
}

function PhaseCard({ def, phaseTasks, isActive, onSelect, onToggle, projectId }: PhaseCardProps) {
    const total = phaseTasks.length
    const pct = calcPhaseProgress(phaseTasks)

    const badge =
        pct === 100 && total > 0
            ? { label: 'Completada',  bg: 'bg-emerald-900/30', text: 'text-emerald-400', dot: 'bg-emerald-400' }
            : pct > 0
            ? { label: 'En progreso', bg: 'bg-blue-900/30',    text: 'text-blue-400',    dot: 'bg-blue-400' }
            : { label: 'Sin iniciar', bg: 'bg-slate-800/60',   text: 'text-slate-500',   dot: 'bg-slate-600' }

    return (
        <motion.div
            layout
            layoutId={`phase-card-${def.phase}`}
            onClick={onSelect}
            transition={{ type: "spring", stiffness: 50, damping: 20, mass: 1 }}
            className={`flex flex-col bg-[#0f172a] border rounded-2xl overflow-hidden cursor-pointer ${
                isActive
                    ? 'border-cyan-500 shadow-xl shadow-cyan-900/30'
                    : 'border-slate-700/60 hover:border-slate-600'
            }`}
            
        >
            <div className="h-1 w-full flex-shrink-0" style={{ background: def.accentColor }} />

            <div className={`p-5 flex-1 flex flex-col ${isActive ? 'gap-5' : 'gap-3'}`}>

                {/* Número + título */}
                <div>
                    <motion.p layout className="text-xs font-black tracking-[0.2em] mb-1" style={{ color: def.accentColor }}>
                        FASE {def.num}
                    </motion.p>
                    <motion.h4 layout className={`font-black text-white leading-snug ${isActive ? 'text-xl' : 'text-sm'}`}>
                        {def.label}
                    </motion.h4>
                    <motion.p layout className={`text-slate-500 mt-1 ${isActive ? 'text-sm' : 'text-xs'}`}>
                        {def.desc}
                    </motion.p>
                </div>

                {/* Porcentaje */}
                <div className="flex items-end justify-between">
                    <motion.span
                        layout
                        className="font-black tabular-nums leading-none"
                        style={{ color: def.accentColor, fontSize: isActive ? '1.8rem' : '2rem' }}
                    >
                        {pct}%
                    </motion.span>
                    <span className="text-slate-500 font-mono pb-1 text-xs">
                        {total} tarea{total !== 1 ? 's' : ''}
                    </span>
                </div>

                {/* Barra progreso */}
                <div className={`bg-slate-800 rounded-full overflow-hidden ${isActive ? 'h-3' : 'h-1.5'}`}>
                    <motion.div
                        className="h-full rounded-full"
                        style={{ background: def.accentColor }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
                    />
                </div>

                {/* Badge */}
                <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1.5 font-medium rounded-lg px-2.5 py-1 ${isActive ? 'text-sm' : 'text-xs'} ${badge.bg} ${badge.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                        {badge.label}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                        {phaseTasks.filter(t => t.completed).length}/{total}
                    </span>
                </div>

                {/* Layout expandido: tareas arriba + trazabilidad abajo */}
                <AnimatePresence>
                    {isActive && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.6, ease: 'easeInOut', delayChildren: 0.1 }}
                            className="border-t border-slate-800 pt-4 space-y-4 overflow-hidden"
                        >
                            {/* Tareas */}
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2" style={{ color: def.accentColor }}>
                                    Tareas
                                </p>
                                {total === 0 ? (
                                    <p className="text-slate-500 text-xs">Sin tareas en esta fase</p>
                                ) : (
                                    <ul className="space-y-2">
                                        {phaseTasks.map(task => (
                                            <li key={task._id} className="flex items-start gap-2" onClick={e => e.stopPropagation()}>
                                                <button
                                                    onClick={() => onToggle(task._id)}
                                                    className={`mt-0.5 w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
                                                        task.completed ? 'border-emerald-500 bg-emerald-500' : 'border-slate-600 hover:border-slate-400'
                                                    }`}
                                                >
                                                    {task.completed && (
                                                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 10">
                                                            <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                        </svg>
                                                    )}
                                                </button>
                                                <div>
                                                    <p className={`text-sm font-medium ${task.completed ? 'text-slate-500 line-through' : 'text-white'}`}>
                                                        {task.name}
                                                    </p>
                                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                                        {kanbanStatusLabels[task.status].label}
                                                        {task.assignedTo && typeof task.assignedTo === 'object'
                                                            ? ` · ${task.assignedTo.name}` : ''}
                                                    </p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            {/* Trazabilidad — separada por línea */}
                            <div className="border-t border-slate-800 pt-4">
                                <TraceabilityPanel
                                    projectId={projectId}
                                    phase={def.phase}
                                    accentColor={def.accentColor}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    )
}


// Componente principal
export default function TaskList({ tasks, canEdit }: TaskListProps) {
    const params = useParams()
    const projectId = params.projectId!
    const queryClient = useQueryClient()

    // Fase activa seleccionada para el Kanban interno
    const [activePhase, setActivePhase] = useState<TaskPhase | null>(null)

    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
    )

    const { mutate: mutateStatus } = useMutation({
        mutationFn: updateStatus,
        onError: (error) => toast.error(error.message),
        onSuccess: (data) => {
            toast.success(data as string)
            queryClient.invalidateQueries({ queryKey: ['project', projectId] })
            queryClient.invalidateQueries({ queryKey: ['report', projectId] })
        }
    })

    const { mutate: mutateToggle } = useMutation({
        mutationFn: toggleTaskCompleted,
        onError: (error) => toast.error(error.message),
        onSuccess: (data) => {
            toast.success(data as string)
            queryClient.invalidateQueries({ queryKey: ['project', projectId] })
            queryClient.invalidateQueries({ queryKey: ['report', projectId] })
        }
    })

    const handleToggleCompleted = (taskId: string) => {
        mutateToggle({ projectId, taskId })
        queryClient.setQueryData(['project', projectId], (prev: Project) => ({
            ...prev,
            tasks: prev.tasks.map(t => t._id === taskId ? { ...t, completed: !t.completed } : t)
        }))
    }

    // Agrupar tareas por fase para las tarjetas
    const phaseTaskMap = phaseOrder.reduce((acc, phase) => {
        acc[phase] = tasks.filter(t => t.phase === phase)
        return acc
    }, {} as Record<TaskPhase, TaskProject[]>)

    // Agrupar tareas de la fase activa por status para el Kanban
    const activeTasksGrouped = (activePhase ? phaseTaskMap[activePhase] ?? [] : []).reduce((acc, task) => {
        const group = acc[task.status] ? [...acc[task.status]] : []
        return { ...acc, [task.status]: [...group, task] }
    }, initialStatusGroups)

    const handleDragEnd = (e: DragEndEvent) => {
        const { over, active } = e
        if (!over) return
        const taskId = active.id.toString()
        const overId = over.id.toString()
        // Drop en columna de status del Kanban
        if (kanbanOrder.includes(overId as TaskStatus)) {
            const status = overId as TaskStatus
            mutateStatus({ projectId, taskId, status })
            queryClient.setQueryData(['project', projectId], (prev: Project) => ({
                ...prev,
                tasks: prev.tasks.map(t => t._id === taskId ? { ...t, status } : t)
            }))
        }
    }


    return (
        <div className="space-y-10">

            {/* Header */}
            <header>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-black tracking-tight">
                    Pipeline <span className="text-cyan-500 sm:text-5xl lg:text-6xl">CRISP-DM</span>
                </h2>
                <p className="text-slate-400 text-base sm:text-lg lg:text-xl font-light mt-2 italic">
                    Flujo de trabajo para Ingeniería en Ciencia de Datos
                </p>
            </header>

            <DndContext sensors={sensors} onDragEnd={handleDragEnd}>

                {/* Fases del pipeline */}
                <section>
                    <p className="text-slate-600 text-xs font-mono uppercase tracking-[0.2em] mb-4">
                        Fases del pipeline — selecciona una para ver su Kanban
                    </p>

                    {/* Tarjetas de fases */}
                    <div className="flex flex-col lg:flex-row gap-3 items-stretch overflow-x-auto pb-4">
                        {phaseOrder.map(phase => {
                            const isActive = activePhase === phase && phaseTaskMap[phase].length > 0
                            return (
                                <motion.div
                                    key={phase}
                                    layout
                                    animate={{ flex: isActive ? 3 : 1 }}
                                    transition={{ type: "spring", stiffness: 50, damping: 20, mass: 1 }}
                                    className="min-w-[140px] sm:min-w-0"
                                >
                                    <PhaseCard
                                        def={phaseDefs[phase]}
                                        phaseTasks={phaseTaskMap[phase]}
                                        isActive={isActive}
                                        onSelect={() => phaseTaskMap[phase].length > 0 ? setActivePhase(isActive ? null : phase) : null}
                                        onToggle={handleToggleCompleted}
                                        projectId={projectId}
                                    />
                                </motion.div>
                            )
                        })}
                    </div>
                </section>

                {/* Kanban interno — en móvil debajo de la fase activa, en desktop separado abajo */}
                {activePhase && phaseTaskMap[activePhase].length > 0 && (
                    <section className="mt-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-4 w-1 rounded-full" style={{ background: phaseDefs[activePhase!].accentColor }} />
                            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">
                                {phaseDefs[activePhase!].label} — estado de tareas
                            </p>
                        </div>

                        {/* Kanban: en fila horizontal con scroll */}
                        <div className="flex gap-3 overflow-x-auto pb-20 scrollbar-thin scrollbar-thumb-cyan-900 scrollbar-track-transparent">
                            {kanbanOrder.map(status => (
                                <div key={status} className="min-w-[280px] flex flex-col">
                                    <div className={`p-4 border-x border-t-4 border-slate-800 rounded-t-2xl shadow-2xl ${kanbanStatusLabels[status].style}`}>
                                        <h3 className="text-xs font-black tracking-[0.2em]">
                                            {kanbanStatusLabels[status].label}
                                        </h3>
                                    </div>
                                    <div className="bg-[#0f172a] border-x border-b border-slate-700/50 rounded-b-2xl p-4 flex-1 min-h-[500px] shadow-lg">
                                        <DropTask status={status} />
                                        <ul className="mt-6 space-y-4">
                                            {activeTasksGrouped[status].length === 0 ? (
                                                <li className="text-slate-600 text-center py-16 border-2 border-dashed border-slate-800 rounded-2xl text-xs">Sin tareas</li>
                                            ) : (
                                                activeTasksGrouped[status].map(task => (
                                                    <TaskCard key={task._id} task={task} canEdit={canEdit} />
                                                ))
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
                </DndContext>
        </div>
    )
}