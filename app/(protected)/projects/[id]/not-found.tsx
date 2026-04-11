import Link from "next/link";

import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";

export default function ProjectNotFound() {
  return (
    <>
      <AppHeader title="Project not found" />
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <h2 className="font-heading text-xl font-semibold tracking-tight">
          Project not found
        </h2>
        <p className="max-w-md text-sm text-muted-foreground">
          This project doesn&apos;t exist, or you don&apos;t have access to it.
        </p>
        <Button nativeButton={false} render={<Link href="/projects" />}>
          Back to projects
        </Button>
      </div>
    </>
  );
}
