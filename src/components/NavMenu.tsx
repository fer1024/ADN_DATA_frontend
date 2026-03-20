import { Fragment } from 'react'
import { Popover, Transition } from '@headlessui/react'
import { Bars3Icon } from '@heroicons/react/20/solid'
import { Link, useNavigate } from 'react-router-dom'
import { User } from '../types'
import { useQueryClient } from '@tanstack/react-query'

type NavMenuProps = {
  name: User['name']
}

export default function NavMenu({ name }: NavMenuProps) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const logout = () => {
    localStorage.removeItem('AUTH_TOKEN')
    queryClient.clear() // limpia todo el cache — evita que datos del usuario anterior persistan
    navigate('/auth/login')
  }

  return (
    <Popover className="relative">
      <Popover.Button className="inline-flex items-center justify-center p-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 transition-all shadow-lg shadow-cyan-900/20 active:scale-95 outline-none">
        <Bars3Icon className='w-7 h-7 text-white' />
      </Popover.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <Popover.Panel className="absolute right-0 sm:right-0 z-50 mt-2 w-56 sm:w-64">
          <div className="shrink rounded-xl bg-[#1e293b] p-4 text-sm font-semibold leading-6 text-slate-300 shadow-2xl border border-slate-700 ring-1 ring-black/5">
            <p className='text-center border-b border-slate-700 pb-2 mb-2 text-white font-black uppercase text-xs tracking-widest'>
              Usuario: <span className='text-cyan-500'>{name}</span>
            </p>
            <Link to='/profile' className='block p-2 rounded-md hover:bg-slate-800 hover:text-cyan-400 transition-colors'>
              Mi Perfil
            </Link>
            <Link to='/' className='block p-2 rounded-md hover:bg-slate-800 hover:text-cyan-400 transition-colors'>
              Mis Proyectos
            </Link>
            <button
              className='w-full text-left block p-2 rounded-md hover:bg-red-500/10 hover:text-red-400 transition-colors mt-2 border-t border-slate-700 pt-2'
              type='button'
              onClick={logout}
            >
              Cerrar Sesión
            </button>
          </div>
        </Popover.Panel>
      </Transition>
    </Popover>
  )
}