import { Link, Outlet, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Logo from '@/components/Logo'
import NavMenu from '@/components/NavMenu'
import { useAuth } from '@/hooks/useAuth'

export default function AppLayout() {

    const { data, isError, isLoading } = useAuth()
    if(isLoading) return 'Cargando...'
    if(isError) {
        return <Navigate to='/auth/login' />
    }

    if(data) return (
        <>
            <header className='bg-gray-800 py-3 lg:py-5'>
                <div className='max-w-screen-2xl mx-auto px-4 flex justify-between items-center gap-4'>
                    <Link to={'/'}>
                        <Logo />
                    </Link>

                    <NavMenu 
                        name={data.name}
                    />
                </div>
            </header>

            <section className='max-w-screen-2xl mx-auto mt-10 p-5'>
                <Outlet />
            </section>

            <footer className='py-5'>
                <p className='text-center'>
                    Todos los derechos reservados {new Date().getFullYear()}
                </p>
            </footer>

            <ToastContainer
                pauseOnHover={false}
                pauseOnFocusLoss={false}
            />
        </>
    )
}
