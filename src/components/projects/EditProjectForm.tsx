import ProjectForm from './ProjectForm'
import { Link, useNavigate } from 'react-router-dom'
import { Project, ProjectFormData } from '@/types/index'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateProject } from '@/api/ProjectAPI'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'

type EditProjectFormProps = {
    data: ProjectFormData
    projectId: Project['_id']
}

export default function EditProjectForm({ data, projectId }: EditProjectFormProps) {

    const navigate = useNavigate()
    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            projectName: data.projectName,
            clientName: data.clientName,
            description: data.description
        }
    })

    const queryClient = useQueryClient()
    const { mutate } = useMutation({
        mutationFn: updateProject,
        onError: (error) => {
            toast.error(error.message)
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['projects'] })
            queryClient.invalidateQueries({ queryKey: ['editProject', projectId] })
            toast.success(data)
            navigate('/')
        }
    })

    const handleForm = (formData: ProjectFormData) => {
        const data = {
            formData,
            projectId
        }
        mutate(data)
    }

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-3xl mx-auto"
        >
            <h1 className="text-5xl font-black text-black">
                Editar <span className="text-cyan-500">Proyecto</span>
            </h1>
            <p className="text-2xl font-light text-slate-400 mt-5">
                Modifica los parámetros del proyecto y <span className="text-cyan-500/80 font-bold italic text-xl">actualiza la base de datos</span>
            </p>

            <nav className="my-8">
                <Link
                    className="bg-slate-800 hover:bg-slate-700 border border-slate-700 px-10 py-3 text-white text-xl font-black cursor-pointer transition-all rounded-lg shadow-xl inline-block"
                    to='/'
                >
                    Volver a Proyectos
                </Link>
            </nav>

            <form
                className="mt-10 bg-[#0f172a] shadow-2xl p-10 rounded-2xl border border-cyan-500/10"
                onSubmit={handleSubmit(handleForm)}
                noValidate
            >
                <div className="space-y-8">
                    <ProjectForm
                        register={register}
                        errors={errors}
                    />

                    <input
                        type="submit"
                        value='Actualizar Parámetros'
                        className="bg-cyan-600 hover:bg-cyan-500 w-full p-4 text-white uppercase font-black text-xl cursor-pointer transition-all rounded-xl shadow-lg shadow-cyan-900/20 active:scale-[0.98]"
                    />
                </div>
            </form>
        </motion.div>
    )
}