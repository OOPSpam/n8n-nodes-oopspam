import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class OopspamApi implements ICredentialType {
	name = 'oopspamApi';

	displayName = 'Oopspam API';

	icon: Icon = { light: 'file:../icons/oopspam.svg', dark: 'file:../icons/oopspam.dark.svg' };

	documentationUrl = 'https://www.oopspam.com/docs/#authentication';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description:
				'Your oopspam API key. You can find it in the <a href="https://app.oopspam.com" target="_blank">oopspam Dashboard</a>.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'X-Api-Key': '={{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.oopspam.com/v1',
			url: '/spamdetection',
			method: 'POST',
			body: {
				content: 'Credential test for the oopspam n8n node.',
			},
		},
	};
}
