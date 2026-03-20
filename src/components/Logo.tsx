import { motion } from "framer-motion";

export default function Logo() {
  return (
    <div className="flex justify-center items-center py-2">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ 
          y: -5, 
          transition: { duration: 0.2 } 
        }}
        className="relative group cursor-pointer"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl blur opacity-25 group-hover:opacity-60 transition duration-500"></div>
        <div className="relative bg-[#0f172a] p-1 rounded-xl border border-slate-700 group-hover:border-cyan-400/50 transition-colors duration-500">
          <img 
            src="/screen.png" 
            alt="Logotipo adn_data" 
            className="w-full max-w-[150px] sm:max-w-[200px] md:max-w-[350px] lg:max-w-[450px] rounded-lg shadow-inner"
          />
        </div>
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-cyan-600 text-[10px] text-white font-bold px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 uppercase tracking-tighter">
          Engine v1.0
        </div>
      </motion.div>
    </div>
  )
}