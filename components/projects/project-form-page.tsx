"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { ProjectForm } from "@/components/projects/project-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Client, Project } from "@/types/api";

type ProjectFormPageProps = {
  mode: "create" | "edit";
  clients: Client[];
  initialProject?: Project;
};

export function ProjectFormPage({
  mode,
  clients,
  initialProject,
}: ProjectFormPageProps) {
  const router = useRouter();
  const isEdit = mode === "edit";

  const handleSuccess = (project: Project) => {
    toast.success(isEdit ? "Project updated" : "Project created", {
      description: project.name,
    });
    router.push(`/projects/${project.id}`);
    router.refresh();
  };

  const handleCancel = () => {
    if (initialProject) {
      router.push(`/projects/${initialProject.id}`);
    } else {
      router.push("/projects");
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <Link
        href={initialProject ? `/projects/${initialProject.id}` : "/projects"}
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3" />
        {initialProject ? "Back to project" : "Back to projects"}
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? "Edit project" : "New project"}</CardTitle>
          <CardDescription>
            {isEdit
              ? "Update the project details and click save."
              : "Capture the essentials. You can edit everything later."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectForm
            clients={clients}
            initialProject={initialProject}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </CardContent>
      </Card>
    </div>
  );
}
