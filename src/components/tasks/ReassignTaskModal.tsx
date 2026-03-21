import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { reassignTask } from '@/api/TaskAPI'
import { TaskProject } from '@/types/index'
import UserAutocomplete from '../team/UserAutocomplete'
import { toast } from 'react-toastify'

type ReassignTaskModalProps = {
    isOpen: boolean
    onClose: () => void
    task: TaskProject
    projectId: string
}

export default function ReassignTaskModal({ isOpen, onClose, task, projectId }: ReassignTaskModalProps) {
    const queryClient = useQueryClient()
    
    const { mutate, isPending } = useMutation({
        mutationFn: (assignedTo: string | null) => 
            reassignTask({ projectId, taskId: task._id, assignedTo }),
        onError: (error) => toast.error(error.message),
        onSuccess: (data) => {
            toast.success(data)
            queryClient.invalidateQueries({ queryKey: ['project', projectId] })
            onClose()
        }
    })

    const handleReassign = (assignedTo: string) => {
        mutate(assignedTo || null)
    }

    const handleUnassign = () => {
        mutate(null)
    }

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
                            <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-[#1e293b] text-left align-middle shadow-2xl transition-all border border-slate-700 p-6">
                                <Dialog.Title as="h3" className="font-black text-2xl text-white tracking-tight">
                                    Reasignar <span className="text-cyan-500">Tarea</span>
                                </Dialog.Title>
                                
                                <p className="text-sm text-slate-400 mt-2 mb-6">
                                    Asigna esta tarea a otro colaborador o desasígnala
                                </p>

                                <div className="mb-4">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Tarea</p>
                                    <p className="text-white font-medium">{task.name}</p>
                                </div>

                                <div className="mb-6">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Buscar Colaborador</p>
                                    <UserAutocomplete
                                        value=""
                                        onChange={handleReassign}
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={handleUnassign}
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
