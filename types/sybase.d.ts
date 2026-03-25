declare module 'sybase' {
	class Sybase {
		constructor(
			host: string,
			port: number,
			dbName: string,
			username: string,
			password: string,
			logTiming?: boolean,
			javaJarPath?: string,
		);

		connect(callback: (error: Error | null) => void): void;
		query(
			sql: string,
			callback: (error: Error | null, rows?: Array<Record<string, unknown>>) => void,
		): void;
		disconnect(callback?: (error: Error | null) => void): void;
	}

	export = Sybase;
}
