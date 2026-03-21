import { useState, useEffect, useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import { searchTeamMembers } from '@/api/TeamAPI'
import { SearchUser } from '@/types/index'
import { useParams } from 'react-router-dom'

type UserAutocompleteProps = {
    value: string
    onChange: (value: string) => void
}

export default function UserAutocomplete({ value, onChange }: UserAutocompleteProps) {
    const params = useParams()
    const projectId = params.projectId!
    const [query, setQuery] = useState('')
    const [showDropdown, setShowDropdown] = useState(false)
    const [users, setUsers] = useState<SearchUser[]>([])
    const inputRef = useRef<HTMLInputElement>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const { mutate } = useMutation({
        mutationFn: (q: string) => searchTeamMembers(projectId, q),
        onSuccess: (data) => {
            setUsers(data || [])
            setShowDropdown(true)
        }
    })

    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.length >= 2) {
                mutate(query)
            } else {
                setUsers([])
                setShowDropdown(false)
            }
        }, 300)
        return () => clearTimeout(timer)
    }, [query])

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
                inputRef.current && !inputRef.current.contains(e.target as Node)) {
                setShowDropdown(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleSelect = (user: SearchUser) => {
        onChange(user._id)
        setQuery(user.name)
        setShowDropdown(false)
    }

    const handleClear = () => {
        onChange('')
        setQuery('')
        setUsers([])
    }

    return (
        <div className="relative">
            <div className="flex gap-2">
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => users.length > 0 && setShowDropdown(true)}
                    placeholder="Buscar por nombre o email..."
                    className="flex-1 w-full p-4 bg-[#0f172a] border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition-all"
                />
                {value && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors"
                    >
                        ✕
                    </button>
                )}
            </div>

            {showDropdown && users.length > 0 && (
                <div
                    ref={dropdownRef}
                    className="absolute z-50 w-full mt-2 bg-[#1e293b] border border-slate-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto"
                >
                    {users.map(user => (
                        <button
                            key={user._id}
                            type="button"
                            onClick={() => handleSelect(user)}
                            className="w-full text-left px-4 py-3 hover:bg-slate-700 transition-colors border-b border-slate-700 last:border-b-0"
                        >
                            <p className="text-white font-medium">{user.name}</p>
                            <p className="text-slate-400 text-sm">{user.email}</p>
                        </button>
                    ))}
                </div>
            )}

            {query.length >= 2 && users.length === 0 && showDropdown && (
                <div className="absolute z-50 w-full mt-2 bg-[#1e293b] border border-slate-700 rounded-xl shadow-2xl p-4">
                    <p className="text-slate-400 text-center">No se encontraron usuarios</p>
                </div>
            )}
        </div>
    )
}
