import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { User } from "@/types";

const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, "Password needs at least 6 characters."),
  confirmPassword: z.string().min(6, "Confirm the password."),
}).refine((values) => values.newPassword === values.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

type ResetUserPasswordDialogProps = {
  user: User;
  disabled?: boolean;
  onReset: (userId: string, newPassword: string) => Promise<unknown>;
};

export default function ResetUserPasswordDialog({ user, disabled = false, onReset }: ResetUserPasswordDialogProps) {
  const [open, setOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      setFormError(null);
      setSuccess(null);
      reset({ newPassword: "", confirmPassword: "" });
    }
  };

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    setSuccess(null);
    try {
      await onReset(user.id, values.newPassword);
      reset({ newPassword: "", confirmPassword: "" });
      setSuccess(`Password updated for ${user.name}.`);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not reset password.");
    }
  });

  return (
    <>
      <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={() => onOpenChange(true)}>
        <KeyRound />
        Reset password
      </Button>

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="size-5 text-primary" />
              Reset password
            </DialogTitle>
            <DialogDescription>Set a new login password for {user.name}.</DialogDescription>
          </DialogHeader>

          <form className="grid gap-4" onSubmit={onSubmit}>
            {success ? <p className="rounded-md bg-emerald-100 px-3 py-2 text-sm text-emerald-700">{success}</p> : null}
            {formError ? <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{formError}</p> : null}

            <div className="grid gap-2">
              <Label htmlFor={`new-password-${user.id}`}>New password</Label>
              <Input id={`new-password-${user.id}`} type="password" autoComplete="new-password" {...register("newPassword")} />
              {errors.newPassword ? <p className="text-sm text-destructive">{errors.newPassword.message}</p> : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor={`confirm-password-${user.id}`}>Confirm password</Label>
              <Input id={`confirm-password-${user.id}`} type="password" autoComplete="new-password" {...register("confirmPassword")} />
              {errors.confirmPassword ? <p className="text-sm text-destructive">{errors.confirmPassword.message}</p> : null}
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update password"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
