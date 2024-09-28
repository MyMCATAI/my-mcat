import EditPassage from "../../editpassage";

export default function EditPassagePage({
  params,
}: {
  params: { id: string };
}) {
  return <EditPassage id={params.id} />;
}