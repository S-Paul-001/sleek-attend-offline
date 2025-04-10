
import { useState, useEffect } from "react";
import { Save, Upload, Download, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useTheme } from "@/context/ThemeContext";
import { AppSettings } from "@/lib/types";
import { getSettings, saveSettings, exportAppData, importAppData } from "@/lib/store";

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState<AppSettings>(getSettings());
  const [newDepartment, setNewDepartment] = useState("");
  const [newPosition, setNewPosition] = useState("");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<"reset" | "import">("reset");
  const [importFileContent, setImportFileContent] = useState<string | null>(null);
  
  useEffect(() => {
    // Load settings when component mounts
    setSettings(getSettings());
  }, []);
  
  const handleSaveSettings = () => {
    try {
      saveSettings(settings);
      toast.success("Settings saved successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    }
  };
  
  const handleAddDepartment = () => {
    if (!newDepartment) return;
    
    if (settings.departments.includes(newDepartment)) {
      toast.error("Department already exists");
      return;
    }
    
    setSettings({
      ...settings,
      departments: [...settings.departments, newDepartment],
    });
    
    setNewDepartment("");
  };
  
  const handleRemoveDepartment = (dept: string) => {
    setSettings({
      ...settings,
      departments: settings.departments.filter((d) => d !== dept),
    });
  };
  
  const handleAddPosition = () => {
    if (!newPosition) return;
    
    if (settings.positions.includes(newPosition)) {
      toast.error("Position already exists");
      return;
    }
    
    setSettings({
      ...settings,
      positions: [...settings.positions, newPosition],
    });
    
    setNewPosition("");
  };
  
  const handleRemovePosition = (position: string) => {
    setSettings({
      ...settings,
      positions: settings.positions.filter((p) => p !== position),
    });
  };
  
  const handleResetSettings = () => {
    setDialogAction("reset");
    setConfirmDialogOpen(true);
  };
  
  const confirmResetSettings = () => {
    const defaultSettings = getSettings();
    setSettings(defaultSettings);
    toast.success("Settings reset to defaults");
    setConfirmDialogOpen(false);
  };
  
  const handleExportData = () => {
    try {
      const jsonData = exportAppData();
      const blob = new Blob([jsonData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = url;
      link.download = `attendance_data_${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Data exported successfully");
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Failed to export data");
    }
  };
  
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        setImportFileContent(content);
        setDialogAction("import");
        setConfirmDialogOpen(true);
      } catch (error) {
        console.error("Error reading file:", error);
        toast.error("Failed to read import file");
      }
    };
    
    reader.readAsText(file);
    // Reset the input
    e.target.value = "";
  };
  
  const confirmImportData = () => {
    if (!importFileContent) return;
    
    try {
      const success = importAppData(importFileContent);
      if (success) {
        // Reload settings after import
        setSettings(getSettings());
      }
      setImportFileContent(null);
    } catch (error) {
      console.error("Error importing data:", error);
      toast.error("Failed to import data");
    } finally {
      setConfirmDialogOpen(false);
    }
  };
  
  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your attendance application settings.
        </p>
      </div>
      
      <Tabs defaultValue="general">
        <TabsList className="mb-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="departments">Departments & Positions</TabsTrigger>
          <TabsTrigger value="data">Data Management</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure your organization's basic settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="companyName">Organization Name</Label>
                <Input
                  id="companyName"
                  value={settings.companyName}
                  onChange={(e) =>
                    setSettings({ ...settings, companyName: e.target.value })
                  }
                />
              </div>
              
              <Separator />
              
              <div className="grid gap-4">
                <h3 className="text-sm font-medium">Working Hours</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={settings.workingHours.start}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          workingHours: {
                            ...settings.workingHours,
                            start: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={settings.workingHours.end}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          workingHours: {
                            ...settings.workingHours,
                            end: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid gap-4">
                <h3 className="text-sm font-medium">Working Days</h3>
                <div className="flex flex-wrap gap-4">
                  {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(
                    (day, index) => {
                      const isSelected = settings.workingDays.includes(index);
                      return (
                        <div key={day} className="flex items-center space-x-2">
                          <Switch
                            id={`day-${index}`}
                            checked={isSelected}
                            onCheckedChange={(checked) => {
                              const workingDays = checked
                                ? [...settings.workingDays, index].sort()
                                : settings.workingDays.filter((d) => d !== index);
                              setSettings({ ...settings, workingDays });
                            }}
                          />
                          <Label htmlFor={`day-${index}`}>{day}</Label>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
              
              <Separator />
              
              <div className="grid gap-4">
                <h3 className="text-sm font-medium">Notifications</h3>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="notificationsEnabled"
                    checked={settings.notificationsEnabled}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, notificationsEnabled: checked })
                    }
                  />
                  <Label htmlFor="notificationsEnabled">
                    Enable daily reminders
                  </Label>
                </div>
                {settings.notificationsEnabled && (
                  <div className="grid gap-2">
                    <Label htmlFor="notificationTime">Reminder Time</Label>
                    <Input
                      id="notificationTime"
                      type="time"
                      value={settings.notificationTime || "09:00"}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          notificationTime: e.target.value,
                        })
                      }
                    />
                  </div>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="defaultView">Default Attendance View</Label>
                <div className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="viewDaily"
                      name="defaultView"
                      value="daily"
                      checked={settings.defaultView === "daily"}
                      onChange={() =>
                        setSettings({ ...settings, defaultView: "daily" })
                      }
                    />
                    <Label htmlFor="viewDaily">Daily</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="viewEmployee"
                      name="defaultView"
                      value="employee"
                      checked={settings.defaultView === "employee"}
                      onChange={() =>
                        setSettings({ ...settings, defaultView: "employee" })
                      }
                    />
                    <Label htmlFor="viewEmployee">By Employee</Label>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-end">
              <Button onClick={handleSaveSettings}>
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="departments">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Departments</CardTitle>
                <CardDescription>
                  Manage departments in your organization.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="New department name..."
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleAddDepartment();
                      }
                    }}
                  />
                  <Button onClick={handleAddDepartment}>Add</Button>
                </div>
                <div className="grid gap-2">
                  {settings.departments.length > 0 ? (
                    settings.departments.map((dept) => (
                      <div
                        key={dept}
                        className="flex items-center justify-between rounded-md border p-2"
                      >
                        <span>{dept}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveDepartment(dept)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-x"
                          >
                            <path d="M18 6 6 18" />
                            <path d="m6 6 12 12" />
                          </svg>
                          <span className="sr-only">Remove</span>
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-4">
                      No departments defined
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Job Positions</CardTitle>
                <CardDescription>
                  Manage positions in your organization.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="New position name..."
                    value={newPosition}
                    onChange={(e) => setNewPosition(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleAddPosition();
                      }
                    }}
                  />
                  <Button onClick={handleAddPosition}>Add</Button>
                </div>
                <div className="grid gap-2">
                  {settings.positions.length > 0 ? (
                    settings.positions.map((position) => (
                      <div
                        key={position}
                        className="flex items-center justify-between rounded-md border p-2"
                      >
                        <span>{position}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemovePosition(position)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-x"
                          >
                            <path d="M18 6 6 18" />
                            <path d="m6 6 12 12" />
                          </svg>
                          <span className="sr-only">Remove</span>
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-4">
                      No positions defined
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardContent className="pt-6">
                <div className="flex justify-end">
                  <Button onClick={handleSaveSettings}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>
                Backup, restore, or reset your attendance data.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-4">
                <h3 className="text-sm font-medium">Backup & Restore</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <h4 className="text-sm">Export Data</h4>
                    <p className="text-xs text-muted-foreground">
                      Download all your attendance data for backup.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-2"
                      onClick={handleExportData}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Export Data
                    </Button>
                  </div>
                  <div className="grid gap-2">
                    <h4 className="text-sm">Import Data</h4>
                    <p className="text-xs text-muted-foreground">
                      Restore from a previous backup file.
                    </p>
                    <div className="mt-2">
                      <Input
                        id="importFile"
                        type="file"
                        accept=".json"
                        onChange={handleImportFile}
                        className="hidden"
                      />
                      <Label
                        htmlFor="importFile"
                        className="flex cursor-pointer items-center justify-center rounded-md border border-dashed border-muted-foreground/25 px-4 py-2 text-sm font-medium hover:bg-muted"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Select Backup File
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid gap-4">
                <h3 className="text-sm font-medium">Reset</h3>
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-muted-foreground">
                    Reset settings to default values. This will not delete your
                    attendance or employee data.
                  </p>
                  <div>
                    <Button
                      variant="outline"
                      className="mt-2 text-red-500 hover:text-red-600 border-red-200 hover:border-red-300"
                      onClick={handleResetSettings}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Reset Settings
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize the look and feel of the application.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-4">
                <h3 className="text-sm font-medium">Theme</h3>
                <div className="grid gap-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="themeLight"
                      name="theme"
                      value="light"
                      checked={theme === "light"}
                      onChange={() => setTheme("light")}
                    />
                    <Label htmlFor="themeLight">Light</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="themeDark"
                      name="theme"
                      value="dark"
                      checked={theme === "dark"}
                      onChange={() => setTheme("dark")}
                    />
                    <Label htmlFor="themeDark">Dark</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="themeSystem"
                      name="theme"
                      value="system"
                      checked={theme === "system"}
                      onChange={() => setTheme("system")}
                    />
                    <Label htmlFor="themeSystem">System default</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Confirm Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertCircle className="mr-2 h-5 w-5 text-yellow-500" />
              {dialogAction === "reset" ? "Reset settings" : "Import data"}
            </DialogTitle>
            <DialogDescription>
              {dialogAction === "reset"
                ? "Are you sure you want to reset all settings to default values? This will not affect your employee or attendance data."
                : "Are you sure you want to import this data? This will overwrite all your current settings, employees, and attendance records."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={
                dialogAction === "reset" ? confirmResetSettings : confirmImportData
              }
            >
              {dialogAction === "reset" ? "Reset" : "Import"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;
