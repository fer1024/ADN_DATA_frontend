import { useForm } from "react-hook-form"
import ErrorMessage from "../ErrorMessage"
import { User, UserProfileForm } from "@/types/index"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateProfile } from "@/api/ProfileAPI"
import { toast } from "react-toastify"
import { motion } from "framer-motion"

type ProfileFormProps = {
    data: User
}

export default function ProfileForm({ data } : ProfileFormProps) {
    const { register, handleSubmit, formState: { errors } } = useForm<UserProfileForm>({ defaultValues: data })

    const queryClient = useQueryClient()
    const { mutate } = useMutation({
        mutationFn: updateProfile,
        onError: (error) => toast.error(error.message),
        onSuccess: (data) => {
            toast.success(data)
            queryClient.invalidateQueries({queryKey: ['user']})
        } 
    })

    const handleEditProfile = (formData: UserProfileForm) => mutate(formData)

    return (
        <>
            <div className="mx-auto max-w-3xl">
                <header>
                    <h1 className="text-5xl font-black text-black tracking-tight">
                        Mi <span className="text-cyan-500">Perfil</span>
                    </h1>
                    <p className="text-2xl font-light text-slate-400 mt-5">Aquí puedes actualizar tu <span className="text-cyan-500/80 font-bold">información de acceso</span></p>
                </header>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative group mt-14"
                >
                    {/* Efecto Glow de fondo */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-500"></div>

                    <form
                        onSubmit={handleSubmit(handleEditProfile)}
                        className="relative bg-[#1e293b] shadow-2xl p-10 rounded-2xl border border-slate-700/50 space-y-8"
                        noValidate
                    >
                        <div className="space-y-3">
                            <label
                                className="text-sm uppercase font-bold text-slate-300 ml-1 tracking-widest"
                                htmlFor="name"
                            >Nombre de Usuario</label>
                            <input
                                id="name"
                                type="text"
                                placeholder="Tu Nombre"
                                className="w-full p-3 bg-[#0f172a] border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                                {...register("name", {
                                    required: "Nombre de usuario es obligatorio",
                                })}
                            />
                            {errors.name && (
                                <ErrorMessage>{errors.name.message}</ErrorMessage>
                            )}
                        </div>

                        <div className="space-y-3">
                            <label
                                className="text-sm uppercase font-bold text-slate-300 ml-1 tracking-widest"
                                htmlFor="email"
                            >E-mail Institucional</label>
                            <input
                                id="email"
                                type="email"
                                placeholder="Tu Email"
                                className="w-full p-3 bg-[#0f172a] border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                                {...register("email", {
                                    required: "El e-mail es obligatorio",
                                    pattern: {
                                        value: /\S+@\S+\.\S+/,
                                        message: "E-mail no válido",
                                    },
                                })}
                            />
                            {errors.email && (
                                <ErrorMessage>{errors.email.message}</ErrorMessage>
                            )}
                        </div>

                        <input
                            type="submit"
                            value='Guardar Cambios'
                            className="bg-cyan-600 hover:bg-cyan-500 w-full p-3 text-white uppercase font-black text-xl cursor-pointer transition-all rounded-xl shadow-lg shadow-cyan-900/20 active:scale-[0.98] mt-4"
                        />
                    </form>
                </motion.div>
                
                <div className="mt-10 p-4 border border-cyan-500/10 rounded-lg bg-cyan-500/5">
                    <p className="text-slate-500 text-xs text-center uppercase tracking-[0.2em]">
                        Data Governance Level: <span className="text-cyan-500 font-bold">Administrator</span>
                    </p>
                </div>
            </div>
        </>
    )
}