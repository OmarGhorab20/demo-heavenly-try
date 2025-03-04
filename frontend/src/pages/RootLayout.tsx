import { Navigate, Outlet } from "react-router-dom";
import { Footer, Navbar } from "../components/LazyComponents";
import { useUserStore } from "../stores/useUserStore";

const RootLayout = () => {
  const { user } = useUserStore();
  
  if (!user) return <Navigate to="/login" replace />;

  return (
    <>
      <Navbar /> 
      <div className="w-full flex flex-col min-h-screen pt-20">
        <main className="flex-grow">
          <Outlet />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default RootLayout;