import { Link, useNavigate } from "react-router-dom"
import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import ProjectForm from "@/components/projects/ProjectForm"
import { ProjectFormData } from "@/types/index"
import { createProject } from "@/api/ProjectAPI"
import { motion } from "framer-motion" // Para mantener la consistencia visual

export default function CreateProjectView() {

    const navigate = useNavigate()
    const initialValues : ProjectFormData = {
        projectName: "",
        clientName: "",
        description: ""
    }

    const {register, handleSubmit, formState: {errors}} = useForm({defaultValues: initialValues})

    const {mutate} = useMutation({
        mutationFn: createProject,
        onError: (error) => {
            toast.error(error.message)
        },
        onSuccess: (data) => {
            toast.success(data)
            navigate('/')
        }
    })

    const handleForm = (formData : ProjectFormData) => mutate(formData)

    return (
        <>
            <div className="max-w-3xl mx-auto pb-20">
                <header className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h1 className="text-5xl font-black text-black tracking-tight">
                            Crear <span className="text-cyan-500">Proyecto</span>
                        </h1>
                        <p className="text-2xl font-light text-slate-400 mt-5">
                            Llena el siguiente formulario para inicializar un <span className="text-cyan-500/80 font-bold">activo de datos</span>
                        </p>
                    </div>

                    <nav>
                        <Link
                            className="bg-slate-800 hover:bg-slate-700 px-10 py-3 text-white text-xl font-bold cursor-pointer transition-all rounded-lg border border-slate-700 shadow-lg inline-block active:scale-95"
                            to='/'
                        >Regresar a Proyectos</Link>
                    </nav>
                </header>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative group mt-10"
                >
                    {/* Efecto Glow de fondo */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-500"></div>

                    <form
                        className="relative bg-[#1e293b] shadow-2xl p-10 rounded-2xl border border-slate-700/50 space-y-8"
                        onSubmit={handleSubmit(handleForm)}
                        noValidate
                    >
                        {/* El ProjectForm heredará el estilo de los inputs si los configuramos en su componente */}
                        <ProjectForm 
                            register={register}
                            errors={errors}
                        />
                        
                        <input
                            type="submit"
                            value='Crear Proyecto'
                            className="bg-cyan-600 hover:bg-cyan-500 w-full p-4 text-white uppercase font-black text-xl cursor-pointer transition-all rounded-xl shadow-lg shadow-cyan-900/20 active:scale-[0.98]"
                        />  
                    </form>
                </motion.div>

                <p className="text-center mt-10 text-slate-500 text-sm tracking-widest uppercase">
                    ADN_DATA SOFTWARE: <span className="text-cyan-500">Active</span>
                </p>
            </div>
        </>
    )
}