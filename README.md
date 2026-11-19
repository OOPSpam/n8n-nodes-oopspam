# n8n-nodes-oopspam

This is an n8n community node. It lets you use [oopspam](https://www.oopspam.com/) in your n8n workflows.

[oopspam](https://www.oopspam.com/) is a privacy-first spam and fraud protection API. It scores messages, comments and form submissions and returns a spam score together with a detailed report, so you can decide how strict your filtering should be.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/sustainable-use-license/) workflow automation platform.

- [Installation](#installation)
- [Operations](#operations)
- [Credentials](#credentials)
- [Compatibility](#compatibility)
- [Usage](#usage)
- [Resources](#resources)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

- **Check for Spam**: send a message, an email address, an IP address or any combination of them to oopspam and receive a spam `Score` (0-6) with a detailed report.
- **Check Domain Reputation**: check whether a domain is listed by reputation blocklists.
- **Report Misdetection**: report a false positive or false negative back to oopspam so detection improves for your use case.

### Scoring

The `Score` returned by oopspam ranges from 0 to 6. A score of **3 or higher** is considered spam.

## Credentials

You need an oopspam API key.

1. Sign up or log in to the [oopspam Dashboard](https://app.oopspam.com/Identity/Account/Register).
2. Open your dashboard and copy the API key.
3. In n8n, create a new **Oopspam API** credential and paste the key into the **API Key** field.

The credential sends the key in the `X-Api-Key` header, as described in the [oopspam authentication documentation](https://www.oopspam.com/docs/#authentication).

If you subscribed to oopspam through RapidAPI, note that the RapidAPI endpoint uses a different base URL and a different authentication header. This node talks to the oopspam Dashboard endpoint (`https://api.oopspam.com/v1`).

## Compatibility

Requires n8n 1.0.0 or later.

## Usage

### Check a form submission for spam

1. Add the **oopspam** node and select the **Check for Spam** operation.
2. Fill in the sender details you have. You can send any combination of them:
    - **Content**: the message, comment or form submission, for example `{{ $json.message }}`.
    - **Email**: the sender's email address, for example `{{ $json.email }}`.
    - **Sender IP**: the sender's IP address, for example `{{ $json.ip }}`.
3. Optionally open **Additional Fields** and add:
    - **Block Temporary Emails**, **Block VPN, Proxy and Tor** or **Block Data Center IPs** to tighten the filtering.
    - **Allowed Countries**, **Blocked Countries** or **Allowed Languages** to restrict submissions to specific countries or languages.
    - **Content Context** to describe your website and what you consider spam. Setting it switches the request to contextual detection only.
    - **Log to Dashboard** together with **Source** to keep a log of the requests in the oopspam Dashboard.
4. Add an **If** node after it and continue the workflow only when `{{ $json.Score }}` is lower than `3`.

Example response:

```json
{
	"Score": 6,
	"Details": {
		"isIPBlocked": true,
		"isEmailBlocked": true,
		"isContentSpam": "spam",
		"langMatch": true,
		"countryMatch": false,
		"numberOfSpamWords": 1,
		"spamWords": ["dear"],
		"isContentTooShort": false
	}
}
```

Country codes and language codes are passed as a comma-separated list, for example `us, it` or `en, de`.

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
- [oopspam API documentation](https://www.oopspam.com/docs)
- [oopspam Dashboard](https://app.oopspam.com)
