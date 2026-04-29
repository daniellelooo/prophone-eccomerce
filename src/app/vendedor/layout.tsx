"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function VendedorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.replace("/admin"); return; }
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, is_admin")
        .eq("id", user.id)
        .single();
      const allowed = profile?.is_admin || ["admin", "vendedor", "gestor_inventario"].includes(profile?.role ?? "");
      if (!allowed) { router.replace("/admin"); return; }
      setChecked(true);
    });
  }, [router]);

  if (!checked) {
    return (
      <div className="min-h-screen bg-[#0C1014] flex items-center justify-center text-neutral-500 text-sm">
        Verificando acceso…
      </div>
    );
  }

  return <>{children}</>;
}
