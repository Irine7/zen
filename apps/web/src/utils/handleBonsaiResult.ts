// Общая функция для проверки ошибок результата
export function handleBonsaiResult(result: any, successMessage?: string) {
	if (!result) return false;
	switch (result?.__typename) {
		case 'BonsaiAlreadyDeadError':
			alert(`О нет! ${result.message}`);
			return false;
		case 'BonsaiNotFoundError':
			alert(`Дерево не найдено: ${result.message}`);
			return false;
		case 'BonsaiHasHabitError':
			alert(`Дерево уже имеет привычку: ${result.message}`);
			return false;
		case 'Bonsai':
			console.log(successMessage);
			return true;
		default:
			return false;
	}
}