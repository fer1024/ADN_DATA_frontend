import { motion } from "framer-motion";

export default function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-8">
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { duration: 1.5, repeat: Infinity, ease: "linear" },
            scale: { duration: 0.8, repeat: Infinity, ease: "easeInOut" }
          }}
          className="relative"
        >
          <div className="w-24 h-24 border-4 border-slate-700 border-t-cyan-500 rounded-full" />
          <div className="absolute inset-0 flex items-center justify-center">
            <img 
              src="/screen.png" 
              alt="ADN DATA" 
              className="w-14 h-14 object-contain"
            />
          </div>
        </motion.div>
        
        <div className="flex flex-col items-center gap-3">
          <h1 className="text-2xl font-black text-white tracking-tight">
            ADN <span className="text-cyan-500">DATA</span>
          </h1>
          <motion.p 
            className="text-slate-400 text-sm font-medium"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Cargando...
          </motion.p>
        </div>
      </div>
    </div>
  );
}
