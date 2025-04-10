import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, User, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { Employee } from "@/lib/types";
import { getEmployees, saveEmployee, deleteEmployee, getSettings } from "@/lib/store";

const defaultEmployee: Employee = {
  id: "",
  name: "",
  department: "",
  position: "",
  joinDate: "",
  contact: "",
  email: "",
  active: true,
};

const Employees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Employee>(defaultEmployee);
  const [isEditing, setIsEditing] = useState(false);

  const settings = getSettings();

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    filterEmployees();
  }, [searchTerm, filterDepartment, filterStatus, employees]);

  const loadEmployees = () => {
    const loadedEmployees = getEmployees();
    setEmployees(loadedEmployees);
    setFilteredEmployees(loadedEmployees);
  };

  const filterEmployees = () => {
    let result = [...employees];

    if (searchTerm) {
      result = result.filter(
        (emp) =>
          emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterDepartment) {
      result = result.filter((emp) => emp.department === filterDepartment);
    }

    if (filterStatus === "active") {
      result = result.filter((emp) => emp.active);
    } else if (filterStatus === "inactive") {
      result = result.filter((emp) => !emp.active);
    }

    setFilteredEmployees(result);
  };

  const openAddDialog = () => {
    setCurrentEmployee(defaultEmployee);
    setIsEditing(false);
    setDialogOpen(true);
  };

  const openEditDialog = (employee: Employee) => {
    setCurrentEmployee(employee);
    setIsEditing(true);
    setDialogOpen(true);
  };

  const confirmDelete = (employee: Employee) => {
    setCurrentEmployee(employee);
    setDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    deleteEmployee(currentEmployee.id);
    loadEmployees();
    setDeleteDialogOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!currentEmployee.name || !currentEmployee.department) {
        toast.error("Please fill in all required fields");
        return;
      }
      
      if (!isEditing) {
        currentEmployee.id = uuidv4();
      }
      
      saveEmployee(currentEmployee);
      
      loadEmployees();
      
      setDialogOpen(false);
      
    } catch (error) {
      console.error("Error saving employee:", error);
      toast.error("Failed to save employee");
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
        <p className="text-muted-foreground">
          Manage employees and their details.
        </p>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search employees..."
              className="w-full pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select
            value={filterDepartment}
            onValueChange={setFilterDepartment}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-departments">All Departments</SelectItem>
              {settings.departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-status">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Employee
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredEmployees.length > 0 ? (
          filteredEmployees.map((employee) => (
            <Card key={employee.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-primary/10 p-3">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{employee.name}</h3>
                      <p className="text-sm text-muted-foreground">{employee.department}</p>
                      <p className="text-xs text-muted-foreground">{employee.position}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
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
                          className="lucide lucide-more-vertical"
                        >
                          <circle cx="12" cy="12" r="1" />
                          <circle cx="12" cy="5" r="1" />
                          <circle cx="12" cy="19" r="1" />
                        </svg>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(employee)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => confirmDelete(employee)}
                        className="text-red-500 focus:text-red-500"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="truncate">{employee.email || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Contact</p>
                    <p>{employee.contact || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Join Date</p>
                    <p>{employee.joinDate || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <p className={employee.active ? "text-green-500" : "text-red-500"}>
                      {employee.active ? "Active" : "Inactive"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center p-8">
            <Users className="h-10 w-10 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-1">No employees found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {employees.length === 0
                ? "Add your first employee to get started"
                : "Try adjusting your filters"}
            </p>
            <Button onClick={openAddDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add Employee
            </Button>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Employee" : "Add Employee"}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update employee details."
                : "Add a new employee to the system."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={currentEmployee.name}
                    onChange={(e) =>
                      setCurrentEmployee({ ...currentEmployee, name: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="department">Department *</Label>
                  <Select
                    value={currentEmployee.department}
                    onValueChange={(value) =>
                      setCurrentEmployee({ ...currentEmployee, department: value })
                    }
                  >
                    <SelectTrigger className="mt-1 w-full">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {settings.departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="position">Position</Label>
                  <Select
                    value={currentEmployee.position}
                    onValueChange={(value) =>
                      setCurrentEmployee({ ...currentEmployee, position: value })
                    }
                  >
                    <SelectTrigger className="mt-1 w-full">
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      {settings.positions.map((pos) => (
                        <SelectItem key={pos} value={pos}>
                          {pos}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={currentEmployee.email}
                    onChange={(e) =>
                      setCurrentEmployee({ ...currentEmployee, email: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="contact">Contact Number</Label>
                  <Input
                    id="contact"
                    value={currentEmployee.contact}
                    onChange={(e) =>
                      setCurrentEmployee({
                        ...currentEmployee,
                        contact: e.target.value,
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="joinDate">Join Date</Label>
                  <Input
                    id="joinDate"
                    type="date"
                    value={currentEmployee.joinDate}
                    onChange={(e) =>
                      setCurrentEmployee({
                        ...currentEmployee,
                        joinDate: e.target.value,
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={currentEmployee.active}
                    onCheckedChange={(checked) =>
                      setCurrentEmployee({ ...currentEmployee, active: checked })
                    }
                  />
                  <Label htmlFor="active">Active Employee</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Employee</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {currentEmployee.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Employees;
