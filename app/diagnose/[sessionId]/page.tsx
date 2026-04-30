import { DiagnosisStudio } from "@/components/diagnosis/diagnosis-studio";

type DiagnoseSessionPageProps = {
  params: Promise<{
    sessionId: string;
  }>;
};

export default async function DiagnoseSessionPage({ params }: DiagnoseSessionPageProps) {
  const { sessionId } = await params;

  return <DiagnosisStudio sessionId={sessionId} />;
}

