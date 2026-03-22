import { Fragment, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { getTaskById, updateStatus, updateTask } from '@/api/TaskAPI'
import { formatDate } from '@/utils/utils'
import { TaskStatus, TaskFormData, TeamMember } from '@/types/index'
import { statusTranslations } from '@/locales/es'
import NotesPanel from '../notes/NotesPanel'

const phaseLabels: Record<string, string> = {
    business: 'Business',
    data_understanding: 'Data Und.',
    data_preparation: 'Data Prep.',
    modeling: 'Modeling',
    evaluation: 'Evaluation',
    deployment: 'Deployment',
}

const priorityLabels: Record<string, { label: string; color: string }> = {
    high: { label: 'Alta', color: 'text-red-400 bg-red-500/20 border-red-500/30' },
    medium: { label: 'Media', color: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30' },
    low: { label: 'Baja', color: 'text-green-400 bg-green-500/20 border-green-500/30' },
}

export default function TaskDetailsModal() {
    const params = useParams()
    const projectId = params.projectId!
    const navigate = useNavigate()
    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const taskId = queryParams.get('viewTask')

    const queryClient = useQueryClient()

    const { data: task, isError } = useQuery({
        queryKey: ['task', taskId],
        queryFn: () => getTaskById({ projectId, taskId: taskId! }),
        enabled: !!taskId,
        retry: false
    })

    const { register, reset, handleSubmit } = useForm<TaskFormData>({
        defaultValues: {
            name: '',
            description: ''
        }
    })

    // Reset form when task data is loaded
    useEffect(() => {
        if (task) {
            reset({
                name: task.name || '',
                description: task.description || ''
            })
        }
    }, [task, reset])

    const { mutate: mutateStatus, isPending: isStatusPending } = useMutation({
        mutationFn: ({ status }: { status: TaskStatus }) => updateStatus({ projectId, taskId: taskId!, status }),
        onError: (error) => toast.error(error.message),
        onSuccess: (data) => {
            toast.success(data)
            queryClient.invalidateQueries({ queryKey: ['project', projectId] })
            queryClient.invalidateQueries({ queryKey: ['task', taskId] })
        }
    })

    const { mutate: mutateTask, isPending: isTaskPending } = useMutation({
        mutationFn: (formData: TaskFormData) => updateTask({ projectId, taskId: taskId!, formData }),
        onError: (error) => toast.error(error.message),
        onSuccess: (data) => {
            toast.success(data)
            queryClient.invalidateQueries({ queryKey: ['project', projectId] })
            queryClient.invalidateQueries({ queryKey: ['task', taskId] })
            reset()
        }
    })

    if (isError || !taskId) return null

    if (!task) return (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-950/80">
            <p className="text-slate-400 animate-pulse">Cargando...</p>
        </div>
    )

    const handleEditTask = (formData: TaskFormData) => {
        mutateTask(formData)
    }

    const assignedTo = task.assignedTo && typeof task.assignedTo === 'object' 
        ? (task.assignedTo as TeamMember) 
        : null

    const deadline = task.deadline ? new Date(task.deadline) : null
    const isOverdue = deadline && deadline < new Date() && task.status !== 'completed'
    const daysUntil = deadline ? Math.ceil((deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null

    return (
        <Transition appear show={true} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={() => navigate(location.pathname, { replace: true })}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-4xl transform rounded-3xl bg-[#0f172a] border border-slate-700 text-left align-middle shadow-2xl transition-all max-h-[90vh] overflow-y-auto">
                                
                                {/* Header */}
                                <div className="sticky top-0 bg-[#0f172a] border-b border-slate-800 p-6 z-10">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <Dialog.Title className="font-black text-2xl sm:text-3xl text-white tracking-tight">
                                                {task.name}
                                            </Dialog.Title>
                                            <p className='text-cyan-500 font-mono text-xs uppercase tracking-widest mt-2'>ID: {taskId.slice(-8)}</p>
                                        </div>
                                        <button 
                                            onClick={() => navigate(location.pathname, { replace: true })}
                                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-sm transition-colors"
                                        >
                                            Cerrar
                                        </button>
                                    </div>
                                </div>

                                <div className="p-6 space-y-6">
                                    {/* Info Cards */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        {/* Fase */}
                                        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                                            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Fase</p>
                                            <p className="text-sm font-bold text-white">{phaseLabels[task.phase] || task.phase}</p>
                                        </div>

                                        {/* Prioridad */}
                                        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                                            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Prioridad</p>
                                            {task.priority ? (
                                                <span className={`inline-block text-xs font-bold px-2 py-1 rounded border ${priorityLabels[task.priority].color}`}>
                                                    {priorityLabels[task.priority].label}
                                                </span>
                                            ) : (
                                                <p className="text-sm text-slate-500">Sin definir</p>
                                            )}
                                        </div>

                                        {/* Deadline */}
                                        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                                            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Fecha Límite</p>
                                            {deadline ? (
                                                <p className={`text-sm font-bold ${isOverdue ? 'text-red-400' : 'text-white'}`}>
                                                    {formatDate(deadline.toISOString())}
                                                    {daysUntil !== null && daysUntil >= 0 && !isOverdue && (
                                                        <span className="text-[10px] ml-1 text-slate-400">
                                                            ({daysUntil === 0 ? 'Hoy' : daysUntil === 1 ? 'Mañana' : `${daysUntil}d`})
                                                        </span>
                                                    )}
                                                </p>
                                            ) : (
                                                <p className="text-sm text-slate-500">Sin definir</p>
                                            )}
                                        </div>

                                        {/* Horas */}
                                        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                                            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Horas Est.</p>
                                            {task.estimatedHours ? (
                                                <p className="text-sm font-bold text-white">{task.estimatedHours}h</p>
                                            ) : (
                                                <p className="text-sm text-slate-500">Sin definir</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Asignado */}
                                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                                        <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">Asignado a</p>
                                        {assignedTo ? (
                                            <p className="text-white font-medium">{assignedTo.name}</p>
                                        ) : (
                                            <p className="text-amber-400 text-sm font-medium">Sin asignar</p>
                                        )}
                                    </div>

                                    {/* Descripción */}
                                    <div>
                                        <h4 className="text-slate-400 font-bold uppercase text-xs tracking-widest mb-3">Descripción</h4>
                                        <p className='text-lg text-slate-300 leading-relaxed bg-slate-800/50 p-6 rounded-2xl border border-slate-800'>
                                            {task.description}
                                        </p>
                                    </div>

                                    {/* Editar Nombre y Descripción */}
                                    <div>
                                        <h4 className="text-slate-400 font-bold uppercase text-xs tracking-widest mb-3">Editar Tarea</h4>
                                        <form onSubmit={handleSubmit(handleEditTask)} className="space-y-4">
                                            <div>
                                                <label className="block text-[10px] text-slate-500 uppercase tracking-widest mb-1">Nombre</label>
                                                <input
                                                    type="text"
                                                    {...register('name')}
                                                    className="w-full p-3 bg-[#0f172a] border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] text-slate-500 uppercase tracking-widest mb-1">Descripción</label>
                                                <textarea
                                                    {...register('description')}
                                                    rows={3}
                                                    className="w-full p-3 bg-[#0f172a] border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40 resize-none"
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={isTaskPending}
                                                className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors uppercase text-sm tracking-widest"
                                            >
                                                {isTaskPending ? 'Guardando...' : 'Guardar Cambios'}
                                            </button>
                                        </form>
                                    </div>

                                    {/* Control de Estado */}
                                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                                        <label className="block text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mb-3">Control de Estado</label>
                                        <select
                                            className='w-full p-3 bg-[#0f172a] border border-slate-700 rounded-xl text-white font-bold focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all cursor-pointer'
                                            defaultValue={task.status}
                                            onChange={(e) => mutateStatus({ status: e.target.value as TaskStatus })}
                                            disabled={isStatusPending}
                                        >
                                            {Object.entries(statusTranslations).map(([key, value]) => (
                                                <option key={key} value={key} className="bg-[#0f172a]">{value}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Historial */}
                                    {task.completedBy && task.completedBy.length > 0 && (
                                        <div>
                                            <h4 className="text-slate-400 font-bold uppercase text-xs tracking-widest mb-3">Historial</h4>
                                            <ul className='space-y-2 bg-[#0a0f1d] p-4 rounded-xl border border-slate-800 font-mono text-sm max-h-48 overflow-y-auto'>
                                                {task.completedBy.map((activityLog: any, i: number) => (
                                                    <li key={i} className="text-slate-400 py-1 border-b border-white/5 last:border-0">
                                                        <span className='text-cyan-500'>[STATUS]</span>{' '}
                                                        <span className='font-bold text-slate-200 uppercase'>
                                                            {statusTranslations[activityLog.status]}
                                                        </span>
                                                        <span className="mx-2 text-slate-600">|</span>
                                                        <span>USER: {activityLog.user?.name || 'Unknown'}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Notas */}
                                    <div>
                                        <NotesPanel notes={task.notes || []} />
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}
