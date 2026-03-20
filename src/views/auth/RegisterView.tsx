import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useMutation } from '@tanstack/react-query'
import { UserRegistrationForm } from "@/types/index";
import ErrorMessage from "@/components/ErrorMessage";
import { createAccount } from "@/api/AuthAPI";
import { toast } from "react-toastify";

export default function RegisterView() {
  
  const initialValues: UserRegistrationForm = {
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  }

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<UserRegistrationForm>({ defaultValues: initialValues });

  const { mutate } = useMutation({
    mutationFn: createAccount,
    onError: (error) => {
        toast.error(error.message)
    },
    onSuccess: (data) => {
        toast.success(data)
        reset()
    }
  })

  const password = watch('password');

  const handleRegister = (formData: UserRegistrationForm) => mutate(formData)

  return (
    <>
      <div className="text-center">
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Crear <span className="text-cyan-500">Cuenta</span>
        </h1>
      </div>

      <form
        onSubmit={handleSubmit(handleRegister)}
        className="space-y-6 p-4 sm:p-10 bg-[#1e293b] mt-10 shadow-2xl rounded-2xl border border-slate-700/50"
        noValidate
      >
        <div className="flex flex-col gap-3">
          <label
            className="font-semibold text-xl text-slate-300 ml-1"
            htmlFor="email"
          >Email</label>
          <input
            id="email"
            type="email"
            placeholder="Email"
            className="w-full p-3 bg-[#0f172a] border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
            {...register("email", {
              required: "El Email  es obligatorio",
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

        <div className="flex flex-col gap-3">
          <label
            className="font-semibold text-xl text-slate-300 ml-1"
          >Nombre</label>
          <input
            type="name"
            placeholder="Nombre de Usuario"
            className="w-full p-3 bg-[#0f172a] border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
            {...register("name", {
              required: "El Nombre de usuario es obligatorio",
            })}
          />
          {errors.name && (
            <ErrorMessage>{errors.name.message}</ErrorMessage>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <label
            className="font-semibold text-xl text-slate-300 ml-1"
          >Password</label>

          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 bg-[#0f172a] border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
            {...register("password", {
              required: "El Password es obligatorio",
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

        <div className="flex flex-col gap-3">
          <label
            className="font-semibold text-xl text-slate-300 ml-1"
          >Repetir Password</label>

          <input
            id="password_confirmation"
            type="password"
            placeholder="Repite Password"
            className="w-full p-3 bg-[#0f172a] border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
            {...register("password_confirmation", {
              required: "Repetir Password es obligatorio",
              validate: value => value === password || 'Los Passwords no son iguales'
            })}
          />

          {errors.password_confirmation && (
            <ErrorMessage>{errors.password_confirmation.message}</ErrorMessage>
          )}
        </div>

        <input
          type="submit"
          value='Registrarme'
          className="bg-cyan-600 hover:bg-cyan-500 w-full p-3 text-white font-black text-xl cursor-pointer rounded-lg shadow-lg shadow-cyan-900/20 transition-all active:scale-[0.98] mt-4"
        />
      </form>

      <nav className="mt-10 flex flex-col space-y-4">
        <Link
          to={'/auth/login'}
          className="text-center text-slate-400 hover:text-cyan-500 transition-colors font-normal"
        >¿Ya tienes cuenta? Iniciar Sesión</Link>

        <Link
          to={'/auth/forgot-password'}
          className="text-center text-slate-500 hover:text-slate-300 transition-colors font-normal"
        >¿Olvidaste tu contraseña? Reestablecer</Link>
      </nav>
    </>
  )
}