import { Bell, BellRing } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const NotificationSettings = ({
  settings,
  permission,
  onPermissionRequest,
  onSettingsChange,
}) => (
  <Card className="mb-6">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <BellRing size={20} className="text-amber-600 dark:text-amber-400" />
        Reminders
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="streak-hour">Daily streak reminder hour</Label>
              <Input
                id="streak-hour"
                type="number"
                min="0"
                max="23"
                value={settings.streakReminderHour}
                onChange={(event) =>
                  onSettingsChange({
                    ...settings,
                    streakReminderHour: Number(event.target.value),
                  })
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="review-hour">Review reminder hour</Label>
              <Input
                id="review-hour"
                type="number"
                min="0"
                max="23"
                value={settings.spacedRepetitionReminderHour}
                onChange={(event) =>
                  onSettingsChange({
                    ...settings,
                    spacedRepetitionReminderHour: Number(event.target.value),
                  })
                }
              />
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Reminders are local to this browser and use the app&apos;s service
            worker to show daily streak and due-review notifications.
          </p>
        </div>

        <div className="rounded-xl border border-border p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-foreground font-semibold">
            <Bell size={16} />
            Notification status
          </div>
          <Separator />
          <p className="text-sm text-muted-foreground">
            Current permission:{" "}
            <span className="font-medium text-foreground">{permission}</span>
          </p>
          <Button
            onClick={onPermissionRequest}
            variant="secondary"
            size="sm"
            className="self-start"
          >
            Allow Notifications
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default NotificationSettings;
