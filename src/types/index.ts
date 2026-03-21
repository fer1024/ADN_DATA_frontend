import { z } from 'zod'

/** Auth & Users */
const authSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    current_password: z.string(),
    password: z.string(),
    password_confirmation: z.string(),
    token: z.string()
})
type Auth = z.infer<typeof authSchema>
export type UserLoginForm = Pick<Auth, 'email' | 'password'>
export type UserRegistrationForm = Pick<Auth, 'name' | 'email' | 'password' | 'password_confirmation'>
export type RequestConfirmationCodeForm = Pick<Auth, 'email'>
export type ForgotPasswordForm = Pick<Auth, 'email'>
export type NewPasswordForm = Pick<Auth, 'password' | 'password_confirmation'>
export type UpdateCurrentUserPasswordForm = Pick<Auth, 'current_password' | 'password' | 'password_confirmation'>
export type ConfirmToken = Pick<Auth, 'token'>
export type CheckPasswordForm = Pick<Auth, 'password'>

/** Users */
export const userSchema = authSchema.pick({ name: true, email: true }).extend({ _id: z.string() })
export type User = z.infer<typeof userSchema>
export type UserProfileForm = Pick<User, 'name' | 'email'>

export const searchUserSchema = z.object({
    _id: z.string(),
    name: z.string(),
    email: z.string(),
    confirmed: z.boolean()
})
export type SearchUser = z.infer<typeof searchUserSchema>

/** Notes */
const noteSchema = z.object({
    _id: z.string(),
    content: z.string(),
    createdBy: userSchema,
    task: z.string(),
    createdAt: z.string()
})
export type Note = z.infer<typeof noteSchema>
export type NoteFormData = Pick<Note, 'content'>

/** Tasks */
export const taskStatusSchema = z.enum(['pending', 'onHold', 'inProgress', 'underReview', 'completed'])
export type TaskStatus = z.infer<typeof taskStatusSchema>

export const taskPhaseSchema = z.enum([
    'business', 'data_understanding', 'data_preparation',
    'modeling', 'evaluation', 'deployment'
])
export type TaskPhase = z.infer<typeof taskPhaseSchema>

export const taskSchema = z.object({
    _id: z.string(),
    name: z.string(),
    description: z.string(),
    project: z.string(),
    phase: taskPhaseSchema,
    status: taskStatusSchema,
    completed: z.boolean().default(false),
    assignedTo: z.union([userSchema, z.string()]).nullable().optional(),
    startedAt: z.string().nullable().optional(),
    finishedAt: z.string().nullable().optional(),
    completedBy: z.array(z.object({
        _id: z.string(),
        user: userSchema,
        status: taskStatusSchema
    })),
    notes: z.array(noteSchema.extend({ createdBy: userSchema })),
    createdAt: z.string(),
    updatedAt: z.string()
})

export const taskProjectSchema = taskSchema.pick({
    _id: true,
    name: true,
    description: true,
    phase: true,
    status: true,
    completed: true
}).extend({
    assignedTo: z.union([userSchema, z.string()]).nullable().optional(),
    startedAt: z.string().nullable().optional(),
    finishedAt: z.string().nullable().optional(),
})

export type Task = z.infer<typeof taskSchema>

// Sin cambios — usado en EditTaskModal
export type TaskFormData = Pick<Task, 'name' | 'description'>

// Para creacion de tareas
export const taskCreateFormDataSchema = z.object({
    name: z.string(),
    description: z.string(),
    phase: taskPhaseSchema,
    assignedTo: z.string().optional().default('')
})
export type TaskCreateFormData = z.infer<typeof taskCreateFormDataSchema>

export type TaskProject = z.infer<typeof taskProjectSchema>

/** Projects */
export const projectSchema = z.object({
    _id: z.string(),
    projectName: z.string(),
    clientName: z.string(),
    description: z.string(),
    manager: z.string(userSchema.pick({ _id: true })),
    tasks: z.array(taskProjectSchema),
    team: z.array(z.string(userSchema.pick({ _id: true })))
})
export const dashboardProjectSchema = z.array(
    projectSchema.pick({ _id: true, projectName: true, clientName: true, description: true, manager: true })
)
export const editProjectSchema = projectSchema.pick({ projectName: true, clientName: true, description: true })
export type Project = z.infer<typeof projectSchema>
export type ProjectFormData = Pick<Project, 'clientName' | 'projectName' | 'description'>

/** Team */
const teamMemberSchema = userSchema.pick({ name: true, email: true, _id: true })
export const teamMembersSchema = z.array(teamMemberSchema)
export type TeamMember = z.infer<typeof teamMemberSchema>
export type TeamMemberForm = Pick<TeamMember, 'email'>

/** Traceability */
export const datasetSchema = z.object({
    _id: z.string(),
    name: z.string(),
    source: z.string(),
    description: z.string(),
    records: z.number().default(0),
    acquisitionDate: z.string(),
    phase: taskPhaseSchema,
    project: z.string(),
    createdBy: userSchema,
    createdAt: z.string(),
})
export const datasetsSchema = z.array(datasetSchema)
export type Dataset = z.infer<typeof datasetSchema>
export type DatasetFormData = Pick<Dataset, 'name' | 'source' | 'description' | 'records' | 'acquisitionDate' | 'phase'>

export const experimentSchema = z.object({
    _id: z.string(),
    name: z.string(),
    algorithmModel: z.string(),
    parameters: z.string(),
    metric: z.string(),
    result: z.string(),
    conclusion: z.string(),
    phase: taskPhaseSchema,
    project: z.string(),
    createdBy: userSchema,
    createdAt: z.string(),
})
export const experimentsSchema = z.array(experimentSchema)
export type Experiment = z.infer<typeof experimentSchema>
export type ExperimentFormData = Pick<Experiment, 'name' | 'algorithmModel' | 'parameters' | 'metric' | 'result' | 'conclusion' | 'phase'>

export const decisionSchema = z.object({
    _id: z.string(),
    description: z.string(),
    justification: z.string(),
    alternatives: z.string().optional().default(''),
    phase: taskPhaseSchema,
    project: z.string(),
    createdBy: userSchema,
    createdAt: z.string(),
})
export const decisionsSchema = z.array(decisionSchema)
export type Decision = z.infer<typeof decisionSchema>
export type DecisionFormData = Pick<Decision, 'description' | 'justification' | 'alternatives' | 'phase'>
