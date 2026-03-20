import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { useMutation } from '@tanstack/react-query'
import type { ConfirmToken, NewPasswordForm } from "../../types"
import ErrorMessage from "@/components/ErrorMessage"
import { updatePasswordWithToken } from "@/api/AuthAPI"
import { toast } from "react-toastify"

type NewPasswordFormProps = {
    token: ConfirmToken['token']
}

export default function NewPasswordForm({ token }: NewPasswordFormProps) {
    const navigate = useNavigate()

    const initialValues: NewPasswordForm = {
        password: '',
        password_confirmation: '',
    }

    const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({
        defaultValues: initialValues
    })

    const { mutate } = useMutation({
        mutationFn: updatePasswordWithToken,
        onError: (error) => toast.error(error.message),
        onSuccess: (data) => {
            toast.success(data)
            reset()
            navigate('/auth/login')
        }
    })

    const handleNewPassword = (formData: NewPasswordForm) => {
        mutate({ formData, token })
    }

    const password = watch('password')

    return (
        <form onSubmit={handleSubmit(handleNewPassword)} className="space-y-5" noValidate>

            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1">
                    Nueva contraseña
                </label>
                <input
                    type="password"
                    placeholder="Mínimo 8 caracteres"
                    className="w-full p-3 bg-[#0f172a] border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                    {...register("password", {
                        required: "La contraseña es obligatoria",
                        minLength: {
                            value: 8,
                            message: 'Mínimo 8 caracteres'
                        }
                    })}
                />
                {errors.password && <ErrorMessage>{errors.password.message}</ErrorMessage>}
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1">
                    Confirmar contraseña
                </label>
                <input
                    id="password_confirmation"
                    type="password"
                    placeholder="Repite tu contraseña"
                    className="w-full p-3 bg-[#0f172a] border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                    {...register("password_confirmation", {
                        required: "Confirma tu contraseña",
                        validate: value => value === password || 'Las contraseñas no coinciden'
                    })}
                />
                {errors.password_confirmation && <ErrorMessage>{errors.password_confirmation.message}</ErrorMessage>}
            </div>

            <button
                type="submit"
                className="w-full py-3 px-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg shadow-lg shadow-cyan-900/20 transition-all active:scale-[0.98] mt-2"
            >
                Establecer Contraseña
            </button>
        </form>
    )
}