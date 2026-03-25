import type { Icon, ICredentialType, INodeProperties } from 'n8n-workflow';

export class SybaseApi implements ICredentialType {
	name = 'sybaseApi';

	displayName = 'Sybase API';

	icon: Icon = { light: 'file:../icons/sybase.svg', dark: 'file:../icons/sybase.dark.svg' };

	documentationUrl = 'https://infocenter.sybase.com/help/index.jsp';

	properties: INodeProperties[] = [
		{
			displayName: 'Host',
			name: 'host',
			type: 'string',
			default: 'localhost',
			required: true,
		},
		{
			displayName: 'Port',
			name: 'port',
			type: 'number',
			default: 5000,
			required: true,
		},
		{
			displayName: 'Database',
			name: 'database',
			type: 'string',
			default: '',
			required: true,
		},
		{
			displayName: 'Username',
			name: 'username',
			type: 'string',
			default: '',
			required: true,
		},
		{
			displayName: 'Password',
			name: 'password',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
		},
		{
			displayName: 'Note',
			name: 'note',
			type: 'notice',
			default:
				'Timeout is configured directly in the Sybase node (parameter: Timeout In Ms).',
		},
	];
}
