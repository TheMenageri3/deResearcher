export default function DashboardPapers({
  params,
}: {
  params: { slug: string[] };
}) {
  {
    /* TODO: Redirect routes */
  }

  return (
    <div>
      <p>Here is your route: papers/{params.slug.join("/")}</p>
      <p>params: {JSON.stringify(params.slug)}</p>
    </div>
  );
}
