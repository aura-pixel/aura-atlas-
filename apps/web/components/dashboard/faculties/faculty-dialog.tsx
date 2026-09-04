"use client";

import { useState } from "react";
import { Pencil, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { FacultyForm } from "./faculty-form";

import type { Faculty } from "@/types/faculty";

type FacultyDialogProps = {
  mode?: "create" | "edit";
  universityId: string;
  faculty?: Faculty;
};

export function FacultyDialog({
  mode = "create",
  universityId,
  faculty,
}: FacultyDialogProps) {
  const [open, setOpen] = useState(false);

  const isEdit = mode === "edit";

  return (
    <>
      {isEdit ? (
        <Button
          variant="outline"
          size="icon"
          onClick={() => setOpen(true)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      ) : (
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva facultad
        </Button>
      )}

      <Dialog
        open={open}
        onOpenChange={setOpen}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {isEdit
                ? "Editar Facultad"
                : "Nueva Facultad"}
            </DialogTitle>
          </DialogHeader>

          <FacultyForm
            mode={isEdit ? "edit" : "create"}
            universityId={universityId}
            faculty={faculty}
            onSuccess={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}