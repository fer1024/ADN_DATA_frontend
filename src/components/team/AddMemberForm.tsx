import { useParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import UserAutocomplete from "./UserAutocomplete";
import { addUserToProject } from "@/api/TeamAPI";
import { toast } from "react-toastify";

export default function AddMemberForm() {
    const params = useParams()
    const projectId = params.projectId!
    const queryClient = useQueryClient()

    const { mutate, isPending } = useMutation({
        mutationFn: ({ userId }: { userId: string }) => addUserToProject({ projectId, id: userId }),
        onError: (error: Error) => toast.error(error.message),
        onSuccess: (data) => {
            toast.success(data)
            queryClient.invalidateQueries({ queryKey: ['projectTeam', projectId] })
        }
    })

    const handleSelectUser = (userId: string) => {
        if (userId) {
            mutate({ userId })
        }
    }

    return (
        <div className="mt-10 space-y-5">
            <div className="flex flex-col gap-3">
                <label className="font-normal text-base sm:text-xl text-white">
                    Buscar Colaborador
                </label>
                <p className="text-xs sm:text-sm text-slate-400">
                    Escribe el nombre o correo del usuario que deseas agregar al proyecto
                </p>
                <UserAutocomplete
                    value=""
                    onChange={handleSelectUser}
                />
            </div>
            
            {isPending && (
                <p className="text-center text-cyan-400 animate-pulse">Agregando colaborador...</p>
            )}
        </div>
    )
}
