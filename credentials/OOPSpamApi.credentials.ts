import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class OOPSpamApi implements ICredentialType {
	name = 'oopsPamApi';

	displayName = 'OOPSpam API';

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
				'Your OOPSpam API key. You can find it in the <a href="https://app.oopspam.com" target="_blank">OOPSpam Dashboard</a>.',
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
				content: 'Credential test for the OOPSpam n8n node.',
			},
		},
	};
}
