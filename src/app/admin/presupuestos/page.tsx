import type { Metadata } from "next";
import { QuoteEditor } from "@/components/QuoteEditor";
import { getSite } from "@/lib/content";
import { isQuoteAuthenticated, isQuoteAuthConfigured } from "@/lib/quote-auth";
import { loginQuoteAdmin, logoutQuoteAdmin } from "./actions";

export const metadata: Metadata = {
  title: "Crear presupuesto",
  robots: { index: false, follow: false },
};

const inputClass =
  "w-full border border-line bg-night-2 px-4 py-3 text-paper placeholder:text-muted focus:border-accent focus:outline-none transition-colors";

export default async function QuoteAdminPage({
  searchParams,
}: PageProps<"/admin/presupuestos">) {
  const [{ error }, authenticated] = await Promise.all([searchParams, isQuoteAuthenticated()]);
  const configured = isQuoteAuthConfigured();
  const site = getSite();

  if (authenticated) {
    return (
      <section className="mx-auto w-full max-w-[1100px] px-5 py-12 md:px-12 md:py-20">
        <div className="mb-10 flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Área privada</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">Crear presupuesto</h1>
            <p className="mt-4 max-w-[60ch] leading-relaxed text-muted-2">
              Completa los datos del evento y las opciones. El PDF se descargará en este dispositivo; los borradores no se guardan en el servidor.
            </p>
          </div>
          <form action={logoutQuoteAdmin}>
            <button type="submit" className="btn btn-ghost">Cerrar sesión</button>
          </form>
        </div>
        <QuoteEditor
          company={{
            name: site.name,
            email: site.email,
            phone: site.phone,
            address: site.address,
          }}
        />
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-[560px] px-5 py-16 md:px-12 md:py-24">
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Área privada</p>
      <h1 className="mt-3 text-4xl font-black tracking-tight">Crear presupuesto</h1>
      <p className="mt-4 leading-relaxed text-muted-2">
        Inicia sesión para preparar y descargar un presupuesto para un cliente.
      </p>

      {!configured ? (
        <div className="mt-8 border border-accent/50 bg-night-2 p-5 text-sm leading-relaxed text-muted-2">
          Configura <code className="text-paper">QUOTE_ADMIN_USERNAME</code>,{" "}
          <code className="text-paper">QUOTE_ADMIN_PASSWORD</code> (mínimo 12 caracteres) y{" "}
          <code className="text-paper">QUOTE_SESSION_SECRET</code> (mínimo 32 caracteres) en el entorno del servidor para habilitar el acceso.
        </div>
      ) : (
        <form action={loginQuoteAdmin} className="mt-8 grid gap-5">
          {error === "invalid" && (
            <p role="alert" className="border border-red-400 px-4 py-3 text-sm text-red-300">
              Usuario o contraseña incorrectos.
            </p>
          )}
          {error === "setup" && (
            <p role="alert" className="border border-red-400 px-4 py-3 text-sm text-red-300">
              El acceso no está configurado correctamente en el servidor.
            </p>
          )}
          <div>
            <label htmlFor="username" className="mb-2 block text-sm font-semibold">Usuario</label>
            <input id="username" name="username" autoComplete="username" required maxLength={128} className={inputClass} />
          </div>
          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-semibold">Contraseña</label>
            <input id="password" name="password" type="password" autoComplete="current-password" required maxLength={256} className={inputClass} />
          </div>
          <button type="submit" className="btn btn-accent justify-self-start">Iniciar sesión</button>
        </form>
      )}
    </section>
  );
}
