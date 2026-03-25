import SybaseClient from 'sybase';
import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

interface ISybaseCredentials {
	host: string;
	port: number;
	database: string;
	username: string;
	password: string;
}

interface IRunQueryOptions {
	timeoutMs: number;
	debug: boolean;
	itemIndex: number;
}

function logDebug(debug: boolean, message: string, metadata?: Record<string, unknown>) {
	if (!debug) return;

	const payload = metadata ? `${message} ${JSON.stringify(metadata)}` : message;

	if (metadata) {
		process.stderr.write(`[n8n-sybase] ${payload}\n`);
		return;
	}

	process.stderr.write(`[n8n-sybase] ${payload}\n`);
}

function runQuery(
	credentials: ISybaseCredentials,
	query: string,
	options: IRunQueryOptions,
): Promise<IDataObject[]> {
	const client = new SybaseClient(
		credentials.host,
		credentials.port,
		credentials.database,
		credentials.username,
		credentials.password,
	);

	const { timeoutMs, debug, itemIndex } = options;

	return new Promise((resolve, reject) => {
		const startedAt = Date.now();
		const disconnectGraceMs = 1500;
		const timer = global.setTimeout(
			() => {
				logDebug(debug, 'Sybase operation timeout reached', { itemIndex, timeoutMs });
				finish(new Error(`Sybase operation timeout after ${timeoutMs}ms`));
			},
			timeoutMs,
		);
		let settled = false;

		const finish = (error: Error | null, rows?: IDataObject[]) => {
			if (settled) return;
			settled = true;

			global.clearTimeout(timer);
			const durationMs = Date.now() - startedAt;
			logDebug(debug, 'Disconnecting Sybase client', { itemIndex, durationMs });

			const done = (finalError: Error | null) => {
				if (finalError) {
					logDebug(debug, 'Sybase operation failed', {
						itemIndex,
						durationMs,
						error: finalError.message,
					});
					reject(finalError);
					return;
				}
				logDebug(debug, 'Sybase operation succeeded', {
					itemIndex,
					durationMs,
					rowCount: rows?.length ?? 0,
				});
				resolve(rows ?? []);
			};

			const disconnectTimeout = global.setTimeout(() => {
				logDebug(debug, 'Sybase disconnect callback timeout, forcing completion', {
					itemIndex,
					disconnectGraceMs,
				});
				done(error);
			}, disconnectGraceMs);

			client.disconnect(() => {
				global.clearTimeout(disconnectTimeout);
				done(error);
			});
		};

		logDebug(debug, 'Connecting to Sybase', {
			itemIndex,
			host: credentials.host,
			port: credentials.port,
			database: credentials.database,
			timeoutMs,
		});
		client.connect((connectError) => {
			if (connectError) {
				finish(connectError);
				return;
			}

			logDebug(debug, 'Sybase connection established, running query', {
				itemIndex,
				queryPreview: query.slice(0, 180),
			});
			client.query(query, (queryError, rows) => {
				if (queryError) {
					finish(queryError);
					return;
				}

				finish(null, (rows ?? []) as IDataObject[]);
			});
		});
	});
}

export class Sybase implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Sybase',
		name: 'sybase',
		icon: { light: 'file:../../icons/sybase.svg', dark: 'file:../../icons/sybase.dark.svg' },
		group: ['input'],
		version: 1,
		description: 'Execute SQL queries against a Sybase database',
		defaults: {
			name: 'Sybase',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
		credentials: [
			{
				name: 'sybaseApi',
				required: true,
				testedBy: 'executeQuery',
			},
		],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Execute Query',
						value: 'executeQuery',
						action: 'Execute query',
					},
				],
				default: 'executeQuery',
			},
			{
				displayName: 'Query',
				name: 'query',
				type: 'string',
				typeOptions: {
					editor: 'sqlEditor',
					rows: 8,
				},
				default: '',
				required: true,
				description: 'SQL query to execute',
				displayOptions: {
					show: {
						operation: ['executeQuery'],
					},
				},
			},
			{
				displayName: 'Always Output Data',
				name: 'alwaysOutputData',
				type: 'boolean',
				default: false,
				description: 'Whether to output one empty item if query returns no rows',
				displayOptions: {
					show: {
						operation: ['executeQuery'],
					},
				},
			},
			{
				displayName: 'Debug Mode',
				name: 'debug',
				type: 'boolean',
				default: false,
				description: 'Whether to log detailed Sybase execution steps to the n8n server logs',
				displayOptions: {
					show: {
						operation: ['executeQuery'],
					},
				},
			},
			{
				displayName: 'Timeout In Ms',
				name: 'timeoutMs',
				type: 'number',
				default: 20000,
				description: 'Maximum total time allowed for connect + query',
				displayOptions: {
					show: {
						operation: ['executeQuery'],
					},
				},
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const credentials = (await this.getCredentials('sybaseApi')) as unknown as ISybaseCredentials;

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const query = this.getNodeParameter('query', itemIndex) as string;
				const alwaysOutputData = this.getNodeParameter('alwaysOutputData', itemIndex, false) as boolean;
				const debug = this.getNodeParameter('debug', itemIndex, false) as boolean;
				const timeoutMs = this.getNodeParameter('timeoutMs', itemIndex, 20000) as number;
				logDebug(debug, 'Starting Sybase node execution for item', {
					itemIndex,
					timeoutMs,
				});

				const rows = await runQuery(credentials, query, { timeoutMs, debug, itemIndex });

				if (rows.length === 0 && alwaysOutputData) {
					returnData.push({
						json: {},
						pairedItem: { item: itemIndex },
					});
					continue;
				}

				for (const row of rows) {
					returnData.push({
						json: row,
						pairedItem: { item: itemIndex },
					});
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: itemIndex },
					});
					continue;
				}

				throw new NodeOperationError(this.getNode(), error, { itemIndex });
			}
		}

		return [returnData];
	}
}
