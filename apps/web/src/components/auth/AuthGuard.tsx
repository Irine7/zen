"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AUTH_TOKEN_KEY } from '@/constants/auth';

// Компонент AuthGuard (Proxy) защищает маршруты от неавторизованного доступа.
// Он проверяет наличие токена в localStorage и перенаправляет на /login при отсутствии.

interface AuthGuardProps {
	children: React.ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
	const router = useRouter();
	const [isAuthorized, setIsAuthorized] = useState(false);

	useEffect(() => {
		const token = localStorage.getItem(AUTH_TOKEN_KEY);
		if (!token) {
			router.push("/login");
		} else {
			setIsAuthorized(true);
		}
	}, [router]);

	// Пока проверяем авторизацию, мы ничего не показываем (null) или глобальный загрузчик
	if (!isAuthorized) {
		return null;
	}

	return <>{children}</>;
};
