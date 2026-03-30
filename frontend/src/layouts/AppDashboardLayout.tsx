import { ReactNode } from "react";
import Sidebar from "./Sidebar";

interface Props {
  children: ReactNode;
  menuItems: any[];
}

const AppDashboardLayout = ({ children, menuItems }: Props) => {
  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar menuItems={menuItems} />

      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
};

export default AppDashboardLayout;