
import { useState } from "react";
import { 
  Download, 
  FileJson, 
  FileText,
  FileType,  // Changed from FilePdf to FileType for PDF icon
  Calendar as CalendarIcon 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ExportOptions } from "@/lib/types";
import { getEmployees, getSettings } from "@/lib/store";
import { exportToCSV, exportToJSON, downloadCSV, downloadJSON, downloadPDF } from "@/lib/exports";
import { toast } from "sonner";
import { DateRange } from "react-day-picker";

const Reports = () => {
  const employees = getEmployees();
  const settings = getSettings();
  const [fileType, setFileType] = useState<"pdf" | "csv" | "json">("csv");
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(),
    to: new Date(),
  });
  const [includeAllEmployees, setIncludeAllEmployees] = useState(true);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [includeAllDepartments, setIncludeAllDepartments] = useState(true);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [groupBy, setGroupBy] = useState<"date" | "employee" | "department">("date");

  const handleEmployeeSelection = (checked: boolean, id: string) => {
    if (checked) {
      setSelectedEmployees([...selectedEmployees, id]);
    } else {
      setSelectedEmployees(selectedEmployees.filter(empId => empId !== id));
    }
  };

  const handleDepartmentSelection = (checked: boolean, dept: string) => {
    if (checked) {
      setSelectedDepartments([...selectedDepartments, dept]);
    } else {
      setSelectedDepartments(selectedDepartments.filter(d => d !== dept));
    }
  };
  
  const handleExport = () => {
    if (!dateRange.from) {
      toast.error("Please select a date range");
      return;
    }
    
    const options: ExportOptions = {
      format: fileType,
      dateRange: {
        start: format(dateRange.from, "yyyy-MM-dd"),
        end: dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : format(dateRange.from, "yyyy-MM-dd"),
      },
      includeEmployees: includeAllEmployees ? "all" : selectedEmployees,
      includeDepartments: includeAllDepartments ? "all" : selectedDepartments,
      groupBy: groupBy,
    };
    
    try {
      const fileName = `${settings.companyName.replace(/\s+/g, '_')}_attendance_${format(dateRange.from, "yyyyMMdd")}_${format(
        dateRange.to || dateRange.from,
        "yyyyMMdd"
      )}`;
      
      if (fileType === "csv") {
        const csvData = exportToCSV(options);
        downloadCSV(
          csvData,
          `${fileName}.csv`
        );
      } else if (fileType === "json") {
        const jsonData = exportToJSON(options);
        downloadJSON(
          jsonData,
          `${fileName}.json`
        );
      } else if (fileType === "pdf") {
        const csvData = exportToCSV(options);
        // Use the downloadPDF function directly
        downloadPDF(csvData, fileName, settings.companyName);
      }
      
      toast.success("Report exported successfully");
    } catch (error) {
      console.error("Error exporting report:", error);
      toast.error("Failed to export report");
    }
  };
  
  // Handle checkbox changes for format selection
  const handleFormatChange = (format: "pdf" | "csv" | "json") => {
    setFileType(format);
  };
  
  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">
          Generate and export attendance reports.
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Export Options</CardTitle>
            <CardDescription>Configure your report export.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid gap-2">
              <Label>Format</Label>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="csvFormat"
                    checked={fileType === "csv"}
                    onCheckedChange={() => handleFormatChange("csv")}
                  />
                  <Label htmlFor="csvFormat" className="flex items-center gap-1">
                    <FileText className="h-4 w-4" /> CSV
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="jsonFormat"
                    checked={fileType === "json"}
                    onCheckedChange={() => handleFormatChange("json")}
                  />
                  <Label htmlFor="jsonFormat" className="flex items-center gap-1">
                    <FileJson className="h-4 w-4" /> JSON
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="pdfFormat"
                    checked={fileType === "pdf"}
                    onCheckedChange={() => handleFormatChange("pdf")}
                  />
                  <Label htmlFor="pdfFormat" className="flex items-center gap-1">
                    <FileType className="h-4 w-4" /> PDF
                  </Label>
                </div>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label>Date Range</Label>
              <div className="grid gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateRange.from && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} -{" "}
                            {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange.from}
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={2}
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label>Data Organization</Label>
              <Select value={groupBy} onValueChange={(value: "date" | "employee" | "department") => setGroupBy(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Group data by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Group by Date</SelectItem>
                  <SelectItem value="employee">Group by Employee</SelectItem>
                  <SelectItem value="department">Group by Department</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </CardFooter>
        </Card>
        
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Employees</CardTitle>
              <CardDescription>Select employees to include.</CardDescription>
              <div className="flex items-center space-x-2 mt-2">
                <Checkbox
                  id="allEmployees"
                  checked={includeAllEmployees}
                  onCheckedChange={(checked) => {
                    const isChecked = !!checked;
                    setIncludeAllEmployees(isChecked);
                    if (isChecked) {
                      setSelectedEmployees([]);
                    }
                  }}
                />
                <Label htmlFor="allEmployees">Include all employees</Label>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 max-h-60 overflow-y-auto">
              {!includeAllEmployees && employees.length > 0 ? (
                employees.map((emp) => (
                  <div key={emp.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`emp-${emp.id}`}
                      checked={selectedEmployees.includes(emp.id)}
                      onCheckedChange={(checked) =>
                        handleEmployeeSelection(!!checked, emp.id)
                      }
                    />
                    <Label htmlFor={`emp-${emp.id}`} className="flex-1">
                      <div>{emp.name}</div>
                      <div className="text-xs text-muted-foreground">{emp.department}</div>
                    </Label>
                  </div>
                ))
              ) : (
                <div className="text-center text-sm text-muted-foreground py-4">
                  {employees.length === 0
                    ? "No employees found"
                    : "All employees will be included"}
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Departments</CardTitle>
              <CardDescription>Select departments to include.</CardDescription>
              <div className="flex items-center space-x-2 mt-2">
                <Checkbox
                  id="allDepartments"
                  checked={includeAllDepartments}
                  onCheckedChange={(checked) => {
                    const isChecked = !!checked;
                    setIncludeAllDepartments(isChecked);
                    if (isChecked) {
                      setSelectedDepartments([]);
                    }
                  }}
                />
                <Label htmlFor="allDepartments">Include all departments</Label>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 max-h-60 overflow-y-auto">
              {!includeAllDepartments && settings.departments.length > 0 ? (
                settings.departments.map((dept) => (
                  <div key={dept} className="flex items-center space-x-2">
                    <Checkbox
                      id={`dept-${dept}`}
                      checked={selectedDepartments.includes(dept)}
                      onCheckedChange={(checked) =>
                        handleDepartmentSelection(!!checked, dept)
                      }
                    />
                    <Label htmlFor={`dept-${dept}`}>{dept}</Label>
                  </div>
                ))
              ) : (
                <div className="text-center text-sm text-muted-foreground py-4">
                  {settings.departments.length === 0
                    ? "No departments found"
                    : "All departments will be included"}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Reports;
