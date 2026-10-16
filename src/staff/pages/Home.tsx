import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useStaff } from "../StaffContext";

/**
 * Staff dashboard. Phase 1: welcome + profile nudge. Phase 2 adds open
 * shifts to apply for, my applied/confirmed shifts and earnings.
 */
export default function StaffHome() {
  const { staff } = useStaff();
  if (!staff) return null;
  const first = staff.name ? staff.name.split(" ")[0] : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-dark sm:text-3xl">{first ? `Hi ${first}` : "Welcome"}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Upcoming floats and events you can work will show up here.</p>
      </div>

      {!staff.profileComplete ? (
        <Card className="border-brand/40 bg-brand/5">
          <CardHeader>
            <CardTitle className="text-lg">Finish your profile</CardTitle>
            <CardDescription>
              Add your name, phone and how you'd like to be paid so Sarah can confirm you for shifts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/staff/profile">Complete profile</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Open shifts</CardTitle>
          <CardDescription>Coming next: pick the floats you'd like to work and Sarah confirms the roster.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Nothing posted yet.</p>
        </CardContent>
      </Card>

      {staff.role === "admin" ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Admin</CardTitle>
            <CardDescription>Invite staff and manage who's on the team.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link to="/staff/admin/people">Manage people</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
