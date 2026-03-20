import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify';
import { getTaskById, updateStatus } from '@/api/TaskAPI';
import { formatDate } from '@/utils/utils';
import { TaskStatus } from '@/types/index';
import { statusTranslations } from '@/locales/es';
import NotesPanel from '../notes/NotesPanel';

export default function TaskModalDetails() {
    const params = useParams()
    const projectId = params.projectId!
    const navigate = useNavigate()
    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const taskId = queryParams.get('viewTask')!

    const show = taskId ? true : false

    const { data, isError, error } = useQuery({
        queryKey: ['task', taskId],
        queryFn: () => getTaskById({ projectId, taskId }),
        enabled: !!taskId,
        retry: false
    })

    const queryClient = useQueryClient()
    const { mutate } = useMutation({
        mutationFn: updateStatus,
        onError: (error) => {
            toast.error(error.message)
        },
        onSuccess: (data) => {
            toast.success(data)
            queryClient.invalidateQueries({ queryKey: ['project', projectId] })
            queryClient.invalidateQueries({ queryKey: ['task', taskId] })
        }
    })

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const status = e.target.value as TaskStatus
        const data = { projectId, taskId, status }
        mutate(data)
    }

    if (isError) {
        toast.error(error.message, { toastId: 'error' })
        return <Navigate to={`/projects/${projectId}`} />
    }

    if (data) return (
        <>
            <Transition appear show={show} as={Fragment}>
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
                                <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-3xl bg-[#0f172a] border border-slate-700 text-left align-middle shadow-2xl transition-all p-12 relative">
                                    
                                    {/* Cabecera Técnica */}
                                    <div className="flex flex-col md:flex-row md:justify-between border-b border-slate-800 pb-6 mb-8 gap-4">
                                        <div>
                                            <Dialog.Title as="h3" className="font-black text-4xl text-white tracking-tight">
                                                {data.name}
                                            </Dialog.Title>
                                            <p className='text-cyan-500 font-mono text-xs uppercase tracking-widest mt-2'>Task Identity: {taskId.slice(-8)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className='text-xs text-slate-500 font-mono'>CREATED: {formatDate(data.createdAt)}</p>
                                            <p className='text-xs text-slate-500 font-mono uppercase'>Updated: {formatDate(data.updatedAt)}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                                        <div className="lg:col-span-2 space-y-8">
                                            {/* Descripción */}
                                            <section>
                                                <h4 className="text-slate-400 font-bold uppercase text-xs tracking-widest mb-3">Descripción de la Tarea</h4>
                                                <p className='text-xl text-slate-300 leading-relaxed bg-slate-900/50 p-6 rounded-2xl border border-slate-800'>
                                                    {data.description}
                                                </p>
                                            </section>

                                            {/* Historial como Log de Sistema */}
                                            {data.completedBy.length ? (
                                                <section>
                                                    <h4 className="text-slate-400 font-bold uppercase text-xs tracking-widest mb-4">Activity Log / Historial</h4>
                                                    <ul className='space-y-2 bg-[#0a0f1d] p-4 rounded-xl border border-slate-800 font-mono text-sm max-h-48 overflow-y-auto'>
                                                        {data.completedBy.map((activityLog) => (
                                                            <li key={activityLog._id} className="text-slate-400 py-1 border-b border-white/5 last:border-0">
                                                                <span className='text-cyan-500'>[STATUS_CHANGE]</span>{' '}
                                                                <span className='font-bold text-slate-200 uppercase'>
                                                                    {statusTranslations[activityLog.status]}
                                                                </span>
                                                                <span className="mx-2 text-slate-600">|</span>
                                                                <span>USER: {activityLog.user.name}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </section>
                                            ) : null}

                                            {/* Notas del Panel */}
                                            <div className="pt-4">
                                                <NotesPanel notes={data.notes} />
                                            </div>
                                        </div>

                                        {/* Barra Lateral de Control */}
                                        <div className="space-y-6">
                                            <div className='bg-slate-900/80 p-6 rounded-2xl border border-slate-800 shadow-inner'>
                                                <label className='block text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mb-4'>Control de Fase</label>
                                                <select
                                                    className='w-full p-3 bg-[#0f172a] border border-slate-700 rounded-xl text-white font-bold focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all cursor-pointer'
                                                    defaultValue={data.status}
                                                    onChange={handleChange}
                                                >
                                                    {Object.entries(statusTranslations).map(([key, value]) => (
                                                        <option key={key} value={key} className="bg-[#0f172a]">{value}</option>
                                                    ))}
                                                </select>
                                                <p className="mt-4 text-[10px] text-slate-500 italic leading-snug text-center">
                                                    Cambiar la fase actualizará el Pipeline CRISP-DM automáticamente.
                                                </p>
                                            </div>

                                            <button 
                                                onClick={() => navigate(location.pathname, { replace: true })}
                                                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-xl transition-colors uppercase text-xs tracking-widest"
                                            >
                                                Cerrar Terminal
                                            </button>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    )
}