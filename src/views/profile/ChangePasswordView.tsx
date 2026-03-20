import { useForm } from "react-hook-form"
import ErrorMessage from "@/components/ErrorMessage"
import { UpdateCurrentUserPasswordForm } from "@/types/index";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { changePassword } from "@/api/ProfileAPI";
import { motion } from "framer-motion";

export default function ChangePasswordView() {
  const initialValues : UpdateCurrentUserPasswordForm = {
    current_password: '',
    password: '',
    password_confirmation: ''
  }

  const { register, handleSubmit, watch, formState: { errors } } = useForm({ defaultValues: initialValues })

  const { mutate } = useMutation({
      mutationFn: changePassword,
      onError: (error) => toast.error(error.message),
      onSuccess: (data)  => toast.success(data)
  })

  const password = watch('password');
  const handleChangePassword = (formData : UpdateCurrentUserPasswordForm) => mutate(formData)

  return (
    <>
      <div className="mx-auto max-w-3xl">
        <header>
          <h1 className="text-5xl font-black text-black tracking-tight">
            Seguridad de <span className="text-cyan-500">Acceso</span>
          </h1>
          <h2 className="text-2xl font-light text-slate-400 mt-5">
            Utiliza este formulario para <span className="text-cyan-500/80 font-bold">actualizar tu clave</span>
          </h2>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative group mt-14"
        >
          {/* Capa de resplandor (Glow) tecnológica */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur opacity-10 group-hover:opacity-25 transition duration-500"></div>

          <form
            onSubmit={handleSubmit(handleChangePassword)}
            className="relative space-y-8 bg-[#1e293b] shadow-2xl p-10 rounded-2xl border border-slate-700/50"
            noValidate
          >
            <div className="space-y-3">
              <label
                className="text-sm uppercase font-bold text-slate-300 ml-1 tracking-widest"
                htmlFor="current_password"
              >Password Actual</label>
              <input
                id="current_password"
                type="password"
                placeholder="Password Actual"
                className="w-full p-3 bg-[#0f172a] border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                {...register("current_password", {
                  required: "El password actual es obligatorio",
                })}
              />
              {errors.current_password && (
                <ErrorMessage>{errors.current_password.message}</ErrorMessage>
              )}
            </div>

            <div className="space-y-3">
              <label
                className="text-sm uppercase font-bold text-slate-300 ml-1 tracking-widest"
                htmlFor="password"
              >Nuevo Password</label>
              <input
                id="password"
                type="password"
                placeholder="Nuevo Password"
                className="w-full p-3 bg-[#0f172a] border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                {...register("password", {
                  required: "El Nuevo Password es obligatorio",
                  minLength: {
                    value: 8,
                    message: 'El Password debe ser mínimo de 8 caracteres'
                  }
                })}
              />
              {errors.password && (
                <ErrorMessage>{errors.password.message}</ErrorMessage>
              )}
            </div>

            <div className="space-y-3">
              <label
                htmlFor="password_confirmation"
                className="text-sm uppercase font-bold text-slate-300 ml-1 tracking-widest"
              >Repetir Password</label>

              <input
                id="password_confirmation"
                type="password"
                placeholder="Repetir Password"
                className="w-full p-3 bg-[#0f172a] border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                {...register("password_confirmation", {
                  required: "Este campo es obligatorio",
                  validate: value => value === password || 'Los Passwords no son iguales'
                })}
              />
              {errors.password_confirmation && (
                <ErrorMessage>{errors.password_confirmation.message}</ErrorMessage>
              )}
            </div>

            <input
              type="submit"
              value='Cambiar Password'
              className="bg-cyan-600 hover:bg-cyan-500 w-full p-4 text-white uppercase font-black text-xl cursor-pointer transition-all rounded-xl shadow-lg shadow-cyan-900/20 active:scale-[0.98] mt-4"
            />
          </form>
        </motion.div>

        <div className="mt-10 flex items-center justify-center gap-2">
          <div className="h-1 w-1 bg-cyan-500 rounded-full animate-pulse"></div>
          <p className="text-slate-500 text-[10px] uppercase tracking-[0.3em]">
            ADN_DATA Encryption Protocol: <span className="text-slate-400">AES-256 Enabled</span>
          </p>
        </div>
      </div>
    </>
  )
}