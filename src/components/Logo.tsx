import { motion } from "framer-motion";

type LogoProps = {
  variant?: 'auth' | 'app'
}

export default function Logo({ variant = 'app' }: LogoProps) {
  const sizeClasses = variant === 'auth' 
    ? 'max-w-[150px] sm:max-w-[200px] md:max-w-[350px] lg:max-w-[450px]'
    : 'max-w-[100px] sm:max-w-[150px] md:max-w-[200px] lg:max-w-[250px]'

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
            className={`w-full ${sizeClasses} rounded-lg shadow-inner`}
          />
        </div>
      </motion.div>
    </div>
  )
}