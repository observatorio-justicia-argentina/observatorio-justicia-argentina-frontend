import { Metadata } from "next";
import { fetchJudgeBySlug } from "../../lib/api";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const judge = await fetchJudgeBySlug(slug);
    const province = judge.location.province;
    const court = judge.court;
    const failureRate = judge.failureRate?.toFixed(1) ?? "—";

    const title = `${judge.name} | Observatorio de Justicia Argentina`;
    const description =
      `${judge.name} — ${court} (${province}). ` +
      `Tasa de fracasos en libertades otorgadas: ${failureRate}%. ` +
      `Conocé su historial de resoluciones, causas y datos públicos.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `/juez/${slug}`,
        siteName: "Observatorio de Justicia Argentina",
        locale: "es_AR",
        type: "profile",
      },
      twitter: {
        card: "summary",
        title,
        description,
      },
      alternates: {
        canonical: `/juez/${slug}`,
      },
    };
  } catch {
    return {
      title: "Perfil de juez | Observatorio de Justicia Argentina",
      description:
        "Información pública sobre magistrados del Poder Judicial de la República Argentina.",
    };
  }
}

export default function JudgeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
