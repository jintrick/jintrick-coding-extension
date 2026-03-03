## Use pre-release features in Gemini Code Assist for VS Code



This page describes how to use pre-release features of
Gemini Code Assist for VS Code on the insiders release channel.

Pre-release builds can include bug fixes and features still in development that
might be removed in a future release.

## Before you begin

Set up the edition of Gemini Code Assist you want to use in your
IDE:

* [Gemini Code Assist for individuals](https://developers.google.com/gemini-code-assist/docs/set-up-gemini)
* [Gemini Code Assist Standard or Enterprise](https://developers.google.com/gemini-code-assist/docs/set-up-gemini-standard-enterprise)

## Use the insiders build

To configure the update channel, follow these steps:

1. In your IDE, open the **Command palette** (`Cmd` + `Shift` + `P`) and then
   select **Open User Settings JSON**.
2. Add the following line to your user settings JSON:
   `"geminicodeassist.updateChannel": "Insiders",`
3. Save your user settings.

You are prompted to reload your window to use the latest insiders build.

## Use the standard release channel

To use the standard release channel instead of the insiders build, follow these
steps:

1. In your IDE, open the **Command palette** (`Cmd` + `Shift` + `P`) and then
   select **Open User Settings JSON**.
2. Comment out or remove the following line of your user settings JSON:
   `"geminicodeassist.updateChannel": "Insiders",`
3. Save your user settings.

You are prompted to reload your window to use the standard release channel.

Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.

Last updated 2025-09-08 UTC.