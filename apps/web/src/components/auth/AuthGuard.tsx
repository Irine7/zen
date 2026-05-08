"use client";

import { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { useRouter } from 'next/navigation';
import { GET_ME } from '@/src/graphql/queries';
import { GetMe } from '@/src/types/auth';

// Компонент AuthGuard (Proxy) защищает маршруты от неавторизованного доступа.
// Он проверяет наличие токена в localStorage и перенаправляет на /login при отсутствии.

interface AuthGuardProps {
	children: React.ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
	const router = useRouter();
	const { data, loading, error } = useQuery<GetMe>(GET_ME);
	const [isAuthorized, setIsAuthorized] = useState(false);

	useEffect(() => {
		if (!loading) {
			if (error || !data?.getMe) {
				router.push("/login");
			} else {
				setIsAuthorized(true);
			}
		}
	}, [data, loading, error, router]);

	// Пока проверяем авторизацию, мы ничего не показываем (null) или глобальный загрузчик
	if (!isAuthorized) {
		return null;
	}

	return <>{children}</>;
};
