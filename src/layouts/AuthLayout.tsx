import Logo from '@/components/Logo'
import { Outlet } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'

export default function AuthLayout() {
  return (
    <>
        <div className='bg-gray-800 min-h-screen flex items-center justify-center'>
            <div className='w-full max-w-md px-4'>
                <Logo variant="auth" />
                <div className='mt-6'>
                    <Outlet />
                </div>
            </div>
        </div>
        <ToastContainer
            pauseOnHover={false}
            pauseOnFocusLoss={false}
        />
    </>
  )
}
