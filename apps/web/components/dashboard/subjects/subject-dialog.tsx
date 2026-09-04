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

import { SubjectForm } from "./subject-form";

import type { Subject } from "@/types/subject";

type SubjectDialogProps = {
  mode?: "create" | "edit";
  careerId: string;
  subject?: Subject;
};

export function SubjectDialog({
  mode = "create",
  careerId,
  subject,
}: SubjectDialogProps) {
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
          Nueva materia
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
                ? "Editar materia"
                : "Nueva materia"}
            </DialogTitle>
          </DialogHeader>

          <SubjectForm
            mode={isEdit ? "edit" : "create"}
            careerId={careerId}
            subject={subject}
            onSuccess={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}