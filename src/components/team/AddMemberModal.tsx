import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useLocation, useNavigate } from 'react-router-dom';
import AddMemberForm from './AddMemberForm';

export default function AddMemberModal() {

    const location = useLocation()
    const navigate = useNavigate()

    const queryParams = new URLSearchParams(location.search);
    const addMember = queryParams.get('addMember');
    const show = addMember ? true : false

    return (
        <>
            <Transition appear show={show} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => navigate(location.pathname, { replace: true })}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        {/* Backdrop con desenfoque de cristal (Glassmorphism) */}
                        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md sm:max-w-lg transform rounded-2xl sm:rounded-3xl bg-[#1e293b] text-left align-middle shadow-2xl transition-all p-4 sm:p-8 border border-slate-700 relative max-h-[90vh] overflow-y-auto">
                                    
                                    {/* Acento estético de red */}
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>

                                    <Dialog.Title
                                        as="h3"
                                        className="font-black text-2xl sm:text-4xl text-white my-3 sm:my-5 tracking-tight"
                                    >
                                        Agregar <span className="text-cyan-500">Integrante</span>
                                    </Dialog.Title>

                                    <p className="text-base sm:text-xl font-light text-slate-400">
                                        Agrega un nuevo integrante por email o nombre para <span className="text-cyan-500 font-bold uppercase tracking-wider">sincronizarlo</span> al proyecto
                                    </p>

                                    <div className="mt-10">
                                        {/* El formulario heredará el estilo técnico si aplicamos los inputs oscuros */}
                                        <AddMemberForm />
                                    </div>
                                    
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    )
}