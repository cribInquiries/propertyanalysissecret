import { UserSettingsForm } from "@/components/user-settings-form"

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-2">Manage your account preferences and application settings</p>
        </div>

        <UserSettingsForm />
      </div>
    </div>
  )
}
