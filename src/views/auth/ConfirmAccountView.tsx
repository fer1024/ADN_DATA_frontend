import { useRef, useState, KeyboardEvent, ClipboardEvent } from 'react'
import { Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { confirmAccount } from '@/api/AuthAPI'
import { toast } from 'react-toastify'

export default function ConfirmAccountView() {
    const [digits, setDigits] = useState<string[]>(Array(6).fill(''))
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    const { mutate } = useMutation({
        mutationFn: confirmAccount,
        onError: (error) => toast.error(error.message),
        onSuccess: (data) => toast.success(data)
    })

    const updateToken = (newDigits: string[]) => {
        const joined = newDigits.join('')
        if (joined.length === 6) mutate({ token: joined })
    }

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return
        const newDigits = [...digits]
        newDigits[index] = value.slice(-1)
        setDigits(newDigits)
        updateToken(newDigits)
        if (value && index < 5) inputRefs.current[index + 1]?.focus()
    }

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !digits[index] && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }
    }

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault()
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
        const newDigits = Array(6).fill('')
        pasted.split('').forEach((char, i) => { newDigits[i] = char })
        setDigits(newDigits)
        updateToken(newDigits)
        inputRefs.current[Math.min(pasted.length, 5)]?.focus()
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f172a] p-4">
            <div className="w-full max-w-xs sm:max-w-md">

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
                            Confirma tu cuenta
                        </h2>
                        <p className="text-slate-400 text-sm mb-6">
                            Ingresa el código de 6 dígitos que recibiste por email
                        </p>

                        <label className="text-sm font-medium text-slate-300 ml-1 block mb-4">
                            Código de verificación
                        </label>
                        <div className="flex justify-center gap-2 sm:gap-3 mb-6">
                            {digits.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={el => inputRefs.current[index] = el}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={e => handleChange(index, e.target.value)}
                                    onKeyDown={e => handleKeyDown(index, e)}
                                    onPaste={handlePaste}
                                    className="w-9 h-10 sm:w-11 sm:h-12 text-center text-lg sm:text-xl font-bold bg-[#0f172a] border border-slate-700 rounded-lg text-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all caret-cyan-500"
                                />
                            ))}
                        </div>
                    </div>

                    <div className="bg-[#2d3a4f]/30 p-4 border-t border-slate-700/50">
                        <nav className="flex flex-col space-y-2 text-sm text-center">
                            <Link
                                to='/auth/request-code'
                                className="text-slate-400 hover:text-cyan-400 transition-colors"
                            >
                                ¿No recibiste el código? <span className="font-semibold text-cyan-500">Solicitar nuevo</span>
                            </Link>
                            <Link
                                to='/auth/login'
                                className="text-slate-500 hover:text-slate-300 transition-colors text-xs"
                            >
                                Volver a Iniciar Sesión
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