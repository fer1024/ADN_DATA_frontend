import { Task } from "@/types/index";
import AddNoteForm from "./AddNoteForm";
import NoteDetail from "./NoteDetail";

type NotesPanelProps = {
    notes: Task['notes']
}

export default function NotesPanel({notes} : NotesPanelProps) {
  return (
    <>
        <AddNoteForm />

        <div className="divide-y divide-slate-700/50 mt-6">
            {notes.length ? (
                <>
                    <p className="font-bold text-lg text-slate-400 my-4">Notas:</p>
                    {notes.map(note => <NoteDetail key={note._id} note={note} />)}
                </>
            ) : <p className="text-slate-500 text-center pt-3">No hay notas</p>}
        </div>

    </>
  )
}
