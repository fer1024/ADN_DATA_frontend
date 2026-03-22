import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { EllipsisVerticalIcon } from '@heroicons/react/20/solid'
import { Link, Navigate, useNavigate, useParams } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import AddMemberModal from "@/components/team/AddMemberModal"
import { getProjectTeam, removeUserFromProject } from "@/api/TeamAPI"
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'

export default function ProjectTeamView() {

    const navigate = useNavigate()
    const params = useParams()
    const projectId = params.projectId!

    const { data, isLoading, isError } = useQuery({
        queryKey: ['projectTeam', projectId],
        queryFn: () => getProjectTeam(projectId),
        retry: false
    })

    const queryClient = useQueryClient()
    const { mutate } = useMutation({
        mutationFn: removeUserFromProject,
        onError: (error) => {
            toast.error(error.message)
        },
        onSuccess: (data) => {
            toast.success(data)
            queryClient.invalidateQueries({ queryKey: ['projectTeam', projectId] })
        }
    })

    if (isLoading) return (
        <div className="min-h-[400px] flex items-center justify-center">
            <p className="text-cyan-500 animate-pulse font-bold tracking-[0.2em]">CARGANDO DIRECTORIO...</p>
        </div>
    )

    if (isError) return <Navigate to={'/404'} />

    if (data) return (
        <>
            <motion.header
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
            >
                <h1 className="text-5xl font-black text-black">Administrar <span className="text-cyan-500">Equipo</span></h1>
                <p className="text-2xl font-light text-slate-400 mt-5 italic">
                    Configuración de <span className="text-cyan-500/80 font-bold">permisos y accesos</span> de colaboradores
                </p>
            </motion.header>

            <nav className="my-10 flex flex-wrap gap-4">
                <button
                    type="button"
                    className="bg-cyan-600 hover:bg-cyan-500 px-10 py-3 text-white text-xl font-black cursor-pointer transition-all rounded-lg shadow-lg shadow-cyan-900/20 active:scale-95"
                    onClick={() => navigate(location.pathname + '?addMember=true')}
                >
                    Agregar Colaborador
                </button>

                <Link
                    to={`/projects/${projectId}`}
                    className="bg-slate-800 hover:bg-slate-700 px-10 py-3 text-white text-xl font-black cursor-pointer transition-all rounded-lg border border-slate-700 shadow-xl active:scale-95 text-center"
                >
                    Volver a Proyecto
                </Link>
            </nav>

            <h2 className="text-3xl font-black text-black my-10 border-b border-slate-800 pb-4 tracking-tight">
                Miembros del <span className="text-cyan-500">Pipeline</span>
            </h2>

            {data.length ? (
                <ul role="list" className="mt-10 space-y-4">
                    {data?.map((member) => (
                        <motion.li 
                            key={member._id} 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex justify-between items-center gap-x-6 px-8 py-6 bg-[#0f172a]/80 border border-slate-500 rounded-2xl hover:bg-slate-600 transition-all group shadow-md"
                        >
                            <div className="flex min-w-0 gap-x-4">
                                <div className="h-12 w-12 rounded-full bg-cyan-500/30 border border-cyan-500/20 flex items-center justify-center">
                                    <span className="text-cyan-500 font-bold text-xl">{member.name.charAt(0)}</span>
                                </div>
                                <div className="min-w-0 flex-auto max-w-[200px] sm:max-w-none space-y-1">
                                    <p className="text-xl font-black text-slate-200 group-hover:text-cyan-400 transition-colors truncate">
                                        {member.name}
                                    </p>
                                    <p className="text-sm text-white font-mono tracking-tight truncate">
                                       {member.email}
                                    </p>
                                </div>
                            </div>
                            <div className="flex shrink-0 items-center gap-x-6">
                                <Menu as="div" className="relative flex-none">
                                    <Menu.Button className="-m-2.5 block p-2.5 text-slate-500 hover:text-cyan-500 transition-colors">
                                        <span className="sr-only">opciones</span>
                                        <EllipsisVerticalIcon className="h-9 w-9" aria-hidden="true" />
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
                                        <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-xl bg-[#0f172a] border border-slate-700 py-2 shadow-2xl focus:outline-none ring-1 ring-black ring-opacity-5">
                                            <Menu.Item>
                                                {({ active }) => (
                                                    <button
                                                        type='button'
                                                        className={`${active ? 'bg-red-500/10 text-red-400' : 'text-red-500'} block w-full text-left px-4 py-3 text-sm font-bold transition-colors`}
                                                        onClick={() => mutate({ projectId, userId: member._id })}
                                                    >
                                                        Eliminar del Proyecto
                                                    </button>
                                                )}
                                            </Menu.Item>
                                        </Menu.Items>
                                    </Transition>
                                </Menu>
                            </div>
                        </motion.li>
                    ))}
                </ul>
            ) : (
                <div className="bg-[#1e293b]/20 border border-dashed border-slate-700 rounded-2xl py-20">
                    <p className='text-center text-slate-500 text-xl font-light'>No hay miembros registrados en este equipo</p>
                </div>
            )}

            <AddMemberModal />
        </>
    )
}