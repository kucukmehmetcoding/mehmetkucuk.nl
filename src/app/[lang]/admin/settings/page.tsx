import { getSettings, initializeDefaultSettings, getSmtpSettings } from '../actions';
import SettingsClient from './SettingsClient';

interface SmtpSettings {
  id?: string;
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  fromEmail: string;
  fromName: string;
  isActive: boolean;
}

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  // Server-side: Load settings
  await initializeDefaultSettings();
  
  const result = await getSettings();
  const settings = result.success && result.settings ? result.settings : {};
  
  const smtpResult = await getSmtpSettings();
  const smtpSettings: SmtpSettings = smtpResult.success && smtpResult.smtp 
    ? smtpResult.smtp 
    : {
        host: '',
        port: 587,
        secure: false,
        username: '',
        password: '',
        fromEmail: '',
        fromName: '',
        isActive: false,
      };

  return <SettingsClient initialSettings={settings} initialSmtpSettings={smtpSettings} />;
}
