import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { EllipsisVerticalIcon } from '@heroicons/react/20/solid'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { TaskProject } from "@/types/index"
import { deleteTask } from '@/api/TaskAPI'
import { toast } from 'react-toastify'
import { useDraggable } from '@dnd-kit/core'

type TaskCardProps = {
    task: TaskProject
    canEdit: boolean
}

export default function TaskCard({ task, canEdit }: TaskCardProps) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: task._id
    })
    const navigate = useNavigate()
    const params = useParams()
    const projectId = params.projectId!

    const queryClient = useQueryClient()
    const { mutate } = useMutation({
        mutationFn: deleteTask,
        onError: (error) => toast.error(error.message),
        onSuccess: (data) => {
            toast.success(data)
            queryClient.invalidateQueries({ queryKey: ['project', projectId] })
        }
    })

    const isUnassigned = !task.assignedTo || (typeof task.assignedTo === 'string' && task.assignedTo === '')

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        padding: "1.25rem",
        backgroundColor: '#1e293b', // Slate-800 al arrastrar
        width: '300px',
        display: 'flex',
        borderWidth: '2px',
        borderColor: '#06b6d4', // Borde Cian al arrastrar
        borderRadius: '1rem',
        zIndex: 50,
        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)'
    } : undefined

    return (
        <li className="relative flex justify-between gap-x-6 px-5 py-6 bg-[#111827] border border-slate-800 rounded-xl hover:border-cyan-500/50 transition-colors shadow-sm group">
            <div 
                {...listeners}
                {...attributes}
                ref={setNodeRef}
                style={style}
                className="min-w-0 flex flex-col gap-y-2 cursor-grab active:cursor-grabbing w-full"
            >
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                    <p className="text-sm font-black text-slate-200 tracking-tight line-clamp-1 uppercase font-mono">
                        {task.name}
                    </p>
                    {isUnassigned && (
                        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase tracking-wider">
                            Sin asignar
                        </span>
                    )}
                </div>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {task.description}
                </p>
                
                <div className="mt-2 flex items-center gap-4">
                    <span className="text-[10px] font-mono text-slate-600 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        ID-{task._id.slice(-4).toUpperCase()}
                    </span>
                </div>
            </div>

            <div className="flex shrink-0 items-center">
                <Menu as="div" className="relative flex-none">
                    <Menu.Button className="-m-2.5 block p-2.5 text-slate-500 hover:text-cyan-400 transition-colors">
                        <span className="sr-only">opciones</span>
                        <EllipsisVerticalIcon className="h-6 w-6" aria-hidden="true" />
                    </Menu.Button>
                    <Transition 
                        as={Fragment} 
                        enter="transition ease-out duration-100" 
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100" 
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100" 
                        leaveTo="transform opacity-0 scale-95"
                    >
                        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-xl bg-[#0f172a] py-2 shadow-2xl ring-1 ring-slate-800 focus:outline-none border border-slate-700">
                            <Menu.Item>
                                {({ active }) => (
                                    <button
                                        type='button'
                                        className={`${active ? 'bg-slate-800 text-cyan-400' : 'text-slate-300'} block w-full text-left px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors`}
                                        onClick={() => navigate(location.pathname + `?viewTask=${task._id}`)}
                                    >
                                        Detalles Logs
                                    </button>
                                )}
                            </Menu.Item>

                            {canEdit && (
                                <>
                                    <Menu.Item>
                                        {({ active }) => (
                                            <button
                                                type='button'
                                                className={`${active ? 'bg-slate-800 text-cyan-400' : 'text-slate-300'} block w-full text-left px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors`}
                                                onClick={() => navigate(location.pathname + `?editTask=${task._id}`)}
                                            >
                                                Editar Nodo
                                            </button>
                                        )}
                                    </Menu.Item>

                                    <Menu.Item>
                                        {({ active }) => (
                                            <button
                                                type='button'
                                                className={`${active ? 'bg-red-500/10 text-red-500' : 'text-red-500/80'} block w-full text-left px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors`}
                                                onClick={() => mutate({ projectId, taskId: task._id })}
                                            >
                                                Eliminar Registro
                                            </button>
                                        )}
                                    </Menu.Item>
                                </>
                            )}
                        </Menu.Items>
                    </Transition>
                </Menu>
            </div>
        </li>
    )
}