import Sidebar from './Sidebar'

const AppLayout = ({ children }) => {
  return (
    <div className="bg-white min-h-screen">
      <Sidebar />
      <main className="overflow-y-auto">
        {children}
      </main>
    </div>
  )
}

export default AppLayout
