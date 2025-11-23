import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SettingsSectionProps {
    title: string;
    description?: string;
    children: React.ReactNode;
    className?: string;
    danger?: boolean;
}

export function SettingsSection({
    title,
    description,
    children,
    className,
    danger = false,
}: SettingsSectionProps) {
    return (
        <Card className={cn("w-full", danger && "border-destructive/50 bg-destructive/5", className)}>
            <CardHeader>
                <CardTitle className={cn(danger && "text-destructive")}>{title}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent className="space-y-4">
                {children}
            </CardContent>
        </Card>
    );
}
