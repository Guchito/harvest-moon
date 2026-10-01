import { submitContact } from "@/app/contact/actions";

// Native form + server action: works without client JS.
export function ContactForm({ artists, preselect }: { artists: { slug: string; name: string }[]; preselect?: string }) {
  const field = "w-full border border-line bg-night-2 px-4 py-3 text-paper placeholder:text-muted focus:border-accent focus:outline-none transition-colors";
  const label = "mb-2 block text-sm font-semibold";
  return (
    <form action={submitContact} className="grid gap-5 md:grid-cols-2">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      <div>
        <label htmlFor="name" className={label}>Nombre</label>
        <input id="name" name="name" required autoComplete="name" className={field} />
      </div>
      <div>
        <label htmlFor="email" className={label}>Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" className={field} />
      </div>
      <div>
        <label htmlFor="phone" className={label}>Teléfono</label>
        <input id="phone" name="phone" type="tel" autoComplete="tel" className={field} />
      </div>
      <div>
        <label htmlFor="date" className={label}>Fecha del evento</label>
        <input id="date" name="date" type="date" className={field} />
      </div>
      <div>
        <label htmlFor="type" className={label}>Tipo de evento</label>
        <select id="type" name="type" className={field} defaultValue="">
          <option value="" disabled>Elige una opción</option>
          <option>Boda</option>
          <option>Evento de empresa</option>
          <option>Pool party</option>
          <option>Cumpleaños</option>
          <option>Otro</option>
        </select>
      </div>
      <div>
        <label htmlFor="dj" className={label}>DJ (opcional)</label>
        <select id="dj" name="dj" className={field} defaultValue={preselect ?? ""}>
          <option value="">Sin preferencia</option>
          {artists.map((a) => <option key={a.slug} value={a.name}>{a.name}</option>)}
        </select>
      </div>
      <div className="md:col-span-2">
        <label htmlFor="message" className={label}>Cuéntanos sobre tu evento</label>
        <textarea id="message" name="message" rows={5} required className={field} />
      </div>
      <button type="submit" className="btn btn-accent md:col-span-2 md:justify-self-start">Enviar solicitud</button>
    </form>
  );
}
