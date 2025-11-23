import { createClient } from "@/supabase/server";
import { redirect } from "next/navigation";
import { SettingsSection } from "./components/settings-section";
import { ThemeSelector } from "./components/theme-selector";
import { DataManagement } from "./components/data-management";
import { DeleteAccount } from "./components/delete-account";
import { Button } from "@/components/ui/button";
import { User, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import UserHeader from "@/components/user-header";

export const metadata = {
    title: "Settings | Prepnosis",
    description: "Manage your account settings and preferences.",
};

export default async function SettingsPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch user profile for display
    const { data: profile } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    return (
        <div>
            <UserHeader text='Settings' />
            <section className="container max-w-4xl p-8 space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                    <p className="text-muted-foreground">
                        Manage your account settings and preferences.
                    </p>
                </div>

                <div className="flex flex-col gap-8">
                    {/* Appearance Section */}
                    <SettingsSection
                        title="Appearance"
                        description="Customize the look and feel of the application."
                    >
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 border rounded-lg">
                            <div className="space-y-0.5">
                                <h4 className="text-sm font-medium">Theme</h4>
                                <p className="text-sm text-muted-foreground">
                                    Select your preferred theme for the application.
                                </p>
                            </div>
                            <ThemeSelector />
                        </div>
                    </SettingsSection>

                    {/* Data Management Section */}
                    <SettingsSection
                        title="Data Management"
                        description="Manage your test data and progress."
                    >
                        <DataManagement />
                    </SettingsSection>

                    {/* Danger Zone */}
                    <SettingsSection
                        title="Danger Zone"
                        description="Irreversible actions for your account."
                        danger
                    >
                        <DeleteAccount />
                    </SettingsSection>
                </div>
            </section>
        </div>
    );
}
