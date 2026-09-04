
type EntityHeroProps = {
  image?: string;
  title: string;
  subtitle: string;
  description?: string;
};

export function EntityHero({
  image,
  title,
  subtitle,
  description,
}: EntityHeroProps) {
  return (
    <div className="rounded-3xl border bg-card p-8 shadow-sm">
      <div className="flex items-center gap-6">

        {image ? (
  <img
  src={`${process.env.NEXT_PUBLIC_API_URL}${image}`}
  alt={title}
  className="h-24 w-24 rounded-2xl border bg-background object-contain p-3"
/>
) : (

          <div className="flex h-24 w-24 items-center justify-center rounded-2xl border bg-muted text-3xl">
            🏛️
          </div>
        )}

        <div className="space-y-2">

          <h1 className="text-4xl font-bold tracking-tight">
            {title}
          </h1>

          <p className="text-lg font-medium text-primary">
            {subtitle}
          </p>

          {description && (
            <p className="max-w-2xl text-muted-foreground">
              {description}
            </p>
          )}

        </div>

      </div>
    </div>
  );
}