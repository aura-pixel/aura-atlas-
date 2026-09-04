type OnboardingHeaderProps = {
  title: string;
  description: string;
};

export function OnboardingHeader({
  title,
  description,
}: OnboardingHeaderProps) {
  return (
    <div className="space-y-2 text-center">
      <h1 className="text-3xl font-bold">
        {title}
      </h1>

      <p className="text-muted-foreground">
        {description}
      </p>
    </div>
  );
}