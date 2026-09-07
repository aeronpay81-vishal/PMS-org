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
const AppLayout = ({ user, onLogout }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("Dashboard");
  const currentUser = user || authAPI.getStoredUser() || {};

  const renderModule = () => {
    switch (activeItem) {
      case "Dashboard":
        return <Dashboard user={currentUser} />;
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
      default:
        return (
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-[0_12px_40px_-28px_rgba(15,23,42,0.35)]">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{activeItem}</h1>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#EEF2FF] dark:bg-slate-950 transition-colors duration-300">
      <Sidebar
        user={currentUser}
        activeItem={activeItem}
        onNavigate={setActiveItem}
        mobileOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      <div className="min-h-screen lg:pl-[240px]">
        <Topbar
          user={currentUser}
          onLogout={onLogout}
          pageTitle={activeItem}
          onMenuClick={() => setMobileSidebarOpen(true)}
        />

        <main className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
          {renderModule()}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
