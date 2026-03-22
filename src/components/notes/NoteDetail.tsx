import { deleteNote } from "@/api/NoteAPI"
import { useAuth } from "@/hooks/useAuth"
import { Note } from "@/types/index"
import { formatDate } from "@/utils/utils"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useMemo } from "react"
import { useLocation, useParams } from "react-router-dom"
import { toast } from "react-toastify"


type NoteDetailProps = {
    note: Note
}

export default function NoteDetail({ note }: NoteDetailProps) {

    const { data, isLoading } = useAuth()
    const canDelete = useMemo(() => data?._id === note.createdBy._id, [data])
    const params = useParams()
    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    
    const projectId = params.projectId!
    const taskId = queryParams.get('viewTask')!

    const queryClient = useQueryClient()
    const { mutate } = useMutation({
        mutationFn: deleteNote,
        onError: (error) => toast.error(error.message),
        onSuccess: (data) => {
            toast.success(data)
            queryClient.invalidateQueries({queryKey: ['task', taskId]})
        }
    })

    if (isLoading) return 'Cargando...'

    return (
        <div className="p-3 flex justify-between items-start gap-3 bg-slate-800/30 rounded-lg mb-2">
            <div className="flex-1">
                <p className="text-slate-300">
                    {note.content}
                </p>
                <p className="text-[10px] text-slate-500 mt-1">
                    por <span className="font-bold text-slate-400">{note.createdBy.name}</span> · {formatDate(note.createdAt)}
                </p>
            </div>

            {canDelete && (
                <button
                    type="button"
                    className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 p-2 text-xs text-red-400 font-bold cursor-pointer transition-colors rounded-lg"
                    onClick={() => mutate({projectId, taskId, noteId: note._id})}
                >✕</button>
            )}
        </div>
    )
}
