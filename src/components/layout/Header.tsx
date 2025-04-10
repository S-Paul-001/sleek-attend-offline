
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Menu, UserCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSettings } from "@/lib/store";
import { ThemeToggle } from "./ThemeToggle";

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export function Header({ sidebarOpen, setSidebarOpen }: HeaderProps) {
  const navigate = useNavigate();
  const { companyName } = getSettings();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Toggle Menu"
        className="md:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
        <span className="sr-only">Toggle Menu</span>
      </Button>

      <div className="flex-1 flex items-center">
        <h1 
          className="text-lg font-semibold tracking-tight cursor-pointer"
          onClick={() => navigate("/")}
        >
          {companyName || "Attendance Register"}
        </h1>
      </div>
      
      <div className="flex items-center gap-2">
        <ThemeToggle />

        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setNotificationsOpen(!notificationsOpen)}
        >
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate("/settings")}
        >
          <UserCircle className="h-5 w-5" />
          <span className="sr-only">User</span>
        </Button>
      </div>
    </header>
  );
}
