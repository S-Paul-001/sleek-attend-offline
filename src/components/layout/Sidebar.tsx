
import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  CalendarDays,
  ClipboardList,
  Home,
  Settings,
  Users,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const navItems = [
  {
    title: "Dashboard",
    icon: Home,
    href: "/"
  },
  {
    title: "Employees",
    icon: Users,
    href: "/employees"
  },
  {
    title: "Attendance",
    icon: ClipboardList,
    href: "/attendance"
  },
  {
    title: "Calendar",
    icon: CalendarDays,
    href: "/calendar"
  },
  {
    title: "Reports",
    icon: FileText,
    href: "/reports"
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/settings"
  }
];

export function Sidebar({ open, onClose }: SidebarProps) {
  const [mounted, setMounted] = useState(false);

  // Handle click outside on mobile
  useEffect(() => {
    setMounted(true);
    
    const handleClickOutside = (event: MouseEvent) => {
      if (open && window.innerWidth < 768) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar && !sidebar.contains(event.target as Node)) {
          onClose();
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, onClose]);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar */}
      <div
        id="sidebar"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-full w-72 flex-col border-r bg-sidebar transition-transform duration-300 ease-in-out md:sticky md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center border-b px-6">
          <h2 className="text-lg font-semibold">Attendance App</h2>
        </div>
        <nav className="flex-1 overflow-auto p-4">
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <NavLink
                  to={item.href}
                  onClick={() => window.innerWidth < 768 && onClose()}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )
                  }
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="border-t p-4">
          <p className="text-xs text-sidebar-foreground/60">
            All data stored locally on your device
          </p>
        </div>
      </div>
    </>
  );
}
