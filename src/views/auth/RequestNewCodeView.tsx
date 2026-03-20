import { Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { useMutation } from '@tanstack/react-query'
import { RequestConfirmationCodeForm } from "../../types"
import ErrorMessage from "@/components/ErrorMessage"
import { requestConfirmationCode } from "@/api/AuthAPI"
import { toast } from "react-toastify"

export default function RequestNewCodeView() {
    const initialValues: RequestConfirmationCodeForm = { email: '' }

    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: initialValues
    })

    const { mutate } = useMutation({
        mutationFn: requestConfirmationCode,
        onError: (error) => toast.error(error.message),
        onSuccess: (data) => toast.success(data)
    })

    const handleRequestCode = (formData: RequestConfirmationCodeForm) => mutate(formData)

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f172a] p-4">
            <div className="w-full max-w-sm sm:max-w-md">

                <div className="text-center mb-8">
                    <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                        ADN <span className="text-cyan-500">DATA</span>
                    </h1>
                    <p className="text-slate-400 mt-2 font-medium">
                        Gestión y Administración de Datos
                    </p>
                </div>

                <div className="bg-[#1e293b] shadow-2xl rounded-2xl border border-slate-700/50 overflow-hidden">
                    <div className="p-4 sm:p-8">
                        <h2 className="text-xl font-semibold text-white mb-2">
                            Solicita tu nuevo código
                        </h2>
                        <p className="text-slate-400 text-sm mb-6">
                            Ingresa tu email y te enviaremos un nuevo código de confirmación
                        </p>

                        <form onSubmit={handleSubmit(handleRequestCode)} className="space-y-5" noValidate>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300 ml-1" htmlFor="email">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="usuario@dominio.com"
                                    className="w-full p-2 sm:p-3 bg-[#0f172a] border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                                    {...register("email", {
                                        required: "El email de registro es obligatorio",
                                        pattern: {
                                            value: /\S+@\S+\.\S+/,
                                            message: "E-mail no válido",
                                        },
                                    })}
                                />
                                {errors.email && <ErrorMessage>{errors.email.message}</ErrorMessage>}
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 px-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg shadow-lg shadow-cyan-900/20 transition-all active:scale-[0.98]"
                            >
                                Enviar Código
                            </button>
                        </form>
                    </div>

                    <div className="bg-[#2d3a4f]/30 p-4 border-t border-slate-700/50">
                        <nav className="flex flex-col space-y-2 text-sm text-center">
                            <Link
                                to='/auth/login'
                                className="text-slate-400 hover:text-cyan-400 transition-colors"
                            >
                                ¿Ya tienes cuenta? <span className="font-semibold text-cyan-500">Iniciar Sesión</span>
                            </Link>
                            <Link
                                to='/auth/forgot-password'
                                className="text-slate-500 hover:text-slate-300 transition-colors text-xs"
                            >
                                ¿Olvidaste tu contraseña? Restablécela
                            </Link>
                        </nav>
                    </div>
                </div>

                <p className="text-center mt-8 text-slate-500 text-xs tracking-widest uppercase">
                    &copy; 2026 ADN DATA Engineering
                </p>
            </div>
        </div>
    )
}