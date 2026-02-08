import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { DataProvider } from "@/context/DataContext";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useData } from "@/context/DataContext";
import { exportToExcel } from "@/utils/excelExporter";

function ExportButton() {
  const { facilities, summary } = useData();
  
  const handleExport = () => {
    if (facilities.length && summary) {
      exportToExcel(facilities, summary);
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleExport}
      disabled={!facilities.length}
      className="gap-2"
    >
      <Download className="h-4 w-4" />
      Export Excel
    </Button>
  );
}

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

export function DashboardLayout({ children, title, description }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <DataProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <SidebarInset className="flex-1">
            <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                {title && (
                  <div>
                    <h1 className="font-semibold">{title}</h1>
                    {description && (
                      <p className="text-xs text-muted-foreground">{description}</p>
                    )}
                  </div>
                )}
              </div>
              <ExportButton />
            </header>
            <main className="flex-1 p-6">
              {children}
            </main>
          </SidebarInset>
        </div>
      </DataProvider>
    </SidebarProvider>
  );
}
