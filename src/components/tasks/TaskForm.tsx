import { FieldErrors, UseFormRegister } from "react-hook-form"
import { TaskFormData, TaskCreateFormData, TeamMember } from "@/types/index"
import ErrorMessage from "../ErrorMessage"

const crispDMPhases: { value: TaskCreateFormData['phase']; label: string }[] = [
    { value: 'business',          label: '01 · Business Understanding' },
    { value: 'data_understanding',label: '02 · Data Understanding' },
    { value: 'data_preparation',  label: '03 · Data Preparation' },
    { value: 'modeling',          label: '04 · Modeling' },
    { value: 'evaluation',        label: '05 · Evaluation' },
    { value: 'deployment',        label: '06 · Deployment' },
]

// Campos base — compartidos entre creacion y edicion
type BaseFieldsProps = {
    errors: FieldErrors<TaskFormData>
    register: UseFormRegister<TaskFormData>
}

function BaseFields({ errors, register }: BaseFieldsProps) {
    return (
        <>
            <div className="flex flex-col gap-3">
                <label className="font-bold text-sm uppercase text-slate-300 tracking-[0.15em] ml-1" htmlFor="name">
                    Identificador de Tarea
                </label>
                <input
                    id="name"
                    type="text"
                    placeholder="Ej: Análisis de Datasets 2024"
                    className="w-full p-4 bg-[#0f172a] border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition-all shadow-inner"
                    {...register("name", { required: "El nombre de la tarea es obligatorio" })}
                />
                {errors.name && <ErrorMessage>{errors.name.message}</ErrorMessage>}
            </div>

            <div className="flex flex-col gap-3">
                <label className="font-bold text-sm uppercase text-slate-300 tracking-[0.15em] ml-1" htmlFor="description">
                    Descripción del Proceso
                </label>
                <textarea
                    id="description"
                    placeholder="Describe los pasos técnicos o requerimientos..."
                    className="w-full p-4 bg-[#0f172a] border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition-all shadow-inner min-h-[120px] resize-none"
                    {...register("description", { required: "La descripción de la tarea es obligatoria" })}
                />
                {errors.description && <ErrorMessage>{errors.description.message}</ErrorMessage>}
            </div>
        </>
    )
}

// Export default: EditTaskModal — solo nombre y descripcion
type TaskFormProps = {
    errors: FieldErrors<TaskFormData>
    register: UseFormRegister<TaskFormData>
}
export default function TaskForm({ errors, register }: TaskFormProps) {
    return <BaseFields errors={errors} register={register} />
}

// Export nombrado: AddTaskModal — agrega fase y colaborador
type TaskCreateFormProps = {
    errors: FieldErrors<TaskCreateFormData>
    register: UseFormRegister<TaskCreateFormData>
    team: TeamMember[]
}
export function TaskCreateForm({ errors, register, team }: TaskCreateFormProps) {
    return (
        <>
            <BaseFields
                errors={errors as FieldErrors<TaskFormData>}
                register={register as unknown as UseFormRegister<TaskFormData>}
            />

            <div className="flex flex-col gap-3">
                <label className="font-bold text-sm uppercase text-slate-300 tracking-[0.15em] ml-1" htmlFor="phase">
                    Fase CRISP-DM
                </label>
                <select
                    id="phase"
                    className="w-full p-4 bg-[#0f172a] border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition-all cursor-pointer"
                    {...register("phase", { required: "La fase CRISP-DM es obligatoria" })}
                >
                    <option value="" className="bg-[#0f172a] text-slate-500">— Selecciona una fase —</option>
                    {crispDMPhases.map(p => (
                        <option key={p.value} value={p.value} className="bg-[#0f172a]">{p.label}</option>
                    ))}
                </select>
                {errors.phase && <ErrorMessage>{errors.phase.message}</ErrorMessage>}
            </div>

            <div className="flex flex-col gap-3">
                <label className="font-bold text-sm uppercase text-slate-300 tracking-[0.15em] ml-1" htmlFor="assignedTo">
                    Colaborador Asignado
                </label>
                <select
                    id="assignedTo"
                    className="w-full p-4 bg-[#0f172a] border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition-all cursor-pointer"
                    {...register("assignedTo")}
                >
                    <option value="" className="bg-[#0f172a] text-slate-500">— Sin asignar —</option>
                    {team.map(member => (
                        <option key={member._id} value={member._id} className="bg-[#0f172a]">
                            {member.name} · {member.email}
                        </option>
                    ))}
                </select>
                {errors.assignedTo && <ErrorMessage>{errors.assignedTo.message}</ErrorMessage>}
            </div>
        </>
    )
}