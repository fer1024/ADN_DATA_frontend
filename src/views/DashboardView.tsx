import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { EllipsisVerticalIcon } from '@heroicons/react/20/solid'
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useQuery } from '@tanstack/react-query'
import { getProjects } from "@/api/ProjectAPI"
import { useAuth } from '@/hooks/useAuth'
import { isManager } from '@/utils/policies'
import DeleteProjectModal from '@/components/projects/DeleteProjectModal'
import { motion } from 'framer-motion'

export default function DashboardView() {

    const location = useLocation()
    const navigate = useNavigate()
    const { data: user, isLoading: authLoading } = useAuth()
    const { data, isLoading } = useQuery({
        queryKey: ['projects'],
        queryFn: getProjects
    })

    if (isLoading && authLoading) return (
        <div className="min-h-screen flex justify-center items-center">
            <p className="text-cyan-500 animate-pulse font-bold text-2xl">Cargando Sistemas...</p>
        </div>
    )

    if (data && user) return (
        <div className="max-w-6xl mx-auto pb-20">
            <header className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-black tracking-tight">
                        Mis <span className="text-cyan-500">Proyectos</span>
                    </h1>
                    <p className="text-lg sm:text-2xl font-light text-slate-400 mt-2">Maneja y administra tus activos de datos</p>
                </div>

                <nav>
                    <Link
                        className="bg-cyan-600 hover:bg-cyan-500 px-4 sm:px-10 py-2 sm:py-3 text-white text-base sm:text-xl font-bold cursor-pointer transition-all rounded-lg shadow-lg shadow-cyan-900/20 inline-block active:scale-95"
                        to='/projects/create'
                    >Nuevo Proyecto</Link>
                </nav>
            </header>

            {data.length ? (
                <ul role="list" className="mt-10 space-y-4">
                    {data.map((project) => (
                        <motion.li
                            key={project._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            whileHover={{ y: -4 }}
                            /* Se añade z-10 y hover:z-50 para que el menú no se oculte tras la siguiente tarjeta */
                            className="relative group z-10 hover:z-50"
                        >
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl blur opacity-0 group-hover:opacity-15 transition duration-500"></div>

                            <div className="relative flex flex-col sm:flex-row justify-between gap-x-6 gap-y-4 px-4 sm:px-8 py-6 sm:py-8 bg-[#1e293b] border border-slate-700/50 rounded-xl shadow-xl transition-colors group-hover:border-cyan-500/30">
                                <div className="flex min-w-0 gap-x-4">
                                    <div className="min-w-0 flex-auto space-y-3">
                                        <div className='mb-2'>
                                            {isManager(project.manager, user._id) ?
                                                <p className='font-bold text-[10px] uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-full inline-block py-1 px-4 tracking-widest'>Manager</p> :
                                                <p className='font-bold text-[10px] uppercase bg-slate-700 text-slate-400 border border-slate-600 rounded-full inline-block py-1 px-4 tracking-widest'>Colaborador</p>
                                            }
                                        </div>
                                        <Link to={`/projects/${project._id}`}
                                            className="text-white cursor-pointer hover:text-cyan-400 transition-colors text-xl sm:text-2xl lg:text-3xl font-bold block"
                                        >{project.projectName}</Link>

                                        <div className="flex flex-col gap-1">
                                            <p className="text-sm font-medium text-cyan-500/80 uppercase tracking-tighter">
                                                Cliente: <span className="text-slate-300 normal-case">{project.clientName}</span>
                                            </p>
                                            <p className="text-sm text-slate-400 line-clamp-2">
                                                {project.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex shrink-0 items-center gap-x-6">
                                    <Menu as="div" className="relative flex-none">
                                        <Menu.Button className="-m-2.5 block p-2.5 text-slate-500 hover:text-cyan-400 transition-colors">
                                            <span className="sr-only">opciones</span>
                                            <EllipsisVerticalIcon className="h-9 w-9" aria-hidden="true" />
                                        </Menu.Button>
                                        <Transition as={Fragment} enter="transition ease-out duration-100"
                                            enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100"
                                            leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100"
                                            leaveTo="transform opacity-0 scale-95">
                                            {/* Se aumenta z-index a 50 en Menu.Items */}
                                            <Menu.Items
                                                className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-xl bg-[#0f172a] border border-slate-700 py-2 shadow-2xl ring-1 ring-black/5 focus:outline-none"
                                            >
                                                <Menu.Item>
                                                    <Link to={`/projects/${project._id}`}
                                                        className='block px-4 py-2 text-sm leading-6 text-slate-300 hover:bg-slate-800 transition-colors'>
                                                        Ver Proyecto
                                                    </Link>
                                                </Menu.Item>

                                                {isManager(project.manager, user._id) && (
                                                    <>
                                                        <Menu.Item>
                                                            <Link to={`/projects/${project._id}/edit`}
                                                                className='block px-4 py-2 text-sm leading-6 text-slate-300 hover:bg-slate-800 transition-colors'>
                                                                Editar Proyecto
                                                            </Link>
                                                        </Menu.Item>
                                                        <Menu.Item>
                                                            <button
                                                                type='button'
                                                                className='w-full text-left block px-4 py-2 text-sm leading-6 text-red-400 hover:bg-red-500/10 transition-colors font-semibold'
                                                                onClick={() => navigate(location.pathname + `?deleteProject=${project._id}`)}
                                                            >
                                                                Eliminar Proyecto
                                                            </button>
                                                        </Menu.Item>
                                                    </>
                                                )}
                                            </Menu.Items>
                                        </Transition>
                                    </Menu>
                                </div>
                            </div>
                        </motion.li>
                    ))}
                </ul>
            ) : (
                <div className="text-center py-32 bg-[#1e293b] rounded-2xl border border-dashed border-slate-700 mt-10">
                    <p className="text-slate-400 text-xl">No hay proyectos activos en el sistema {''}
                        <Link
                            to='/projects/create'
                            className="text-cyan-500 font-bold hover:underline"
                        >Crear el primero</Link>
                    </p>
                </div>
            )}

            <DeleteProjectModal />
        </div>
    )
}