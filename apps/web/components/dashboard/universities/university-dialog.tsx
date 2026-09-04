"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { UniversityForm } from "./university-form";

export function UniversityDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Nueva universidad
      </Button>

      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Nueva Universidad</DialogTitle>
        </DialogHeader>

        <UniversityForm
  mode="create"
  onSuccess={() => setOpen(false)}
/>
      </DialogContent>
    </Dialog>
  );
}