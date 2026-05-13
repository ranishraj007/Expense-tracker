import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, Lock, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useParams } from "react-router-dom";
import { z } from "zod";
import ErrorMessage from "@/components/common/ErrorMessage";
import CreateUserDialog from "@/components/users/CreateUserDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useUsers } from "@/hooks/useUsers";
import type { ProfilePayload } from "@/types";

const profileSchema = z.object({
  name: z.string().min(2, "Name is required."),
  phone: z.string().min(6, "Phone number is required."),
  username: z.string().min(3, "Username needs at least 3 characters."),
  email: z.string().email("Enter a valid email."),
  password: z.string().optional(),
  avatarUrl: z.string().url("Use a valid image URL.").or(z.literal("")),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user: currentUser, updateCurrentUser } = useAuth();
  const { userId } = useParams();
  const { users, isLoading, error, updateProfile, createUser } = useUsers();
  const [success, setSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const selectedUser = useMemo(
    () => users.find((user) => user.id === (userId || currentUser?.id)) || currentUser,
    [currentUser, userId, users],
  );
  const canEdit = Boolean(currentUser && selectedUser && currentUser.id === selectedUser.id);
  const isAdmin = currentUser?.role === "admin";

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (selectedUser) {
      reset({
        name: selectedUser.name,
        phone: selectedUser.phone,
        username: selectedUser.username,
        email: selectedUser.email,
        password: "",
        avatarUrl: selectedUser.avatarUrl,
      });
    }
  }, [reset, selectedUser]);

  const onSubmit = handleSubmit(async (values) => {
    if (!selectedUser || !canEdit) return;
    setSuccess(null);
    setSaveError(null);
    const payload: ProfilePayload = {
      ...values,
      avatarUrl: values.avatarUrl || selectedUser.avatarUrl,
      password: values.password || undefined,
    };

    try {
      const updated = await updateProfile(selectedUser.id, payload);
      updateCurrentUser(updated);
      setSuccess("Profile updated.");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Could not update profile.");
    }
  });

  return (
    <>
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Family profiles</h2>
          <p className="mt-1 text-sm text-muted-foreground">Everyone can view profiles. Only your own profile can be edited.</p>
        </div>
        {isAdmin ? <CreateUserDialog onCreate={createUser} /> : null}
      </section>

      <ErrorMessage message={error} />

      <section className="grid gap-5 lg:grid-cols-[18rem_1fr]">
        <aside className="surface p-4">
          <h3 className="mb-3 font-semibold">Members</h3>
          <div className="grid gap-2">
            {isLoading ? <p className="text-sm text-muted-foreground">Loading profiles...</p> : null}
            {users.map((profile) => (
              <Link
                key={profile.id}
                to={`/profiles/${profile.id}`}
                className="flex items-center gap-3 rounded-md p-2 transition hover:bg-accent"
              >
                <img src={profile.avatarUrl} alt="" className="size-10 rounded-full object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{profile.name}</p>
                  <p className="truncate text-xs text-muted-foreground">@{profile.username}</p>
                </div>
                {profile.id === currentUser?.id ? <Badge variant="default">You</Badge> : null}
              </Link>
            ))}
          </div>
        </aside>

        <div className="surface p-5">
          {selectedUser ? (
            <>
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <img src={selectedUser.avatarUrl} alt="" className="size-20 rounded-lg object-cover" />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xl font-semibold">{selectedUser.name}</h3>
                      <Badge variant="muted">{selectedUser.role}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                  </div>
                </div>
                <div className="inline-flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
                  {canEdit ? <ShieldCheck className="size-4 text-primary" /> : <Eye className="size-4" />}
                  {canEdit ? "Editable by you" : "View only"}
                </div>
              </div>

              {!canEdit ? (
                <div className="mb-5 flex items-center gap-2 rounded-md border bg-muted/45 px-3 py-2 text-sm text-muted-foreground">
                  <Lock className="size-4" />
                  You can view this profile, but only {selectedUser.name} can edit their own data.
                </div>
              ) : null}

              {success ? <p className="mb-4 rounded-md bg-emerald-100 px-3 py-2 text-sm text-emerald-700">{success}</p> : null}
              <ErrorMessage message={saveError} />

              <form className="mt-4 grid gap-4" onSubmit={onSubmit}>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Name" id="name" error={errors.name?.message}>
                    <Input id="name" disabled={!canEdit} {...register("name")} />
                  </Field>
                  <Field label="Phone no" id="phone" error={errors.phone?.message}>
                    <Input id="phone" disabled={!canEdit} {...register("phone")} />
                  </Field>
                  <Field label="Username" id="username" error={errors.username?.message}>
                    <Input id="username" disabled={!canEdit} {...register("username")} />
                  </Field>
                  <Field label="Email" id="email" error={errors.email?.message}>
                    <Input id="email" type="email" disabled={!canEdit} {...register("email")} />
                  </Field>
                </div>
                <Field label="Profile image URL" id="avatarUrl" error={errors.avatarUrl?.message}>
                  <Input id="avatarUrl" disabled={!canEdit} {...register("avatarUrl")} />
                </Field>
                <Field label="New password" id="password" error={errors.password?.message}>
                  <Input id="password" type="password" disabled={!canEdit} placeholder="Leave blank to keep current password" {...register("password")} />
                </Field>
                {canEdit ? (
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Saving..." : "Update profile"}
                    </Button>
                  </div>
                ) : null}
              </form>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Profile not found.</p>
          )}
        </div>
      </section>
    </>
  );
}

function Field({ label, id, error, children }: { label: string; id: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
