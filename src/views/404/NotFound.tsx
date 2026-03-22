import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-6">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-32 h-32 rounded-2xl bg-slate-800/80 border-2 border-slate-700 flex items-center justify-center p-3">
            <img 
              src="/screen.png" 
              alt="ADN DATA" 
              className="w-full h-full object-contain"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-6xl font-black text-cyan-500">404</p>
          <h1 className="font-black text-2xl sm:text-3xl text-white">Página No Encontrada</h1>
        </div>
        
        <p className="text-slate-400 text-sm sm:text-base max-w-md mx-auto">
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>
        
        <Link 
          to={'/'}
          className="inline-block mt-4 px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-colors"
        >
          Volver a Proyectos
        </Link>
      </div>
    </div>
  )
}
