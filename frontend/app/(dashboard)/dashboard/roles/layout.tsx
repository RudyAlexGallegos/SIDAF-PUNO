import { MenuDinamico } from '@/components/roles/MenuDinamico';

export default function RolesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Sidebar */}
      <aside className="md:col-span-1">
        <div className="sticky top-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-4">Sistema de Roles</h2>
            <MenuDinamico />
          </div>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="md:col-span-3">
        {children}
      </main>
    </div>
  );
}
