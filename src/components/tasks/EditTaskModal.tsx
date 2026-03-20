import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Task, TaskFormData } from '@/types/index';
import { useForm } from 'react-hook-form';
import TaskForm from './TaskForm';
import { updateTask } from '@/api/TaskAPI';
import { toast } from 'react-toastify';

type EditTaskModalProps = {
    data: Task
    taskId: Task['_id']
}

export default function EditTaskModal({data, taskId} : EditTaskModalProps) {
    const navigate = useNavigate()
    const params = useParams()
    const projectId = params.projectId!

    const { register, handleSubmit, reset, formState: {errors} } = useForm<TaskFormData>({
        defaultValues: {
            name: data.name,
            description: data.description
        }
    })

    const queryClient = useQueryClient()
    const { mutate } = useMutation({
        mutationFn: updateTask,
        onError: (error) => {
            toast.error(error.message)
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({queryKey: ['project', projectId]})
            queryClient.invalidateQueries({queryKey: ['task', taskId]})
            toast.success(data)
            reset()
            navigate(location.pathname, {replace: true})
        }
    })

    const handleEditTask = (formData: TaskFormData) => {
        const data = { projectId, taskId, formData }
        mutate(data)
    }

    return (
        <Transition appear show={true} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={() => navigate(location.pathname, {replace: true}) }>
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
                            <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-3xl bg-[#0f172a] border border-slate-700 text-left align-middle shadow-2xl transition-all p-12">
                                
                                <Dialog.Title
                                    as="h3"
                                    className="font-black text-4xl text-white tracking-tight"
                                >
                                    Editar <span className="text-cyan-500">Parámetros</span>
                                </Dialog.Title>

                                <p className="text-xl font-light text-slate-400 mt-2">
                                    Modifica los detalles técnicos de la tarea en el <span className="text-cyan-500/80 font-bold italic">Pipeline</span>
                                </p>

                                <form
                                    className="mt-10 space-y-6"
                                    onSubmit={handleSubmit(handleEditTask)}
                                    noValidate
                                >
                                    <div className="bg-[#0a0f1d] p-6 rounded-2xl border border-slate-800 shadow-inner">
                                        <TaskForm
                                            register={register}
                                            errors={errors}
                                        />
                                    </div>
                    
                                    <div className="flex gap-4">
                                        <button
                                            type="button"
                                            onClick={() => navigate(location.pathname, {replace: true})}
                                            className="w-1/3 p-3 bg-slate-800 hover:bg-slate-700 text-white font-black uppercase text-sm tracking-widest rounded-xl transition-all"
                                        >
                                            Cancelar
                                        </button>
                                        <input
                                            type="submit"
                                            className="w-2/3 bg-cyan-600 hover:bg-cyan-500 p-3 text-white font-black uppercase text-sm tracking-widest rounded-xl cursor-pointer transition-all shadow-lg shadow-cyan-900/20 active:scale-[0.98]"
                                            value='Actualizar Registro'
                                        />
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}