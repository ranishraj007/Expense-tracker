import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CreateUserPayload } from "@/types";

const createUserSchema = z.object({
  name: z.string().min(2, "Name is required."),
  phone: z.string().min(6, "Phone number is required."),
  username: z.string().min(3, "Username needs at least 3 characters."),
  email: z.string().email("Enter a valid email."),
  password: z.string().min(6, "Password needs at least 6 characters."),
  avatarUrl: z.string().url("Use a valid image URL.").optional().or(z.literal("")),
});

type CreateUserForm = z.infer<typeof createUserSchema>;

export default function CreateUserDialog({ onCreate }: { onCreate: (payload: CreateUserPayload) => Promise<unknown> }) {
  const [open, setOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { name: "", phone: "", username: "", email: "", password: "", avatarUrl: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await onCreate({ ...values, avatarUrl: values.avatarUrl || undefined });
      reset();
      setOpen(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not create user.");
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus />
          Create user
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create family user</DialogTitle>
          <DialogDescription>New users are created as members. The single admin account is managed by the seed script.</DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={onSubmit}>
          {formError ? <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{formError}</p> : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" id="new-name" error={errors.name?.message}>
              <Input id="new-name" {...register("name")} />
            </Field>
            <Field label="Phone" id="new-phone" error={errors.phone?.message}>
              <Input id="new-phone" {...register("phone")} />
            </Field>
            <Field label="Username" id="new-username" error={errors.username?.message}>
              <Input id="new-username" {...register("username")} />
            </Field>
            <Field label="Email" id="new-email" error={errors.email?.message}>
              <Input id="new-email" type="email" {...register("email")} />
            </Field>
          </div>
          <Field label="Password" id="new-password" error={errors.password?.message}>
            <Input id="new-password" type="password" {...register("password")} />
          </Field>
          <Field label="Profile image URL" id="new-avatar" error={errors.avatarUrl?.message}>
            <Input id="new-avatar" placeholder="Optional" {...register("avatarUrl")} />
          </Field>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create user"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
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
