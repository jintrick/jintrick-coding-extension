# How Gemini Code Assist works

The Gemini large language models (LLMs) that are used by
Gemini Code Assist are trained on datasets of publicly available code,
Google Cloud-specific material, and other relevant technical information
in addition to the datasets used to train the Gemini
[foundation models](https://storage.googleapis.com/deepmind-media/gemini/gemini_1_report.pdf).
Models are trained so that Gemini Code Assist responses are as useful
to Gemini Code Assist users as possible.

Gemini Code Assist Standard and Enterprise don't use your prompts
or generated responses for training or fine-tuning our underlying models.
Gemini Code Assist Standard and Enterprise editions use your
data strictly for serving a response to the request, and unless instructed by
you, isn't stored.

## How and when Gemini Code Assist cites sources

Gemini Code Assist LLMs, like some other standalone LLM
experiences, are intended to generate original content and not replicate
existing content at length. We've designed our systems to limit the chances of
this occurring, and we continue to improve how these systems function.

If Gemini Code Assist directly quotes at length from a web page,
it cites that page. For answers with URLs, Gemini Code Assist
lets users see and, in some cases, click to navigate directly to the source
page.

When generating code or offering code completion,
Gemini Code Assist provides citation information when it directly
quotes at length from another source, such as existing open source code. In the
case of citations to code repositories, the citation might also reference an
applicable open source license.

To allow for better code generation in IDEs,
Gemini Code Assist gathers contextual information from the file
that you're actively using in your IDE as well as other open and relevant local
files in your project.

When working with Gemini Code Assist in your IDE,
Gemini lists your project files (the context sources) that were
used as reference to generate responses to your prompts. Context sources are
shown every time you use Gemini chat.

You can prevent Gemini Code Assist from suggesting code that
matches cited sources by adjusting settings in
[VS Code](https://developers.google.com/gemini-code-assist/docs/write-code-gemini#disable_code_suggestions_that_match_cited_sources).

[Code customization](https://developers.google.com/gemini-code-assist/docs/code-customization-overview) in
Gemini Code Assist Enterprise lets you get code suggestions based
on your organization's private codebase directly from
Gemini Code Assist. To learn more about code customization, and
how we provide security when accessing and storing your private code, see the
[Gemini Code Assist overview](https://developers.google.com/gemini-code-assist/docs/code-customization-overview).
To configure and use code customization, see
[Configure and use Gemini Code Assist code customization](https://developers.google.com/gemini-code-assist/docs/code-customization).

For more information about Gemini Code Assist Standard and
Enterprise security controls, see
[Security, privacy, and compliance for Gemini Code Assist Standard and Enterprise](https://cloud.google.com/gemini/docs/codeassist/security-privacy-compliance).