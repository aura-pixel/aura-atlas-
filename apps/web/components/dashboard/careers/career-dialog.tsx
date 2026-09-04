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

import { CareerForm } from "./career-form";

import type { Career } from "@/types/career";

type CareerDialogProps = {
  mode?: "create" | "edit";
  facultyId: string;
  career?: Career;
};

export function CareerDialog({
  mode = "create",
  facultyId,
  career,
}: CareerDialogProps) {
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
          Nueva carrera
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
                ? "Editar carrera"
                : "Nueva carrera"}
            </DialogTitle>
          </DialogHeader>

          <CareerForm
            mode={isEdit ? "edit" : "create"}
            facultyId={facultyId}
            career={career}
            onSuccess={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}