import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { reassignTask } from '@/api/TaskAPI'
import { getProjectTeam } from '@/api/TeamAPI'
import { TaskProject, TeamMember } from '@/types/index'
import { toast } from 'react-toastify'

type ReassignTaskModalProps = {
    isOpen: boolean
    onClose: () => void
    task: TaskProject
    projectId: string
}

export default function ReassignTaskModal({ isOpen, onClose, task, projectId }: ReassignTaskModalProps) {
    const queryClient = useQueryClient()
    
    const { data: team = [] } = useQuery({
        queryKey: ['projectTeam', projectId],
        queryFn: () => getProjectTeam(projectId),
        enabled: isOpen
    })

    const { mutate, isPending } = useMutation({
        mutationFn: (assignedTo: string | null) => 
            reassignTask({ projectId, taskId: task._id, assignedTo }),
        onError: (error) => toast.error(error.message),
        onSuccess: (data: any) => {
            toast.success(data.message || 'Tarea reasignada correctamente')
            queryClient.invalidateQueries({ queryKey: ['project', projectId] })
            onClose()
        }
    })

    const currentAssignedTo = task.assignedTo && typeof task.assignedTo === 'object' 
        ? (task.assignedTo as TeamMember)._id 
        : ''

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
                    leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-lg transform rounded-2xl bg-[#1e293b] text-left align-middle shadow-2xl transition-all border border-slate-700 p-6 max-h-[90vh] overflow-y-auto">
                                <Dialog.Title as="h3" className="font-black text-2xl text-white tracking-tight">
                                    Reasignar <span className="text-cyan-500">Tarea</span>
                                </Dialog.Title>
                                
                                <p className="text-sm text-slate-400 mt-2 mb-6">
                                    Selecciona un colaborador o desasigna la tarea
                                </p>

                                <div className="mb-4">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Tarea</p>
                                    <p className="text-white font-medium">{task.name}</p>
                                </div>

                                <div className="mb-6">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 block">
                                        Seleccionar Colaborador
                                    </label>
                                    <select
                                        className="w-full p-4 bg-[#0f172a] border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition-all cursor-pointer"
                                        value={currentAssignedTo}
                                        onChange={(e) => {
                                            const value = e.target.value
                                            mutate(value || null)
                                        }}
                                        disabled={isPending}
                                    >
                                        <option value="" className="bg-[#0f172a] text-slate-500">— Sin asignar —</option>
                                        {team.map(member => (
                                            <option key={member._id} value={member._id} className="bg-[#0f172a]">
                                                {member.name} · {member.email}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => mutate(null)}
                                        disabled={isPending}
                                        className="flex-1 px-4 py-3 bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-500/30 rounded-xl font-bold text-sm uppercase tracking-wider transition-colors disabled:opacity-50"
                                    >
                                        Desasignar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold text-sm uppercase tracking-wider transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}
