"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

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

import { del } from "@/lib/api";

import type { Faculty } from "@/types/faculty";

type FacultyDeleteDialogProps = {
  faculty: Faculty;
};

export function FacultyDeleteDialog({
  faculty,
}: FacultyDeleteDialogProps) {
  const router = useRouter();

  async function handleDelete() {
    try {
      await del(`/faculties/${faculty.id}`);

      router.refresh();
    } catch (error) {
      console.error(
        "Error al eliminar la facultad:",
        error,
      );
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger
  render={
    <Button
      variant="destructive"
      size="icon"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  }
/>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Eliminar facultad
          </AlertDialogTitle>

          <AlertDialogDescription>
            ¿Seguro que deseas eliminar la facultad{" "}
            <span className="font-semibold text-foreground">
              "{faculty.name}"
            </span>
            ?
            <br />
            <br />
            Esta acción eliminará permanentemente toda su
            información y no podrá deshacerse.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>
            Cancelar
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}