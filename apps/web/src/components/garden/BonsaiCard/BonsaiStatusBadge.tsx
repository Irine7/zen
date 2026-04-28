export function BonsaiStatusBadge({ status, isHealthy }: { status: string; isHealthy: boolean; }) {

	return (
		<div className={`badge ${isHealthy ? 'badge-healthy' : 'badge-warning'}`}>
			{status}
		</div>
	);
}