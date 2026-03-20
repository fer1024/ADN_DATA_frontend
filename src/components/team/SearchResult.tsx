import { useMutation, useQueryClient } from "@tanstack/react-query"
import { TeamMember } from "@/types/index"
import { addUserToProject } from "@/api/TeamAPI"
import { toast } from "react-toastify"
import { useNavigate, useParams } from "react-router-dom"
import { motion } from "framer-motion"

type SearchResultProps = {
    user: TeamMember
    reset: () => void
}

export default function SearchResult({ user, reset }: SearchResultProps) {

    const navigate = useNavigate()
    const params = useParams()
    const projectId = params.projectId!
    
    const queryClient = useQueryClient()
    const { mutate } = useMutation({
        mutationFn: addUserToProject,
        onError: (error) => {
            toast.error(error.message)
        },
        onSuccess: (data) => {
            toast.success(data)
            reset()
            navigate(location.pathname, {replace: true})
            queryClient.invalidateQueries({queryKey: ['projectTeam', projectId]})
        }
    })

    const handleAddUserToProject = () => {
        const data = {
            projectId,
            id: user._id
        }
        mutate(data)
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10 border-t border-slate-700 pt-10"
        >
            <p className="text-center font-black text-slate-400 uppercase tracking-widest text-sm mb-5">
                Resultado de la consulta
            </p>
            
            <div className="flex justify-between items-center bg-[#0f172a] p-6 rounded-2xl border border-cyan-500/20 shadow-lg shadow-cyan-500/5">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                        <span className="text-cyan-500 font-black text-xl">
                            {user.name.charAt(0)}
                        </span>
                    </div>
                    <div>
                        <p className="text-white font-black text-xl">{user.name}</p>
                        <p className="text-slate-500 text-sm font-mono">{user.email}</p>
                    </div>
                </div>

                <button
                    className="bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-3 rounded-xl font-black cursor-pointer transition-all active:scale-95 shadow-lg shadow-cyan-900/20"
                    onClick={handleAddUserToProject}
                >
                    Confirmar Registro
                </button>
            </div>
        </motion.div>
    )
}