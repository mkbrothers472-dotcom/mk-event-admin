import { useApp } from '../store';
import { Card, Button, Input } from '../components/ui';
import { Moon, Sun, Bell, Database, Shield, Download, Sparkles } from 'lucide-react';

export function Settings() {
  const { darkMode, toggleDarkMode } = useApp();

  return (
    <div className="space-y-4 max-w-2xl">
      {/* Business Info */}
      <Card className="p-4 sm:p-6">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-600" />Business Information
        </h2>
        <div className="space-y-3">
          <Input label="Business Name" defaultValue="MK Brothers Event Decoration" />
          <Input label="Owner Name" defaultValue="Admin" />
          <Input label="Phone Number" defaultValue="+91 98765 43210" />
          <Input label="Email" defaultValue="mkbrothers@email.com" />
          <Input label="Address" defaultValue="Pune, Maharashtra" />
          <Button className="w-full sm:w-auto">Save Changes</Button>
        </div>
      </Card>

      {/* Appearance */}
      <Card className="p-4 sm:p-6">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          {darkMode ? <Moon className="w-4 h-4 text-purple-600" /> : <Sun className="w-4 h-4 text-purple-600" />}
          Appearance
        </h2>
        <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
          <div>
            <p className="font-medium text-sm text-gray-900 dark:text-white">Dark Mode</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Switch between light and dark theme</p>
          </div>
          <button
            onClick={toggleDarkMode}
            className={`relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 flex-shrink-0 ${darkMode ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'}`}
          >
            <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 flex items-center justify-center ${darkMode ? 'translate-x-7' : 'translate-x-0.5'}`}>
              {darkMode
                ? <Moon className="w-3.5 h-3.5 text-purple-600" />
                : <Sun className="w-3.5 h-3.5 text-yellow-500" />
              }
            </div>
          </button>
        </div>
      </Card>

      {/* Notifications */}
      <Card className="p-4 sm:p-6">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Bell className="w-4 h-4 text-purple-600" />Reminder Settings
        </h2>
        <div className="space-y-1">
          {[
            '3 Days Before Event Reminder',
            '1 Day Before Event Reminder',
            'Event Day Morning Reminder',
            'Payment Due Reminder',
            'Overdue Payment Alert',
            'Material Pickup Reminder',
          ].map(item => (
            <div key={item} className="flex items-center justify-between py-2.5 border-b border-gray-100 dark:border-gray-700 last:border-0">
              <p className="text-sm text-gray-700 dark:text-gray-300 pr-4">{item}</p>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-10 h-5 bg-gray-300 dark:bg-gray-600 peer-checked:bg-purple-600 rounded-full transition-colors" />
                <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
              </label>
            </div>
          ))}
        </div>
      </Card>

      {/* Database */}
      <Card className="p-4 sm:p-6">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Database className="w-4 h-4 text-purple-600" />Database & Backup
        </h2>
        <div className="space-y-3">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-3">
            <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">Supabase Integration</p>
            <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
              Add your Supabase URL and API key in .env to enable cloud sync.
            </p>
          </div>
          <Input label="Supabase URL" placeholder="https://your-project.supabase.co" />
          <Input label="Supabase Anon Key" placeholder="your-anon-key" type="password" />
          <div className="flex flex-col sm:flex-row gap-2">
            <Button className="flex-1 sm:flex-none"><Database className="w-4 h-4" />Connect Database</Button>
            <Button variant="outline" className="flex-1 sm:flex-none"><Download className="w-4 h-4" />Export Backup</Button>
          </div>
        </div>
      </Card>

      {/* Security */}
      <Card className="p-4 sm:p-6">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-purple-600" />Security
        </h2>
        <div className="space-y-3">
          <Input label="Current Password" type="password" placeholder="••••••••" />
          <Input label="New Password" type="password" placeholder="••••••••" />
          <Input label="Confirm Password" type="password" placeholder="••••••••" />
          <Button className="w-full sm:w-auto">Update Password</Button>
        </div>
      </Card>
    </div>
  );
}
