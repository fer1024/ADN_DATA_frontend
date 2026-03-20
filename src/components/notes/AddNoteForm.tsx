import { NoteFormData } from '@/types/index'
import { useForm } from 'react-hook-form'
import ErrorMessage from '../ErrorMessage'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createNote } from '@/api/NoteAPI'
import { toast } from 'react-toastify'
import { useLocation, useParams } from 'react-router-dom'

export default function AddNoteForm() {

    const params = useParams()
    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)

    const projectId = params.projectId!
    const taskId = queryParams.get('viewTask')!

    const initialValues : NoteFormData = {
        content: ''
    }

    const { register, handleSubmit, reset, formState: {errors} } = useForm({defaultValues: initialValues})

    const queryClient = useQueryClient()
    const { mutate } = useMutation({
        mutationFn: createNote,
        onError: (error) => {
            toast.error(error.message)
        },
        onSuccess: (data) => {
            toast.success(data)
            queryClient.invalidateQueries({queryKey: ['task', taskId]})
        }
    })
    
    const handleAddNote = (formData: NoteFormData) => {
        mutate({projectId, taskId, formData})
        reset()
    }

    return (
        <form
            onSubmit={handleSubmit(handleAddNote)}
            className="space-y-4 bg-slate-900/50 p-6 rounded-2xl border border-slate-800 shadow-inner mt-10"
            noValidate
        >
            <div className="flex flex-col gap-2">
                <label 
                    className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1" 
                    htmlFor="content"
                >
                    Nueva Observación / Nota
                </label>
                <textarea
                    id="content"
                    placeholder="Escribe un hallazgo o comentario sobre esta fase..."
                    className="w-full p-4 bg-[#0f172a] border border-slate-700 rounded-xl text-slate-300 placeholder:text-slate-600 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none transition-all resize-none min-h-[100px] font-mono text-sm"
                    {...register('content', {
                        required: 'El contenido de la nota es obligatorio'
                    })}
                />
                {errors.content && (
                    <ErrorMessage>{errors.content.message}</ErrorMessage>
                )}
            </div>

            <button
                type="submit"
                className="bg-cyan-600 hover:bg-cyan-500 w-full p-3 text-white font-black uppercase text-sm tracking-widest rounded-xl cursor-pointer transition-all shadow-lg shadow-cyan-900/20 active:scale-[0.98] flex justify-center items-center gap-2"
            >
                <span>Registrar Nota</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
            </button>
        </form>
    )
}