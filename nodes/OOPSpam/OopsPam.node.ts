import {
	NodeConnectionTypes,
	type IDataObject,
	type IExecuteSingleFunctions,
	type IHttpRequestOptions,
	type INodeProperties,
	type INodeType,
	type INodeTypeDescription,
} from 'n8n-workflow';

/** Fields that the OOPSpam API expects as arrays of two-letter codes. */
const LIST_FIELDS = new Set(['allowedCountries', 'blockedCountries', 'allowedLanguages']);

/**
 * Merges the "Additional Fields" collection into the request body, converts the
 * comma-separated code lists into arrays and drops values that were left empty.
 */
async function prepareRequestBody(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	const operation = this.getNodeParameter('operation', 'checkSpam') as string;
	const body = (requestOptions.body ?? {}) as IDataObject;

	if (operation !== 'checkDomainReputation') {
		const additionalFields = this.getNodeParameter('additionalFields', {}) as IDataObject;

		for (const [name, value] of Object.entries(additionalFields)) {
			if (value === undefined || value === null || value === '') {
				continue;
			}

			if (LIST_FIELDS.has(name)) {
				const codes = String(value)
					.split(',')
					.map((code) => code.trim().toLowerCase())
					.filter((code) => code !== '');

				if (codes.length > 0) {
					body[name] = codes;
				}
				continue;
			}

			body[name] = value;
		}

		if (body.senderIp !== undefined) {
			body.senderIP = body.senderIp;
			delete body.senderIp;
		}
	}

	for (const key of Object.keys(body)) {
		const value = body[key];
		const isEmpty =
			value === undefined ||
			value === null ||
			value === '' ||
			(Array.isArray(value) && value.length === 0);

		if (isEmpty) {
			delete body[key];
		}
	}

	requestOptions.body = body;

	return requestOptions;
}

const additionalFields: INodeProperties = {
	displayName: 'Additional Fields',
	name: 'additionalFields',
	type: 'collection',
	placeholder: 'Add Field',
	default: {},
	displayOptions: {
		show: {
			operation: ['checkSpam', 'reportMisdetection'],
		},
	},
	options: [
		{
			displayName: 'Allowed Countries',
			name: 'allowedCountries',
			type: 'string',
			default: '',
			placeholder: 'us, it',
			description:
				'Comma-separated list of two-letter country codes that are allowed. Requires Sender IP.',
		},
		{
			displayName: 'Allowed Languages',
			name: 'allowedLanguages',
			type: 'string',
			default: '',
			placeholder: 'en, de',
			description:
				'Comma-separated list of two-letter language codes that are allowed. Content in any other language is scored as spam.',
		},
		{
			displayName: 'Block Data Center IPs',
			name: 'blockDc',
			type: 'boolean',
			default: false,
			description: 'Whether submissions coming from cloud or data center IP ranges are blocked',
		},
		{
			displayName: 'Block Temporary Emails',
			name: 'blockTempEmail',
			type: 'boolean',
			default: false,
			description: 'Whether disposable email addresses are blocked',
		},
		{
			displayName: 'Block VPN, Proxy and Tor',
			name: 'blockVpn',
			type: 'boolean',
			default: false,
			description: 'Whether submissions coming from VPN, proxy or Tor IP addresses are blocked',
		},
		{
			displayName: 'Blocked Countries',
			name: 'blockedCountries',
			type: 'string',
			default: '',
			placeholder: 'ru, cn',
			description:
				'Comma-separated list of two-letter country codes that are blocked. Requires Sender IP.',
		},
		{
			displayName: 'Check for Length',
			name: 'checkForLength',
			type: 'boolean',
			default: true,
			description:
				'Whether content shorter than 20 characters is scored as spam. Turn off to allow short messages.',
		},
		{
			displayName: 'Content Context',
			name: 'context',
			type: 'string',
			typeOptions: {
				rows: 4,
			},
			default: '',
			description:
				'Describe your website and what you consider spam. When set, only contextual detection is applied instead of the standard checks.',
		},
		{
			displayName: 'Email',
			name: 'email',
			type: 'string',
			default: '',
			placeholder: 'name@example.com',
			description: 'Email address of the person who submitted the content',
		},
		{
			displayName: 'Log to Dashboard',
			name: 'logIt',
			type: 'boolean',
			default: false,
			description:
				'Whether the request is logged in the OOPSpam Dashboard. Requires Source to be set.',
		},
		{
			displayName: 'Sender IP',
			name: 'senderIp',
			type: 'string',
			default: '',
			placeholder: '185.234.219.246',
			description:
				'IP address of the person who submitted the content. Do not use your own IP address.',
		},
		{
			displayName: 'Source',
			name: 'source',
			type: 'string',
			default: '',
			placeholder: 'example.com',
			description: 'Unique identifier for your website or application. Used to group logs.',
		},
		{
			displayName: 'URL Friendly',
			name: 'urlFriendly',
			type: 'boolean',
			default: false,
			description: 'Whether links in the content have less impact on the spam score',
		},
	],
};

export class OopsPam implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'OOPSpam',
		name: 'oopsPam',
		icon: { light: 'file:../../icons/oopspam.svg', dark: 'file:../../icons/oopspam.dark.svg' },
		group: ['input'],
		version: 1,
		subtitle: '={{ $parameter["operation"] }}',
		description: 'Score content and submissions for spam using the OOPSpam API',
		defaults: {
			name: 'OOPSpam',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'oopsPamApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: 'https://api.oopspam.com/v1',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Check for Spam',
						value: 'checkSpam',
						action: 'Check content for spam',
						description: 'Score a message, comment or form submission for spam',
						routing: {
							request: {
								method: 'POST',
								url: '/spamdetection',
							},
						},
					},
					{
						name: 'Check Domain Reputation',
						value: 'checkDomainReputation',
						action: 'Check domain reputation',
						description: 'Check whether a domain is flagged by reputation blocklists',
						routing: {
							request: {
								method: 'POST',
								url: '/reputation/domain',
							},
						},
					},
					{
						name: 'Report Misdetection',
						value: 'reportMisdetection',
						action: 'Report a spam misdetection',
						description: 'Report a false positive or false negative back to OOPSpam',
						routing: {
							request: {
								method: 'POST',
								url: '/spamdetection/report',
							},
						},
					},
				],
				default: 'checkSpam',
				routing: {
					send: {
						preSend: [prepareRequestBody],
					},
				},
			},
			{
				displayName: 'Content',
				name: 'content',
				type: 'string',
				typeOptions: {
					rows: 5,
				},
				default: '',
				placeholder: 'The message or comment to analyze',
				displayOptions: {
					show: {
						operation: ['checkSpam', 'reportMisdetection'],
					},
				},
				routing: {
					request: {
						body: {
							content: '={{ $parameter["content"] }}',
						},
					},
				},
				description: 'The message, comment or form submission to analyze',
			},
			{
				displayName: 'Domain',
				name: 'domain',
				type: 'string',
				default: '',
				placeholder: 'example.com',
				required: true,
				displayOptions: {
					show: {
						operation: ['checkDomainReputation'],
					},
				},
				routing: {
					request: {
						body: {
							domain: '={{ $parameter["domain"] }}',
						},
					},
				},
				description: 'The domain name to check. Do not include http, https or www.',
			},
			{
				displayName: 'Should Be Spam',
				name: 'shouldBeSpam',
				type: 'boolean',
				default: true,
				displayOptions: {
					show: {
						operation: ['reportMisdetection'],
					},
				},
				routing: {
					request: {
						body: {
							shouldBeSpam: '={{ $parameter["shouldBeSpam"] }}',
						},
					},
				},
				description:
					'Whether the submission should have been classified as spam. Turn off if OOPSpam wrongly marked a valid submission as spam.',
			},
			additionalFields,
		],
	};
}
