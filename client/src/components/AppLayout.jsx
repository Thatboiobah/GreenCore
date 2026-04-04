import Sidebar from './Sidebar'

const AppLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-[#f6f8f7] overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        {children}
      </main>
    </div>
  )
}

export default AppLayout
