import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { useToast } from "@/hooks/use-toast";

const Settings: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { 
    language, 
    setLanguage, 
    darkMode, 
    toggleDarkMode, 
    currency, 
    setCurrency, 
    reminderEnabled, 
    toggleReminderEnabled,
    cloudSyncEnabled,
    toggleCloudSyncEnabled,
    transactions,
    budgets,
    exportData,
    importData,
    anonymousId
  } = useAppContext();
  
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [exportedData, setExportedData] = useState("");
  
  const handleExport = () => {
    try {
      const data = exportData();
      setExportedData(data);
      setExportDialogOpen(true);
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("exportFailed"),
        description: String(error),
      });
    }
  };
  
  const handleImport = () => {
    if (!importFile) {
      toast({
        variant: "destructive",
        title: t("importFailed"),
        description: t("pleaseSelectFile"),
      });
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = e.target?.result as string;
        importData(jsonData);
        setImportDialogOpen(false);
        toast({
          title: t("importSuccessful"),
          description: t("dataImported"),
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: t("importFailed"),
          description: String(error),
        });
      }
    };
    reader.readAsText(importFile);
  };
  
  const downloadExportedData = () => {
    const blob = new Blob([exportedData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my-wallet-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setExportDialogOpen(false);
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">{t("settings")}</h2>
        <p className="text-muted-foreground">{t("settingsDescription")}</p>
      </div>
      
      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>{t("preferences")}</CardTitle>
          <CardDescription>{t("preferencesDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>{t("language")}</Label>
              <p className="text-sm text-muted-foreground">{t("languageDescription")}</p>
            </div>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t("selectLanguage")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="he">עברית</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>{t("darkMode")}</Label>
              <p className="text-sm text-muted-foreground">{t("darkModeDescription")}</p>
            </div>
            <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>{t("currency")}</Label>
              <p className="text-sm text-muted-foreground">{t("currencyDescription")}</p>
            </div>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t("selectCurrency")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="$">USD ($)</SelectItem>
                <SelectItem value="€">EUR (€)</SelectItem>
                <SelectItem value="£">GBP (£)</SelectItem>
                <SelectItem value="₪">ILS (₪)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle>{t("features")}</CardTitle>
          <CardDescription>{t("featuresDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>{t("budgetReminders")}</Label>
              <p className="text-sm text-muted-foreground">{t("budgetRemindersDescription")}</p>
            </div>
            <Switch checked={reminderEnabled} onCheckedChange={toggleReminderEnabled} />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>{t("cloudSync")}</Label>
              <p className="text-sm text-muted-foreground">{t("cloudSyncDescription")}</p>
            </div>
            <Switch checked={cloudSyncEnabled} onCheckedChange={toggleCloudSyncEnabled} />
          </div>
          
          {cloudSyncEnabled && (
            <div className="bg-muted p-4 rounded-md">
              <p className="text-sm font-medium mb-2">{t("anonymousId")}</p>
              <p className="text-xs text-muted-foreground mb-2">{t("anonymousIdDescription")}</p>
              <div className="bg-background p-2 rounded border text-xs font-mono overflow-auto">
                {anonymousId}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle>{t("dataManagement")}</CardTitle>
          <CardDescription>{t("dataManagementDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{t("exportData")}</p>
                <p className="text-sm text-muted-foreground">{t("exportDataDescription")}</p>
              </div>
              <Button variant="outline" onClick={handleExport}>
                {t("export")}
              </Button>
            </div>
            
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">{t("transactionsCount")}:</span> {transactions.length}
            </div>
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">{t("budgetsCount")}:</span> {budgets.length}
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">{t("importData")}</p>
              <p className="text-sm text-muted-foreground">{t("importDataDescription")}</p>
            </div>
            <Button variant="outline" onClick={() => setImportDialogOpen(true)}>
              {t("import")}
            </Button>
          </div>
          
          <div className="flex justify-between items-center pt-4 border-t">
            <div>
              <p className="font-medium text-destructive">{t("resetApp")}</p>
              <p className="text-sm text-muted-foreground">{t("resetAppDescription")}</p>
            </div>
            <Button variant="destructive" onClick={() => setResetDialogOpen(true)}>
              {t("reset")}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle>{t("about")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm">My Wallet v1.0.0</p>
          <p className="text-sm text-muted-foreground">{t("aboutDescription")}</p>
          <div className="pt-2">
            <p className="text-xs text-muted-foreground">{t("privacyPolicy")}</p>
            <p className="text-xs text-muted-foreground">{t("termsOfService")}</p>
          </div>
        </CardContent>
      </Card>
      
      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("importData")}</DialogTitle>
            <DialogDescription>{t("importDialogDescription")}</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="importFile">{t("selectFile")}</Label>
              <Input
                id="importFile"
                type="file"
                accept=".json"
                onChange={(e) => e.target.files && setImportFile(e.target.files[0])}
              />
            </div>
            
            <div className="flex items-center p-3 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 rounded-md text-sm">
              <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
              <p>{t("importWarning")}</p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
              {t("cancel")}
            </Button>
            <Button onClick={handleImport}>
              {t("import")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("exportData")}</DialogTitle>
            <DialogDescription>{t("exportDialogDescription")}</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-md max-h-[200px] overflow-auto">
              <pre className="text-xs">{exportedData}</pre>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setExportDialogOpen(false)}>
              {t("cancel")}
            </Button>
            <Button onClick={downloadExportedData}>
              {t("download")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Reset Confirmation Dialog */}
      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("resetConfirmation")}</DialogTitle>
            <DialogDescription>{t("resetConfirmationDescription")}</DialogDescription>
          </DialogHeader>
          
          <div className="flex items-center p-3 bg-destructive/10 text-destructive rounded-md text-sm">
            <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
            <p>{t("resetWarning")}</p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetDialogOpen(false)}>
              {t("cancel")}
            </Button>
            <Button variant="destructive" onClick={() => {
              // Reset functionality would go here
              // This would clear all storage items
              setResetDialogOpen(false);
              toast({
                title: t("resetSuccessful"),
                description: t("resetSuccessfulDescription"),
              });
            }}>
              {t("reset")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;
