import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'
import { TaskPhase, DatasetFormData, ExperimentFormData, DecisionFormData } from '@/types/index'
import {
    getDatasets, createDataset, deleteDataset,
    getExperiments, createExperiment, deleteExperiment,
    getDecisions, createDecision, deleteDecision
} from '@/api/TraceabilityAPI'

type Tab = 'datasets' | 'experiments' | 'decisions'

type Props = {
    projectId: string
    phase: TaskPhase
    accentColor: string
}

const inputClass = "w-full p-2.5 bg-[#0a0f1d] border border-slate-700 rounded-lg text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
const labelClass = "text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1 block"

// ── Dataset Form ──────────────────────────────────────────────────────────
function DatasetForm({ projectId, phase, onDone }: { projectId: string; phase: TaskPhase; onDone: () => void }) {
    const qc = useQueryClient()
    const { register, handleSubmit, reset, formState: { errors } } = useForm<DatasetFormData>({
        defaultValues: { name: '', source: '', description: '', records: 0, acquisitionDate: '', phase }
    })
    const { mutate } = useMutation({
        mutationFn: createDataset,
        onError: (e) => toast.error(e.message),
        onSuccess: (data) => {
            toast.success(data as string)
            qc.invalidateQueries({ queryKey: ['datasets', projectId, phase] })
            reset()
            onDone()
        }
    })
    return (
        <form onSubmit={handleSubmit(fd => mutate({ projectId, formData: { ...fd, phase } }))} className="space-y-2 mt-3 border-t border-slate-800 pt-3">
            <div><label className={labelClass}>Nombre</label><input className={inputClass} placeholder="Ej: Dataset ventas Q1 2024" {...register('name', { required: true })} />{errors.name && <p className="text-red-400 text-[10px] mt-0.5">Requerido</p>}</div>
            <div><label className={labelClass}>Fuente</label><input className={inputClass} placeholder="URL, ruta o descripción de origen" {...register('source', { required: true })} />{errors.source && <p className="text-red-400 text-[10px] mt-0.5">Requerido</p>}</div>
            <div><label className={labelClass}>Descripción</label><textarea className={inputClass + ' resize-none min-h-[60px]'} placeholder="Qué contiene, formato, variables clave..." {...register('description', { required: true })} />{errors.description && <p className="text-red-400 text-[10px] mt-0.5">Requerido</p>}</div>
            <div className="grid grid-cols-2 gap-2">
                <div><label className={labelClass}>Registros</label><input type="number" className={inputClass} {...register('records')} /></div>
                <div><label className={labelClass}>Fecha adquisición</label><input type="date" className={inputClass} {...register('acquisitionDate', { required: true })} /></div>
            </div>
            <div className="flex gap-2 pt-1">
                <button type="submit" className="flex-1 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg transition-colors">Guardar</button>
                <button type="button" onClick={onDone} className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs rounded-lg transition-colors">Cancelar</button>
            </div>
        </form>
    )
}

// ── Experiment Form ───────────────────────────────────────────────────────
function ExperimentForm({ projectId, phase, onDone }: { projectId: string; phase: TaskPhase; onDone: () => void }) {
    const qc = useQueryClient()
    const { register, handleSubmit, reset, formState: { errors } } = useForm<ExperimentFormData>({
        defaultValues: { name: '', algorithmModel: '', parameters: '', metric: '', result: '', conclusion: '', phase }
    })
    const { mutate } = useMutation({
        mutationFn: createExperiment,
        onError: (e) => toast.error(e.message),
        onSuccess: (data) => {
            toast.success(data as string)
            qc.invalidateQueries({ queryKey: ['experiments', projectId, phase] })
            reset()
            onDone()
        }
    })
    return (
        <form onSubmit={handleSubmit(fd => mutate({ projectId, formData: { ...fd, phase } }))} className="space-y-2 mt-3 border-t border-slate-800 pt-3">
            <div><label className={labelClass}>Nombre del experimento</label><input className={inputClass} placeholder="Ej: Baseline RandomForest v1" {...register('name', { required: true })} />{errors.name && <p className="text-red-400 text-[10px] mt-0.5">Requerido</p>}</div>
            <div><label className={labelClass}>Modelo usado</label><input className={inputClass} placeholder="Ej: RandomForestClassifier" {...register('algorithmModel', { required: true })} /></div>
            <div><label className={labelClass}>Parámetros</label><input className={inputClass} placeholder="Ej: n_estimators=100, max_depth=5" {...register('parameters', { required: true })} /></div>
            <div className="grid grid-cols-2 gap-2">
                <div><label className={labelClass}>Métrica</label><input className={inputClass} placeholder="Ej: F1-Score" {...register('metric', { required: true })} /></div>
                <div><label className={labelClass}>Resultado</label><input className={inputClass} placeholder="Ej: 0.87" {...register('result', { required: true })} /></div>
            </div>
            <div><label className={labelClass}>Conclusión</label><textarea className={inputClass + ' resize-none min-h-[60px]'} placeholder="Qué aprendiste de este experimento..." {...register('conclusion', { required: true })} /></div>
            <div className="flex gap-2 pt-1">
                <button type="submit" className="flex-1 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg transition-colors">Guardar</button>
                <button type="button" onClick={onDone} className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs rounded-lg transition-colors">Cancelar</button>
            </div>
        </form>
    )
}

// ── Decision Form ─────────────────────────────────────────────────────────
function DecisionForm({ projectId, phase, onDone }: { projectId: string; phase: TaskPhase; onDone: () => void }) {
    const qc = useQueryClient()
    const { register, handleSubmit, reset, formState: { errors } } = useForm<DecisionFormData>({
        defaultValues: { description: '', justification: '', alternatives: '', phase }
    })
    const { mutate } = useMutation({
        mutationFn: createDecision,
        onError: (e) => toast.error(e.message),
        onSuccess: (data) => {
            toast.success(data as string)
            qc.invalidateQueries({ queryKey: ['decisions', projectId, phase] })
            reset()
            onDone()
        }
    })
    return (
        <form onSubmit={handleSubmit(fd => mutate({ projectId, formData: { ...fd, phase } }))} className="space-y-2 mt-3 border-t border-slate-800 pt-3">
            <div><label className={labelClass}>Decisión tomada</label><textarea className={inputClass + ' resize-none min-h-[60px]'} placeholder="Describe la decisión técnica tomada..." {...register('description', { required: true })} />{errors.description && <p className="text-red-400 text-[10px] mt-0.5">Requerido</p>}</div>
            <div><label className={labelClass}>Justificación</label><textarea className={inputClass + ' resize-none min-h-[60px]'} placeholder="Por qué se tomó esta decisión..." {...register('justification', { required: true })} /></div>
            <div><label className={labelClass}>Alternativas consideradas (opcional)</label><textarea className={inputClass + ' resize-none min-h-[50px]'} placeholder="Qué otras opciones se evaluaron..." {...register('alternatives')} /></div>
            <div className="flex gap-2 pt-1">
                <button type="submit" className="flex-1 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg transition-colors">Guardar</button>
                <button type="button" onClick={onDone} className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs rounded-lg transition-colors">Cancelar</button>
            </div>
        </form>
    )
}

// ── Main Panel ────────────────────────────────────────────────────────────
export default function TraceabilityPanel({ projectId, phase, accentColor }: Props) {
    const [activeTab, setActiveTab] = useState<Tab>('datasets')
    const [showForm, setShowForm] = useState(false)
    const qc = useQueryClient()

    const { data: datasets = [] } = useQuery({ queryKey: ['datasets', projectId, phase], queryFn: () => getDatasets({ projectId, phase }) })
    const { data: experiments = [] } = useQuery({ queryKey: ['experiments', projectId, phase], queryFn: () => getExperiments({ projectId, phase }) })
    const { data: decisions = [] } = useQuery({ queryKey: ['decisions', projectId, phase], queryFn: () => getDecisions({ projectId, phase }) })

    const { mutate: delDataset } = useMutation({ mutationFn: deleteDataset, onSuccess: () => { toast.success('Eliminado'); qc.invalidateQueries({ queryKey: ['datasets', projectId, phase] }) } })
    const { mutate: delExperiment } = useMutation({ mutationFn: deleteExperiment, onSuccess: () => { toast.success('Eliminado'); qc.invalidateQueries({ queryKey: ['experiments', projectId, phase] }) } })
    const { mutate: delDecision } = useMutation({ mutationFn: deleteDecision, onSuccess: () => { toast.success('Eliminado'); qc.invalidateQueries({ queryKey: ['decisions', projectId, phase] }) } })

    const tabs: { key: Tab; label: string; count: number }[] = [
        { key: 'datasets',    label: 'Datasets',    count: datasets.length },
        { key: 'experiments', label: 'Experimentos', count: experiments.length },
        { key: 'decisions',   label: 'Decisiones',  count: decisions.length },
    ]

    return (
        <div className="flex flex-col h-full" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: accentColor }}>
                    Trazabilidad
                </p>
                <button
                    onClick={() => setShowForm(f => !f)}
                    className="text-[10px] font-bold px-2.5 py-1 rounded-lg transition-colors"
                    style={{ background: `${accentColor}22`, color: accentColor }}
                >
                    {showForm ? '✕ Cancelar' : '+ Registrar'}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1.5 mb-3">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => { setActiveTab(tab.key); setShowForm(false) }}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                            activeTab === tab.key
                                ? 'text-white shadow-md'
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
                        }`}
                        style={activeTab === tab.key
                            ? { background: accentColor, color: '#ffffff' }
                            : {}
                        }
                    >
                        {tab.label}
                        {tab.count > 0 && (
                            <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] bg-black/20">
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Form */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        {activeTab === 'datasets'    && <DatasetForm    projectId={projectId} phase={phase} onDone={() => setShowForm(false)} />}
                        {activeTab === 'experiments' && <ExperimentForm projectId={projectId} phase={phase} onDone={() => setShowForm(false)} />}
                        {activeTab === 'decisions'   && <DecisionForm   projectId={projectId} phase={phase} onDone={() => setShowForm(false)} />}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Lista */}
            <div className="flex-1 overflow-y-auto space-y-2 mt-1 pr-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">

                {activeTab === 'datasets' && (
                    datasets.length === 0
                        ? <p className="text-slate-400 text-xs text-center py-6">Sin datasets registrados</p>
                        : datasets.map(d => (
                            <div key={d._id} className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-2.5">
                                <div className="flex justify-between items-start gap-2">
                                    <p className="text-sm font-bold text-white">{d.name}</p>
                                    <button onClick={() => delDataset({ projectId, id: d._id })} className="text-slate-600 hover:text-red-400 transition-colors text-[10px] flex-shrink-0">✕</button>
                                </div>
                                <p className="text-xs text-slate-300 mt-0.5">{d.source}</p>
                                <p className="text-xs text-white mt-1">{d.description}</p>
                                <div className="flex gap-3 mt-1.5">
                                    <span className="text-[10px] text-slate-400">{d.records.toLocaleString()} registros</span>
                                    <span className="text-[10px] text-slate-400">{d.acquisitionDate}</span>
                                    <span className="text-[10px] text-slate-400">por {d.createdBy.name}</span>
                                </div>
                            </div>
                        ))
                )}

                {activeTab === 'experiments' && (
                    experiments.length === 0
                        ? <p className="text-slate-400 text-xs text-center py-6">Sin experimentos registrados</p>
                        : experiments.map(e => (
                            <div key={e._id} className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-2.5">
                                <div className="flex justify-between items-start gap-2">
                                    <p className="text-sm font-bold text-white">{e.name}</p>
                                    <button onClick={() => delExperiment({ projectId, id: e._id })} className="text-slate-600 hover:text-red-400 transition-colors text-[10px] flex-shrink-0">✕</button>
                                </div>
                                <div className="flex gap-2 mt-1 flex-wrap">
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">{e.algorithmModel}</span>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">{e.metric}: {e.result}</span>
                                </div>
                                <p className="text-xs text-slate-300 mt-1">{e.parameters}</p>
                                <p className="text-xs text-white mt-1">{e.conclusion}</p>
                                <p className="text-[10px] text-slate-400 mt-1">por {e.createdBy.name}</p>
                            </div>
                        ))
                )}

                {activeTab === 'decisions' && (
                    decisions.length === 0
                        ? <p className="text-slate-400 text-xs text-center py-6">Sin decisiones registradas</p>
                        : decisions.map(d => (
                            <div key={d._id} className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-2.5">
                                <div className="flex justify-between items-start gap-2">
                                    <p className="text-sm font-bold text-white">{d.description}</p>
                                    <button onClick={() => delDecision({ projectId, id: d._id })} className="text-slate-600 hover:text-red-400 transition-colors text-[10px] flex-shrink-0">✕</button>
                                </div>
                                <p className="text-xs text-white mt-1"><span className="text-slate-400 font-bold">Justificación:</span> {d.justification}</p>
                                {d.alternatives && <p className="text-xs text-slate-300 mt-1"><span className="font-bold">Alternativas:</span> {d.alternatives}</p>}
                                <p className="text-[10px] text-slate-400 mt-1">por {d.createdBy.name}</p>
                            </div>
                        ))
                )}
            </div>
        </div>
    )
}