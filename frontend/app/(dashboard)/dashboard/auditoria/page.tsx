import AuditoriaPage from '@/components/roles/DashboardAuditoria';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Auditoría del Sistema - SIDAF PUNO',
};

export default function Page() {
  return <AuditoriaPage />;
}
