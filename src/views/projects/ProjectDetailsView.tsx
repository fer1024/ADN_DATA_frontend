import { Link, Navigate, useNavigate, useParams, useLocation } from "react-router-dom"
import { useQuery } from '@tanstack/react-query'
import { getFullProject } from "@/api/ProjectAPI"
import AddTaskModal from "@/components/tasks/AddTaskModal"
import TaskList from "@/components/tasks/TaskList"
import TaskDetailsModal from "@/components/tasks/TaskDetailsModal"
import ProjectReport from "@/components/tasks/ProjectReport"
import ProjectDashboard from "@/components/tasks/ProjectDashboard"
import { useAuth } from "@/hooks/useAuth"
import { isManager } from "@/utils/policies"
import { useMemo, useState } from "react"
import { motion } from "framer-motion"

export default function ProjectDetailsView() {
    const { data: user, isLoading: authLoading } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [showReport, setShowReport] = useState(false)
    const [showDashboard, setShowDashboard] = useState(true)

    const params = useParams()
    const projectId = params.projectId!

    const { data, isLoading, isError } = useQuery({
        queryKey: ['project', projectId],
        queryFn: () => getFullProject(projectId),
        retry: false
    })

    const canEdit = useMemo(() => data?.manager === user?._id, [data, user])

    if (isLoading && authLoading) return (
        <div className="min-h-[400px] flex items-center justify-center">
            <p className="text-cyan-500 animate-pulse font-bold">Sincronizando Proyecto...</p>
        </div>
    )

    if (isError) return <Navigate to='/404' />

    if (data && user) return (
        <>
            <motion.header
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-10"
            >
                <h1 className="text-5xl font-black text-black tracking-tight">{data.projectName}</h1>
                <p className="text-2xl font-light text-slate-400 mt-5 border-l-4 border-cyan-500 pl-4">
                    {data.description}
                </p>
            </motion.header>

            <nav className="my-10 flex flex-col sm:flex-row justify-between gap-4">
                {/* Izquierda: Ver Dashboard y Reporte */}
                <div className="flex flex-col sm:flex-row items-stretch gap-3">
                    {data.tasks.length > 0 && (
                        <button
                            type="button"
                            onClick={() => setShowDashboard(d => !d)}
                            className={`px-6 py-3 text-white text-lg font-black cursor-pointer transition-all rounded-lg border shadow-xl active:scale-95 flex items-center justify-center gap-3 ${
                                showDashboard
                                    ? 'bg-cyan-600 hover:bg-cyan-500 border-cyan-500'
                                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700'
                            }`}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            {showDashboard ? 'Ocultar Dashboard' : 'Ver Dashboard'}
                        </button>
                    )}
                    <button
                        type="button"
                        className="bg-slate-800 hover:bg-slate-700 px-6 py-3 text-white text-lg font-black cursor-pointer transition-all rounded-lg border border-slate-700 shadow-xl active:scale-95 flex items-center justify-center gap-3"
                        onClick={() => setShowReport(true)}
                    >
                        <svg className="w-6 h-6 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Reporte
                    </button>
                </div>

                {/* Derecha: Agregar Tarea y Colaboradores */}
                <div className="flex flex-col sm:flex-row items-stretch gap-3">
                    {isManager(data.manager, user._id) && (
                        <button
                            type="button"
                            className="bg-cyan-600 hover:bg-cyan-500 px-6 py-3 text-white text-lg font-black cursor-pointer transition-all rounded-lg shadow-lg shadow-cyan-900/20 active:scale-95 flex items-center justify-center gap-3"
                            onClick={() => navigate(location.pathname + '?newTask=true')}
                        >
                            <span className="text-2xl">+</span> Agregar Tarea
                        </button>
                    )}
                    <Link
                        to={'team'}
                        className="bg-slate-800 hover:bg-slate-700 px-6 py-3 text-white text-lg font-black cursor-pointer transition-all rounded-lg border border-slate-700 shadow-xl active:scale-95 flex items-center justify-center gap-3"
                    >
                        <svg className="w-6 h-6 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 7.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        Colaboradores
                    </Link>
                </div>
            </nav>

            <div className="mt-10 pt-10 border-t border-slate-800/50">
                {data.tasks.length > 0 && showDashboard && <ProjectDashboard projectId={projectId} />}
                <TaskList tasks={data.tasks} canEdit={canEdit} />
            </div>

            <AddTaskModal />
            <TaskDetailsModal />
            <ProjectReport
                project={data}
                show={showReport}
                onClose={() => setShowReport(false)}
            />
        </>
    )
}