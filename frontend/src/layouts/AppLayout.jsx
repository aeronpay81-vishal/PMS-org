import { useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import { authAPI } from "../api/admin";

import Dashboard from "../modules/Dashboard";
import Projects from "../modules/Projects";
import Tasks from "../modules/Tasks";
import Team from "../modules/Team";
import SmartTime from "../modules/SmartTime/Index";
import Reports from "../modules/Reports";
import Aiinsight from "../modules/Aiinsight";
import Workflow from "../modules/Workflow";
import { Calender } from "../modules/Calender";
import { Automation } from "../modules/Automation";
import Settings from "../modules/Settings";
const AppLayout = ({ user, onLogout }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("Dashboard");
  const currentUser = user || authAPI.getStoredUser() || {};

  const renderModule = () => {
    switch (activeItem) {
      case "Dashboard":
        return <Dashboard user={currentUser} onNavigate={setActiveItem} />;
      case "Projects":
        return <Projects user={currentUser} />;
      case "Tasks":
        return <Tasks user={currentUser} />;
      case "AI Insights":
      case "AI Insight":
        return <Aiinsight user={currentUser} />;
      case "Team":
        return <Team user={currentUser} />;
      case "Smart Timeline":
        return <SmartTime user={currentUser} />;
      case "Reports":
        return <Reports user={currentUser} />;
      case "Automation":
        return <Automation user={currentUser} />;
      case "Workflow":
      case "Workflow Engine":
        return <Workflow user={currentUser} />;
      case "Calendar":
        return <Calender user={currentUser} />;
        case "Settings":
        return <Settings user={currentUser} />;
      default:
        return (
          <div className="rounded border border-[#DCDFE4] bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
            <h1 className="text-xl font-semibold text-[#172B4D] dark:text-white">{activeItem}</h1>
          </div>
        );
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#F7F8F9] transition-colors duration-300 dark:bg-slate-950">
      <Sidebar
        user={currentUser}
        activeItem={activeItem}
        onNavigate={setActiveItem}
        mobileOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      <div className="relative min-h-screen lg:pl-[240px]">
        <Topbar
          user={currentUser}
          onLogout={onLogout}
          pageTitle={activeItem}
          onMenuClick={() => setMobileSidebarOpen(true)}
        />

        <main className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8">
          {renderModule()}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
