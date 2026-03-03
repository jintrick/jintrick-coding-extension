# How Gemini Code Assist Standard and Enterprise use your data

This document describes how Gemini Code Assist Standard and
Enterprise editions, which offer AI-powered assistance, conform to
[Google's privacy commitment](https://cloud.google.com/blog/products/ai-machine-learning/google-cloud-unveils-ai-and-ml-privacy-commitment)
with generative AI technologies. When you use Gemini Code Assist
Standard or Enterprise editions in a development environment, Google Cloud
[handles your prompts](#submit-receive-data) in accordance with our [terms of
service](https://cloud.google.com/terms) and [Cloud Data Processing Addendum](https://cloud.google.com/terms/data-processing-addendum).

For more information about Gemini Code Assist Standard and
Enterprise editions, see the
[Gemini Code Assist overview](https://developers.google.com/gemini-code-assist/docs/overview).

## Google's privacy commitment

Google was one of the first in the industry to publish an [AI/ML privacy
commitment](https://cloud.google.com/blog/products/ai-machine-learning/google-cloud-unveils-ai-and-ml-privacy-commitment),
which outlines our belief that customers should have the highest level of
security and control over their data that's stored in the cloud. That commitment
extends to Gemini Code Assist Standard and Enterprise edition
generative AI products. Google helps ensure that its teams are following these
commitments through robust data governance practices, which include reviews of
the data that Google Cloud uses in the development of its products. You
can find more details about how Google processes data in
[Customer Data Processing Addendum (CDPA)](https://cloud.google.com/terms/data-processing-addendum)
or the data processing agreement applicable to your Google Cloud service.

## Data you submit and receive

The questions that you ask Gemini, including any input information or
code that you submit to Gemini to analyze or complete, are called
*prompts*. The answers or code completions that you receive from Gemini
are called *responses*.

Gemini Code Assist Standard and Enterprise editions don't use
your prompts or its responses as data to train its models. Some features are
only available through the
[Gemini for Google Cloud Trusted Tester Program](https://cloud.google.com/gemini-for-cloud/ttp/welcome),
which lets you optionally share data, but the data is used for product
improvements, not for training Gemini models.

[Code customization](https://developers.google.com/gemini-code-assist/docs/code-customization-overview) in
Gemini Code Assist Enterprise lets you get code suggestions based
on your organization's private codebase directly from
Gemini Code Assist. When you use code customization, we securely
access and store your private code. This access and storage is essential for
delivering the code customization service you've requested. To configure and use
code customization, see
[Configure and use Gemini Code Assist code customization](https://developers.google.com/gemini-code-assist/docs/code-customization).

[Gemini Code Assist tools](https://developers.google.com/gemini-code-assist/docs/tools-agents/tools-overview)
let developers connect to external services without leaving the IDE in order to
get tasks, summarize design documents and more. Gemini Code Assist
tools don't share data between tools. When you send a prompt to one tool, other
tools don't have access to that prompt or the response. Tools only have access
to data sent directly to them using the `@TOOL_NAME` syntax in a prompt.

Because Gemini is an evolving technology, it can generate output that's
plausible-sounding but factually incorrect. We recommend that you validate all
output from Gemini before you use it. For more information, see
[Gemini Code Assist and responsible AI](https://developers.google.com/gemini-code-assist/docs/responsible-ai).

## Encryption of prompts

When you submit prompts to Gemini, your data is encrypted in-transit as
input to the underlying model in Gemini. For more information on
Gemini data encryption, see
[Default encryption at rest](https://cloud.google.com/docs/security/encryption/default-encryption)
and [Encryption in transit](https://cloud.google.com/docs/security/encryption-in-transit).

## Program data generated from Gemini

Gemini is trained on first-party Google Cloud code as well as
selected third-party code. You're responsible for the security, testing, and
effectiveness of your code, including any code completion, generation, or
analysis that Gemini offers you.

Gemini also provides source citations when suggestions directly quote
at length from a source to help you comply with any license requirements.

Because responses in Gemini are generated from a model that's trained
on many lines of code, you should exercise the same care with
Gemini-provided code that you would with any other code. Make sure that
you test the code properly and check for security vulnerabilities,
incompatibilities, and other potential issues.

## What's next

* Learn about the
  [security, privacy, and compliance of Gemini Code Assist](https://cloud.google.com/gemini/docs/codeassist/security-privacy-compliance).