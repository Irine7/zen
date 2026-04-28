export function ProgressBar({ progress, color }: { progress: number; color: string; }) {

	return (
		<div className="progress-bg">
			<div
				className={`progress-fill ${color}`}
				style={{ width: `${progress}%` }}
			/>
		</div>
	);
}