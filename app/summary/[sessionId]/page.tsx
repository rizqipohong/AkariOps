import { SummaryWorkspace } from "@/components/diagnosis/summary-workspace";

type SummaryPageProps = {
  params: Promise<{
    sessionId: string;
  }>;
};

export default async function SummaryPage({ params }: SummaryPageProps) {
  const { sessionId } = await params;

  return <SummaryWorkspace sessionId={sessionId} />;
}

