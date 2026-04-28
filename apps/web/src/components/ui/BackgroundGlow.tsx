export function BackgroundGlow() {
	return (
		// Фоновое свечение
		<div className="bg-glow-container">
			<div className="bg-glow-spot -top-[10%] -left-[10%] w-[40%] h-[40%] bg-emerald-900/20" />
			<div className="bg-glow-spot top-[20%] -right-[10%] w-[30%] h-[30%] bg-blue-900/10" />
		</div>
	);
}