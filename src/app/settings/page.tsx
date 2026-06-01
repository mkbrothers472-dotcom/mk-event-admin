'use client';

import { useApp } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Moon, Sun, Bell, Database, Shield, Download, Sparkles } from 'lucide-react';

export default function SettingsPage() {
  const { darkMode, toggleDarkMode } = useApp();

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Business Info */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          Business Information
        </h2>
        <div className="space-y-4">
          <Input label="Business Name" defaultValue="MK Brothers Event Decoration" />
          <Input label="Owner Name" defaultValue="Admin" />
          <Input label="Phone Number" defaultValue="+91 98765 43210" />
          <Input label="Email" defaultValue="mkbrothers@email.com" />
          <Input label="Address" defaultValue="Pune, Maharashtra" />
          <Button>Save Changes</Button>
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          {darkMode ? <Moon className="w-5 h-5 text-purple-600" /> : <Sun className="w-5 h-5 text-purple-600" />}
          Appearance
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Dark Mode</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Switch between light and dark theme</p>
          </div>
          <button
            onClick={toggleDarkMode}
            className={`relative w-12 h-6 rounded-full transition-colors ${darkMode ? 'bg-purple-600' : 'bg-gray-300'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${darkMode ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-purple-600" />
          Reminder Settings
        </h2>
        <div className="space-y-4">
          {[
            { label: '3 Days Before Event Reminder', defaultChecked: true },
            { label: '1 Day Before Event Reminder', defaultChecked: true },
            { label: 'Event Day Morning Reminder', defaultChecked: true },
            { label: 'Payment Due Reminder', defaultChecked: true },
            { label: 'Overdue Payment Alert', defaultChecked: true },
            { label: 'Material Pickup Reminder', defaultChecked: true },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between">
              <p className="text-sm text-gray-700 dark:text-gray-300">{item.label}</p>
              <input type="checkbox" defaultChecked={item.defaultChecked} className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
            </div>
          ))}
        </div>
      </div>

      {/* Database */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Database className="w-5 h-5 text-purple-600" />
          Database & Backup
        </h2>
        <div className="space-y-3">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-300 font-medium">Supabase Integration</p>
            <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
              Configure your Supabase URL and API key in the .env.local file to enable cloud database sync.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3">
            <Input label="Supabase URL" placeholder="https://your-project.supabase.co" />
            <Input label="Supabase Anon Key" placeholder="your-anon-key" type="password" />
          </div>
          <div className="flex gap-3">
            <Button className="gap-2">
              <Database className="w-4 h-4" />
              Connect Database
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export Backup
            </Button>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-purple-600" />
          Security
        </h2>
        <div className="space-y-4">
          <Input label="Current Password" type="password" placeholder="••••••••" />
          <Input label="New Password" type="password" placeholder="••••••••" />
          <Input label="Confirm Password" type="password" placeholder="••••••••" />
          <Button>Update Password</Button>
        </div>
      </div>
    </div>
  );
}
