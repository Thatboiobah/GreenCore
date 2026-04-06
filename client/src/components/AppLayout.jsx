import Sidebar from './Sidebar'

const AppLayout = ({ children }) => {
  return (
    <div className="bg-white w-full min-h-screen flex">
      <Sidebar />
      <main className="flex-1 min-w-0 min-h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  )
}

export default AppLayout
