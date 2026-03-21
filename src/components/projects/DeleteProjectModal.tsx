import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from "react-hook-form";
import ErrorMessage from "../ErrorMessage";
import { CheckPasswordForm } from '@/types/index';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { checkPassword } from '@/api/AuthAPI';
import { toast } from 'react-toastify';
import { deleteProject } from '@/api/ProjectAPI';

export default function DeleteProjectModal() {
    const initialValues: CheckPasswordForm = {
        password: ''
    }
    const location = useLocation()
    const navigate = useNavigate()

    const queryParams = new URLSearchParams(location.search);
    const deleteProjectId = queryParams.get('deleteProject')!;
    const show = !!deleteProjectId

    const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: initialValues })

    const queryClient = useQueryClient()

    const checkUserPasswordMutation = useMutation({
        mutationFn: checkPassword,
        onError: (error) => toast.error(error.message)
    })

    const deleteProjectMutation = useMutation({
        mutationFn: deleteProject,
        onError: (error) => toast.error(error.message),
        onSuccess: (data) => {
            toast.success(data)
            queryClient.invalidateQueries({ queryKey: ['projects'] })
            navigate(location.pathname, { replace: true })
        }
    })

    const handleForm = async (formData: CheckPasswordForm) => {
        await checkUserPasswordMutation.mutateAsync(formData)
        await deleteProjectMutation.mutateAsync(deleteProjectId)
    }

    return (
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
                    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm" />
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
                            <Dialog.Panel className="w-full max-w-md sm:max-w-2xl transform overflow-hidden rounded-2xl sm:rounded-3xl bg-[#0f172a] p-4 sm:p-12 text-left align-middle shadow-2xl transition-all border border-cyan-500/20">

                                <Dialog.Title
                                    as="h3"
                                    className="font-black text-2xl sm:text-4xl text-white my-3 sm:my-5"
                                >
                                    Eliminar <span className="text-cyan-500">Proyecto</span>
                                </Dialog.Title>

                                <p className="text-base sm:text-xl font-light text-slate-400">
                                    Esta acción es irreversible. Confirma colocando tu {''}
                                    <span className="text-cyan-500/80 font-bold italic">password</span>
                                </p>

                                <form
                                    className="mt-6 sm:mt-10 space-y-4 sm:space-y-8"
                                    onSubmit={handleSubmit(handleForm)}
                                    noValidate
                                >
                                    <div className="flex flex-col gap-2 sm:gap-3">
                                        <label
                                            className="font-normal text-base sm:text-2xl text-slate-300"
                                            htmlFor="password"
                                        >Password de confirmación</label>
                                        <input
                                            id="password"
                                            type="password"
                                            placeholder="Ingresa tu contraseña"
                                            className="w-full p-2 sm:p-4 bg-slate-800 border border-slate-700 rounded-lg sm:rounded-xl text-white focus:outline-none focus:border-cyan-500 transition-colors"
                                            {...register("password", {
                                                required: "El password es obligatorio para eliminar",
                                            })}
                                        />
                                        {errors.password && (
                                            <ErrorMessage>{errors.password.message}</ErrorMessage>
                                        )}
                                    </div>

                                    <input
                                        type="submit"
                                        className="bg-red-600 hover:bg-red-500 w-full p-2 sm:p-4 text-white uppercase font-black text-sm sm:text-xl cursor-pointer transition-all rounded-lg sm:rounded-xl shadow-lg active:scale-[0.98]"
                                        value='Eliminar Proyecto'
                                    />
                                    
                                    <button
                                        type="button"
                                        className="w-full text-slate-500 font-bold text-sm sm:text-base hover:text-slate-300 transition-colors"
                                        onClick={() => navigate(location.pathname, { replace: true })}
                                    >
                                        Cancelar y volver
                                    </button>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}