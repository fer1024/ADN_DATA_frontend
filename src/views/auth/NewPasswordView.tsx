import NewPasswordToken from "@/components/auth/NewPasswordToken"
import NewPasswordForm from "@/components/auth/NewPasswordForm"
import { useState } from "react"
import { ConfirmToken } from "@/types/index"
import { Link } from "react-router-dom"

export default function NewPasswordView() {
    const [token, setToken] = useState<ConfirmToken['token']>('')
    const [isValidToken, setIsValidToken] = useState(false)

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f172a] p-4">
            <div className="w-full max-w-xs sm:max-w-md">

                {/* Encabezado */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                        ADN <span className="text-cyan-500">DATA</span>
                    </h1>
                    <p className="text-slate-400 mt-2 font-medium">
                        Gestión y Administración de Datos
                    </p>
                </div>

                <div className="bg-[#1e293b] shadow-2xl rounded-2xl border border-slate-700/50 overflow-hidden">
                    <div className="p-3 sm:p-6">
                        <h2 className="text-xl font-semibold text-white mb-2">
                            Restablecer contraseña
                        </h2>
                        <p className="text-slate-400 text-sm mb-6">
                            {!isValidToken
                                ? 'Ingresa el código que recibiste por email'
                                : 'Crea tu nueva contraseña de acceso'
                            }
                        </p>

                        {!isValidToken
                            ? <NewPasswordToken token={token} setToken={setToken} setIsValidToken={setIsValidToken} />
                            : <NewPasswordForm token={token} />
                        }
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
                                to='/auth/register'
                                className="text-slate-500 hover:text-slate-300 transition-colors text-xs"
                            >
                                ¿No tienes cuenta? Regístrate
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