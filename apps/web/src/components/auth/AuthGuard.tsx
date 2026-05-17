"use client";

import { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { useRouter, usePathname } from 'next/navigation';
import { GET_ME } from '@/src/graphql/queries';
import { GetMe } from '@/src/types/auth';
import { GlobalLoader } from '@/src/components/ui/GlobalLoader';

// Компонент AuthGuard (Proxy) защищает маршруты от неавторизованного доступа.
// Он проверяет авторизацию с помощью запроса GetMe и кэша Apollo. Если авторизация не пройдена, то перенаправляет на /login.
// Это нужно для того, чтобы приложение не мигало и не показывало контент страницы во время проверки авторизации.

interface AuthGuardProps {
	children: React.ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
	const router = useRouter();
	const pathname = usePathname();
	const { data, loading, error } = useQuery<GetMe>(GET_ME);
	const [isAuthorized, setIsAuthorized] = useState(false);

	useEffect(() => {
		if (!loading) {
			if (error || !data?.getMe) {
				setIsAuthorized(false);
				router.push("/login");
				return;
			}

			if (!data.getMe.emailVerified) {
				setIsAuthorized(pathname === '/verify-email');
				if (pathname !== '/verify-email') {
					router.push("/verify-email");
				}
				return;
			}

			setIsAuthorized(true);
		}
	}, [data, loading, error, router, pathname]);

	// Пока проверяем авторизацию, мы ничего не показываем (null) или глобальный загрузчик
	if (!isAuthorized) {
		return <GlobalLoader />;
	}

	return <>{children}</>;
};
