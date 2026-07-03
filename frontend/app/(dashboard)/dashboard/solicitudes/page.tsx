'use client';

import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function SolicitudesPage() {
  useEffect(() => {
    redirect('/roles/solicitudes');
  }, []);

  return null;
}
