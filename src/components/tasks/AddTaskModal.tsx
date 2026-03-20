import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { TaskCreateFormData } from '@/types/index';
import { createTask } from '@/api/TaskAPI';
import { getProjectTeam } from '@/api/TeamAPI';
import { TaskCreateForm } from './TaskForm';
import { toast } from 'react-toastify';

export default function AddTaskModal() {
    const navigate = useNavigate()
    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const modalTask = queryParams.get('newTask')
    const show = modalTask ? true : false

    const params = useParams()
    const projectId = params.projectId!

    const { data: team = [] } = useQuery({
        queryKey: ['projectTeam', projectId],
        queryFn: () => getProjectTeam(projectId),
        enabled: show
    })

    const initialValues: TaskCreateFormData = {
        name: '',
        description: '',
        phase: 'business',
        assignedTo: ''
    }

    const { register, handleSubmit, reset, formState: { errors } } = useForm<TaskCreateFormData>({
        defaultValues: initialValues
    })

    const queryClient = useQueryClient()
    const { mutate } = useMutation({
        mutationFn: createTask,
        onError: (error) => toast.error(error.message),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['project', projectId] })
            toast.success(data as string)
            reset()
            navigate(`/projects/${projectId}`, { replace: true })
        }
    })

    const handleCreateTask = (formData: TaskCreateFormData) => {
        mutate({ formData, projectId })
    }

    return (
        <Transition appear show={show} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={() => navigate(`/projects/${projectId}`, { replace: true })}>
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
                            <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-[#1e293b] text-left align-middle shadow-2xl transition-all p-16 border border-slate-700 relative">
                                <div className="absolute top-0 right-0 p-4 opacity-20">
                                    <div className="h-20 w-20 border-t-2 border-r-2 border-cyan-500 rounded-tr-xl" />
                                </div>
                                <Dialog.Title as="h3" className="font-black text-4xl text-white my-5 tracking-tight">
                                    Nueva <span className="text-cyan-500">Tarea</span>
                                </Dialog.Title>
                                <p className="text-xl font-light text-slate-400">
                                    Registra una nueva unidad de trabajo en el <span className="text-cyan-500 font-bold">pipeline</span>
                                </p>
                                <form className="mt-10 space-y-5" onSubmit={handleSubmit(handleCreateTask)} noValidate>
                                    <TaskCreateForm register={register} errors={errors} team={team} />
                                    <input
                                        type="submit"
                                        className="bg-cyan-600 hover:bg-cyan-500 w-full p-4 text-white uppercase font-black text-xl cursor-pointer transition-all rounded-xl shadow-lg shadow-cyan-900/20 active:scale-[0.98] mt-5"
                                        value="Inicializar Tarea"
                                    />
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}