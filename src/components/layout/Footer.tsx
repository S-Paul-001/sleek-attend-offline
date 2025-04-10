
import { getSettings } from "@/lib/store";

export function Footer() {
  const { companyName } = getSettings();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
        <p className="text-sm text-muted-foreground md:text-left">
          &copy; {year} {companyName} Attendance Register
        </p>
        <p className="text-xs text-muted-foreground">
          Data stored locally on your device
        </p>
      </div>
    </footer>
  );
}
