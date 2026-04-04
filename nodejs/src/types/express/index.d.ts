declare global {
	namespace Express {
		interface User {
		id: number | null;
		mail?: string;
		username?: string;
		language?: string | null;
		profile_image?: string | null;
		}
	}
}

export {};
