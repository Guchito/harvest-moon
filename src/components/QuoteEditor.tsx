"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

type Company = {
  name: string;
  email: string;
  phone: string;
  address: string;
};

type EventDetails = {
  client: string;
  date: string;
  place: string;
  guests: string;
  schedule: string;
};

type QuoteTier = {
  id: number;
  name: string;
  lineItems: QuoteLineItem[];
};

type QuoteLineItem = {
  id: number;
  description: string;
  price: string;
  hidden: boolean;
};

const fieldClass =
  "w-full border border-line bg-night-2 px-4 py-3 text-paper placeholder:text-muted focus:border-accent focus:outline-none transition-colors";
const labelClass = "mb-2 block text-sm font-semibold";
const sectionClass = "border border-line bg-night-2/60 p-5 md:p-7";
const MAX_TIERS = 12;
const MAX_LINE_ITEMS = 20;
const MAX_LINE_ITEM_PRICE_CENTS = 10_000_000_000;
const currencyFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});

function priceInCents(value: string) {
  const price = Number(value);
  return Number.isFinite(price) && price >= 0
    ? Math.min(Math.round(price * 100), MAX_LINE_ITEM_PRICE_CENTS)
    : 0;
}

function tierTotalInCents(tier: QuoteTier) {
  return tier.lineItems.reduce((total, item) => total + priceInCents(item.price), 0);
}

function safeFilename(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

export function QuoteEditor({ company }: { company: Company }) {
  const [event, setEvent] = useState<EventDetails>({
    client: "",
    date: "",
    place: "",
    guests: "",
    schedule: "",
  });
  const [tiers, setTiers] = useState<QuoteTier[]>([
    { id: 1, name: "", lineItems: [{ id: 1, description: "", price: "", hidden: false }] },
  ]);
  const [terms, setTerms] = useState("");
  const [error, setError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTierCopyDialogOpen, setIsTierCopyDialogOpen] = useState(false);
  const nextTierId = useRef(2);
  const nextLineItemId = useRef(2);
  const tierCopyDialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = tierCopyDialogRef.current;
    if (!dialog) return;

    if (isTierCopyDialogOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isTierCopyDialogOpen && dialog.open) {
      dialog.close();
    }
  }, [isTierCopyDialogOpen]);

  function updateEvent<Key extends keyof EventDetails>(key: Key, value: EventDetails[Key]) {
    setEvent((current) => ({ ...current, [key]: value }));
  }

  function updateTier<Key extends keyof Omit<QuoteTier, "id" | "lineItems">>(
    id: number,
    key: Key,
    value: QuoteTier[Key],
  ) {
    setTiers((current) =>
      current.map((tier) => (tier.id === id ? { ...tier, [key]: value } : tier)),
    );
  }

  function updateLineItem<Key extends keyof Omit<QuoteLineItem, "id">>(
    tierId: number,
    lineItemId: number,
    key: Key,
    value: QuoteLineItem[Key],
  ) {
    setTiers((current) =>
      current.map((tier) =>
        tier.id === tierId
          ? {
              ...tier,
              lineItems: tier.lineItems.map((item) =>
                item.id === lineItemId ? { ...item, [key]: value } : item,
              ),
            }
          : tier,
      ),
    );
  }

  function addLineItem(tierId: number) {
    setTiers((current) =>
      current.map((tier) =>
        tier.id === tierId && tier.lineItems.length < MAX_LINE_ITEMS
          ? {
              ...tier,
              lineItems: [
                ...tier.lineItems,
                { id: nextLineItemId.current++, description: "", price: "", hidden: false },
              ],
            }
          : tier,
      ),
    );
  }

  function removeLineItem(tierId: number, lineItemId: number) {
    setTiers((current) =>
      current.map((tier) =>
        tier.id === tierId && tier.lineItems.length > 1
          ? { ...tier, lineItems: tier.lineItems.filter((item) => item.id !== lineItemId) }
          : tier,
      ),
    );
  }

  function requestAddTier() {
    if (tiers.length >= MAX_TIERS) return;
    setIsTierCopyDialogOpen(true);
  }

  function addTier(copyPrevious: boolean) {
    if (tiers.length >= MAX_TIERS) return;

    const previousTier = tiers.at(-1);
    const lineItems =
      copyPrevious && previousTier
        ? previousTier.lineItems.map((item) => ({
            ...item,
            id: nextLineItemId.current++,
          }))
        : [{ id: nextLineItemId.current++, description: "", price: "", hidden: false }];

    setTiers((current) => [
      ...current,
      { id: nextTierId.current++, name: "", lineItems },
    ]);
    setIsTierCopyDialogOpen(false);
  }

  function removeTier(id: number) {
    setTiers((current) => current.filter((tier) => tier.id !== id));
  }

  async function generatePdf(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    setError("");
    setIsGenerating(true);

    try {
      const response = await fetch("/admin/api/presupuesto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...event,
          guests: Number(event.guests),
          tiers: tiers.map((tier) => ({
            name: tier.name,
            lineItems: tier.lineItems.map((item) => ({
              description: item.description,
              priceCents: priceInCents(item.price),
              hidden: item.hidden,
            })),
          })),
          terms,
        }),
      });

      if (!response.ok) {
        const responseText = await response.text();
        let message = "No se pudo generar el PDF. Revisa los datos e inténtalo de nuevo.";
        try {
          const responseData: unknown = JSON.parse(responseText);
          if (
            typeof responseData === "object" &&
            responseData !== null &&
            "error" in responseData &&
            typeof responseData.error === "string"
          ) {
            message = responseData.error;
          }
        } catch {
          message = "No se pudo generar el PDF. Revisa tu sesión e inténtalo de nuevo.";
        }
        throw new Error(message);
      }

      const pdf = await response.blob();
      if (pdf.size === 0) throw new Error("El PDF generado está vacío. Inténtalo de nuevo.");

      const url = URL.createObjectURL(pdf);
      const link = document.createElement("a");
      const filename = safeFilename(event.client);
      link.href = url;
      link.download = `presupuesto${filename ? `-${filename}` : ""}.pdf`;
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "No se pudo generar el PDF. Inténtalo de nuevo.",
      );
    } finally {
      setIsGenerating(false);
    }
  }

  const previousTier = tiers.at(-1);
  const previousTierName = previousTier?.name.trim() || `Opción ${tiers.length}`;
  const previousTierItemCount = previousTier?.lineItems.length ?? 0;

  return (
    <form onSubmit={generatePdf} className="grid gap-8">
      <section className={sectionClass}>
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-accent">01 · Evento</p>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <div>
            <label htmlFor="quote-client" className={labelClass}>Cliente</label>
            <input
              id="quote-client"
              value={event.client}
              onChange={(change) => updateEvent("client", change.target.value)}
              autoComplete="name"
              maxLength={150}
              required
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="quote-date" className={labelClass}>Fecha del evento</label>
            <input
              id="quote-date"
              type="date"
              value={event.date}
              onChange={(change) => updateEvent("date", change.target.value)}
              required
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="quote-place" className={labelClass}>Lugar</label>
            <input
              id="quote-place"
              value={event.place}
              onChange={(change) => updateEvent("place", change.target.value)}
              maxLength={200}
              required
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="quote-guests" className={labelClass}>Cantidad de invitados</label>
            <input
              id="quote-guests"
              type="number"
              min={1}
              max={100000}
              step={1}
              value={event.guests}
              onChange={(change) => updateEvent("guests", change.target.value)}
              required
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="quote-schedule" className={labelClass}>Horario</label>
            <input
              id="quote-schedule"
              value={event.schedule}
              onChange={(change) => updateEvent("schedule", change.target.value)}
              placeholder="Por ejemplo, 20:00–02:00"
              maxLength={100}
              required
              className={fieldClass}
            />
          </div>
        </div>
      </section>

      <section className={sectionClass}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-accent">02 · Opciones</p>
            <p className="mt-2 text-sm text-muted-2">
              Añade los conceptos y su precio. El total de cada opción se calcula automáticamente.
            </p>
          </div>
          <p className="text-sm text-muted">{tiers.length} / {MAX_TIERS}</p>
        </div>

        <div className="mt-6 grid gap-5">
          {tiers.map((tier, index) => (
            <fieldset key={tier.id} className="border border-line p-4 md:p-5">
              <legend className="px-2 font-bold">Opción {index + 1}</legend>
              <div className="grid gap-5">
                <div className="md:max-w-xl">
                  <label htmlFor={`tier-name-${tier.id}`} className={labelClass}>Nombre del nivel</label>
                  <input
                    id={`tier-name-${tier.id}`}
                    value={tier.name}
                    onChange={(change) => updateTier(tier.id, "name", change.target.value)}
                    placeholder="Por ejemplo, Esencial"
                    maxLength={70}
                    required
                    className={fieldClass}
                  />
                </div>
                <div>
                  <p className={labelClass}>Conceptos y precios</p>
                  <div className="grid gap-3">
                    {tier.lineItems.map((item, lineIndex) => (
                      <div key={item.id} className="grid gap-3 md:grid-cols-[1fr_170px_auto_auto] md:items-center">
                        <div>
                          <label htmlFor={`tier-item-description-${item.id}`} className="sr-only">
                            Concepto {lineIndex + 1} de la opción {index + 1}
                          </label>
                          <input
                            id={`tier-item-description-${item.id}`}
                            value={item.description}
                            onChange={(change) =>
                              updateLineItem(tier.id, item.id, "description", change.target.value)
                            }
                            placeholder="Por ejemplo, DJ"
                            maxLength={200}
                            required
                            className={fieldClass}
                          />
                        </div>
                        <div>
                          <label htmlFor={`tier-item-price-${item.id}`} className="sr-only">
                            Precio en euros del concepto {lineIndex + 1} de la opción {index + 1}
                          </label>
                          <input
                            id={`tier-item-price-${item.id}`}
                            type="number"
                            min={0}
                            max={MAX_LINE_ITEM_PRICE_CENTS / 100}
                            step="0.01"
                            value={item.price}
                            onChange={(change) =>
                              updateLineItem(tier.id, item.id, "price", change.target.value)
                            }
                            placeholder="Precio (€)"
                            required
                            className={fieldClass}
                          />
                        </div>
                        <label
                          htmlFor={`tier-item-hidden-${item.id}`}
                          className="flex items-center gap-2 text-sm text-muted-2"
                        >
                          <input
                            id={`tier-item-hidden-${item.id}`}
                            type="checkbox"
                            checked={item.hidden}
                            onChange={(change) =>
                              updateLineItem(tier.id, item.id, "hidden", change.target.checked)
                            }
                            className="size-4 accent-accent"
                          />
                          Ocultar
                        </label>
                        {tier.lineItems.length > 1 ? (
                          <button
                            type="button"
                            onClick={() => removeLineItem(tier.id, item.id)}
                            className="justify-self-start text-sm font-semibold text-muted-2 underline underline-offset-4 hover:text-paper md:px-2"
                            aria-label={`Eliminar concepto ${lineIndex + 1} de la opción ${index + 1}`}
                          >
                            Eliminar
                          </button>
                        ) : (
                          <span aria-hidden="true" className="hidden md:block md:w-16" />
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => addLineItem(tier.id)}
                    disabled={tier.lineItems.length >= MAX_LINE_ITEMS}
                    className="btn btn-ghost mt-3 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    + Añadir concepto
                  </button>
                  <p className="mt-4 text-sm font-semibold text-paper" aria-live="polite">
                    Total de la opción: {currencyFormatter.format(tierTotalInCents(tier) / 100)}
                  </p>
                  <p className="mt-2 text-xs text-muted">
                    Máximo {MAX_LINE_ITEMS} conceptos por opción. El PDF muestra los conceptos visibles y el total, nunca los precios individuales. Los conceptos ocultos siguen contando en el total.
                  </p>
                </div>
              </div>
              {tiers.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTier(tier.id)}
                  className="mt-4 text-sm font-semibold text-muted-2 underline underline-offset-4 hover:text-paper"
                >
                  Eliminar opción
                </button>
              )}
            </fieldset>
          ))}
        </div>

        <button
          type="button"
          onClick={requestAddTier}
          disabled={tiers.length >= MAX_TIERS}
          className="btn btn-ghost mt-5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          + Añadir opción
        </button>
      </section>

      <dialog
        ref={tierCopyDialogRef}
        onClose={() => setIsTierCopyDialogOpen(false)}
        aria-labelledby="tier-copy-title"
        aria-describedby="tier-copy-description"
        className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-lg border border-line bg-night p-6 text-paper shadow-2xl backdrop:bg-night/80 md:p-8"
      >
        <h2 id="tier-copy-title" className="text-xl font-bold tracking-tight">
          ¿Querés incluir el tier anterior?
        </h2>
        <p id="tier-copy-description" className="mt-3 text-sm leading-relaxed text-muted-2">
          {previousTierItemCount}{" "}
          {previousTierItemCount === 1 ? "concepto" : "conceptos"} de {previousTierName} se
          copiarán con sus precios y ajustes de «Ocultar». El nombre del nuevo tier quedará en
          blanco y podrás editarlo todo.
        </p>
        <div className="mt-7 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={() => setIsTierCopyDialogOpen(false)}
            className="btn btn-ghost focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => addTier(false)}
            className="btn btn-ghost focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            No, empezar vacío
          </button>
          <button
            type="button"
            onClick={() => addTier(true)}
            className="btn btn-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Sí, incluirlo
          </button>
        </div>
      </dialog>

      <section className={sectionClass}>
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-accent">03 · Condiciones</p>
        <label htmlFor="quote-terms" className={`${labelClass} mt-6`}>
          Validez, forma de pago, desplazamiento u otras condiciones
        </label>
        <textarea
          id="quote-terms"
          value={terms}
          onChange={(change) => setTerms(change.target.value)}
          placeholder={"Opcional. Escribe aquí las condiciones que quieras incluir.\nEjemplo: Validez de la propuesta: 15 días\nEjemplo: Forma de pago: a concretar\nEjemplo: Desplazamiento: incluido en Barcelona"}
          rows={5}
          maxLength={4000}
          className={fieldClass}
        />
      </section>

      <section className={sectionClass}>
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-accent">04 · Datos de empresa</p>
        <div className="mt-5 grid gap-1 text-sm leading-relaxed text-muted-2">
          <p className="font-bold text-paper">{company.name}</p>
          <p>{company.address}</p>
          <p>{company.email} · {company.phone}</p>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-muted">
          Estos datos se incluyen al final del PDF. Los precios se muestran en EUR tal como los indiques, sin desglose de IVA.
        </p>
      </section>

      {error && (
        <p role="alert" className="border border-red-400 px-5 py-4 text-sm leading-relaxed text-red-300">
          {error}
        </p>
      )}

      <button type="submit" disabled={isGenerating} className="btn btn-accent justify-self-start disabled:cursor-wait disabled:opacity-60">
        {isGenerating ? "Generando PDF…" : "Generar y descargar PDF"}
      </button>
    </form>
  );
}
