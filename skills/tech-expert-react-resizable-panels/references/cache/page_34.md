# Troubleshoot access to Gemini Code Assist Standard and Enterprise features

This document shows you how to resolve issues with accessing
Gemini Code Assist Standard and Enterprise features.

Depending on the Google Cloud project and organization settings that your
administrator configured, you might need to take additional steps to access
[Gemini Code Assist features](https://developers.google.com/gemini-code-assist/docs/overview#supported-features)
in the Google API Console and
[supported IDEs](https://developers.google.com/gemini-code-assist/docs/supported-languages#supported_ides),
such as enabling required APIs and assigning yourself a
Gemini Code Assist Standard or Enterprise license.

## Disabled Gemini for Google Cloud

The following error occurs when you are attempting to use a
Gemini Code Assist Standard or Enterprise feature, such as a
quick prompt in the API Console or code completion in a supported
IDE:

![Prompt showing API is not enabled.](https://cloud.google.com/gemini/images/api_not_enabled.jpg)

This error occurs if the
[Gemini for Google Cloud API isn't enabled](https://developers.google.com/gemini-code-assist/docs/set-up-gemini-standard-enterprise#enable-api).

If you have permissions to enable the Gemini for Google Cloud on a
Cloud project, then the message provides a link to enable it. If you
don't have permissions to enable it, then the message lists the permission you
need to enable the API.

## Missing permission

The following error occurs when you are attempting to use a
Gemini Code Assist Standard or Enterprise feature, such as a
quick prompt in the API Console or code completion in a supported
IDE:

![Prompt showing permission is missing.](https://cloud.google.com/gemini/images/missing_permission.jpg)

This error occurs if you don't have the
[required user permission to use a feature](https://developers.google.com/gemini-code-assist/docs/set-up-gemini-standard-enterprise#grant-iam).

To resolve this issue, contact your Google Cloud administrator and request them
to grant you the missing permission.

## Missing Gemini Code Assist Standard or Enterprise license

To use Gemini Code Assist Standard or Enterprise, you need to
have a license assigned to you. If the required APIs are enabled on your
Cloud project and you have the required permissions to use
Gemini Code Assist Standard or Enterprise features, but you
attempt to use a Gemini Code Assist Standard or Enterprise
feature (such as quick prompt in the API Console or code completion
in a supported IDE), the API Console displays a message explaining
that you need to get a Gemini Code Assist Standard or Enterprise
license.

If you don't have permissions to self-assign a license or manage licenses, then
you are provided a link to learn more about Gemini Code Assist
Standard and Enterprise licensing. You will need to request a license from your
Cloud project administrator.

### License self-assignment for Google API Console-based Gemini Code Assist Standard and Enterprise features

If you have permissions to self-assign licenses and a license is available in
your organization, then you'll see a dialog in the API Console where
you click **Get a license** to have one assigned to you. Clicking that button
assigns a license to you, and it remains assigned until a period of inactivity
elapses. After that period of inactivity, your license is unassigned and
returned to the pool of available licenses.

If you have permissions to
[manage licenses](https://developers.google.com/gemini-code-assist/docs/manage-licenses), then
you'll see a dialog where you click **Manage subscription** manually or
automatically assign a license.