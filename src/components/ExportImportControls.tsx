import { useRef, useState } from "react";
import { Download, RotateCcw, Upload, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTracker } from "../context/TrackerContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ExportImportControls = () => {
  const { trackerState, updateTrackerState } = useTracker();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  const exportData = () => {
    const dataStr = JSON.stringify(trackerState, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `leetcode-progress-${
      new Date().toISOString().split("T")[0]
    }.json`;
    link.click();
  };

  const importData = (event) => {
    const file = event.target.files && event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string);
          updateTrackerState(imported);
          setAlertMessage("Progress imported successfully!");
        } catch {
          setAlertMessage(
            "Error importing file. Please check the file format.",
          );
        }
      };
      reader.readAsText(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const clearAllData = () => {
    updateTrackerState(null);
  };

  const resetProgress = () => {
    updateTrackerState((prev) => ({
      ...prev,
      progress: {},
      activityLog: [],
    }));
  };

  return (
    <>
      <div className="flex flex-col gap-2">
        <Button
          onClick={exportData}
          variant="secondary"
          size="sm"
          className="w-full justify-start gap-2"
        >
          <Download data-icon="inline-start" />
          Export Problems
        </Button>

        <Button
          variant="secondary"
          size="sm"
          className="w-full justify-start gap-2"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload data-icon="inline-start" />
          Import Problems
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={importData}
            className="hidden"
          />
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2"
          onClick={() => setIsResetDialogOpen(true)}
        >
          <RotateCcw data-icon="inline-start" />
          Reset Progress
        </Button>

        <AlertDialog>
          <AlertDialogTrigger
            render={
              <Button
                variant="destructive"
                size="sm"
                className="w-full justify-start gap-2"
              />
            }
          >
            <Trash2 data-icon="inline-start" />
            Clear Data
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear all progress?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete all your tracked progress and
                cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={clearAllData} variant="destructive">
                Clear Data
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Alert dialog for import feedback */}
      <Dialog
        open={alertMessage !== null}
        onOpenChange={() => setAlertMessage(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Progress</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{alertMessage}</p>
          <DialogFooter>
            <Button onClick={() => setAlertMessage(null)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset solved progress?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will clear solved status, review history, and streak activity
            logs, but keep your tracked lists, custom problems, and settings.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsResetDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                resetProgress();
                setIsResetDialogOpen(false);
              }}
            >
              Reset Progress
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExportImportControls;
