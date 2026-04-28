interface BonsaiResponse {
	__typename?: string;
	message?: string;
	[key: string]: any;
}

// Принимаем any (так как это "сырой" ответ от Apollo), 
// но типизируем результат внутри
export const handleBonsaiResponse = (data: any, successMessage?: string) => {
    // Извлекаем первый ключ (например, waterBonsai) и говорим, что это BonsaiResponse
    const result = (data ? Object.values(data)[0] : null) as BonsaiResponse | null;
    
    if (!result) return false;
    if (result.__typename === 'Bonsai') {
        if (successMessage) console.log(successMessage);
        return true;
    }
    const message = result.message || "Произошла ошибка";
    alert(message); 
    return false;
};
