import { useState } from "react";
import { Plus, Trash2, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useTeamMembers, useAddTeamMember, useDeleteTeamMember } from "@/hooks/useTeamMembers";

export default function Settings() {
  const { data: members, isLoading } = useTeamMembers();
  const addMember = useAddTeamMember();
  const deleteMember = useDeleteTeamMember();
  const [name, setName] = useState("");

  const handleAdd = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (members?.some((m) => m.name.toLowerCase() === trimmed.toLowerCase())) {
      return;
    }
    addMember.mutate(trimmed, { onSuccess: () => setName("") });
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your team members</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" /> Team Members
          </CardTitle>
          <CardDescription>Add or remove team members who make sales calls</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form
            onSubmit={(e) => { e.preventDefault(); handleAdd(); }}
            className="flex gap-2"
          >
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter team member name"
              className="flex-1"
            />
            <Button type="submit" disabled={!name.trim() || addMember.isPending}>
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </form>

          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : !members?.length ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No team members yet. Add your first one above.</p>
          ) : (
            <div className="space-y-2">
              {members.map((m) => (
                <div key={m.id} className="flex items-center justify-between rounded-lg border px-4 py-3">
                  <span className="font-medium">{m.name}</span>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove {m.name}?</AlertDialogTitle>
                        <AlertDialogDescription>This will remove them from the team members list.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteMember.mutate(m.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
