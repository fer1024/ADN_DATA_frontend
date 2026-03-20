import { Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useRef, useState, KeyboardEvent, ClipboardEvent } from 'react'
import { ConfirmToken } from '@/types/index'
import { validateToken } from '@/api/AuthAPI'
import { toast } from 'react-toastify'

type NewPasswordTokenProps = {
    token: ConfirmToken['token']
    setToken: React.Dispatch<React.SetStateAction<string>>
    setIsValidToken: React.Dispatch<React.SetStateAction<boolean>>
}

export default function NewPasswordToken({setToken, setIsValidToken }: NewPasswordTokenProps) {
    const [digits, setDigits] = useState<string[]>(Array(6).fill(''))
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    const { mutate } = useMutation({
        mutationFn: validateToken,
        onError: (error) => toast.error(error.message),
        onSuccess: (data) => {
            toast.success(data)
            setIsValidToken(true)
        }
    })

    const updateToken = (newDigits: string[]) => {
        const joined = newDigits.join('')
        setToken(joined)
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
        <div className="space-y-6">
            <div>
                <label className="text-sm font-medium text-slate-300 ml-1 block mb-4">
                    Código de 6 dígitos
                </label>
                <div className="flex justify-center gap-3">
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
                            className="w-11 h-12 text-center text-xl font-bold bg-[#0f172a] border border-slate-700 rounded-lg text-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all caret-cyan-500"
                        />
                    ))}
                </div>
            </div>

            <Link
                to='/auth/forgot-password'
                className="block text-center text-sm text-slate-500 hover:text-cyan-400 transition-colors"
            >
                Solicitar un nuevo código
            </Link>
        </div>
    )
}