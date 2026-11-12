import Button from "@/components/Button";

export default function Unauthorized() {
  return (
    <div className="mx-auto max-w-md py-16">
      <h1 className="text-3xl">Admins only</h1>
      <p className="mt-3 text-muted">
        This page is for reviewing contributions. Your account doesn&apos;t have
        admin access.
      </p>
      <Button href="/lessons" className="mt-8">
        Back to lessons
      </Button>
    </div>
  );
}
