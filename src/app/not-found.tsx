import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-[1400px] px-5 py-32 md:px-12">
      <h1 className="text-5xl font-black tracking-[-0.04em] md:text-7xl">Esta página no existe.</h1>
      <p className="mt-6 text-lg text-muted-2">Comprueba la dirección o vuelve al inicio.</p>
      <Link href="/" className="btn btn-accent mt-10">Ir al inicio</Link>
    </section>
  );
}
