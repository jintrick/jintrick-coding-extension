# Gemini Code Assist and responsible AI

This document describes how Gemini Code Assist is designed in
view of the capabilities, limitations, and risks that are associated with
generative AI.

## Capabilities and risks of large language models

Large language models (LLMs) can perform many useful tasks such as the
following:

* Translate language.
* Summarize text.
* Generate code and creative writing.
* Power chatbots and virtual assistants.
* Complement search engines and recommendation systems.

At the same time, the evolving technical capabilities of LLMs create the
potential for misapplication, misuse, and unintended or unforeseen consequences.

LLMs can generate output that you don't expect, including text that's offensive,
insensitive, or factually incorrect. Because LLMs are incredibly versatile, it
can be difficult to predict exactly what kinds of unintended or unforeseen
outputs they might produce.

Given these risks and complexities, Gemini Code Assist is
designed with [Google's AI principles](https://ai.google/responsibility/principles/)
in mind. However, it's important for users to understand some of the limitations
of Gemini Code Assist to work safely and responsibly.

## Gemini Code Assist limitations

Some of the limitations that you might encounter using
Gemini Code Assist include (but aren't limited to) the following:

* **Edge cases.** Edge cases refer to unusual, rare, or exceptional situations
  that aren't well represented in the training data. These cases can lead to
  limitations in the output of Gemini Code Assist models, such as
  model overconfidence, misinterpretation of context, or inappropriate outputs.
* **Model hallucinations, grounding, and factuality.**
  Gemini Code Assist models might lack grounding and factuality
  in real-world knowledge, physical properties, or accurate understanding. This
  limitation can lead to model hallucinations, where
  Gemini Code Assist might generate outputs that are
  plausible-sounding but factually incorrect, irrelevant, inappropriate, or
  nonsensical. Hallucinations can also include fabricating links to web pages
  that don't exist and have never existed. For more information, see
  [Write better prompts for Gemini for Google Cloud](https://cloud.google.com/gemini/docs/discover/write-prompts).
* **Data quality and tuning.** The quality, accuracy, and bias of the prompt
  data that's entered into Gemini Code Assist products can have a
  significant impact on its performance. If users enter inaccurate or incorrect
  prompts, Gemini Code Assist might return suboptimal or false
  responses.
* **Bias amplification.** Language models can inadvertently amplify existing
  biases in their training data, leading to outputs that might further reinforce
  societal prejudices and unequal treatment of certain groups.
* **Language quality.** While Gemini Code Assist yields
  impressive multilingual capabilities on the benchmarks that we evaluated
  against, the majority of our benchmarks (including all of the fairness
  evaluations) are in American English.

  Language models might provide inconsistent service quality to different users.
  For example, text generation might not be as effective for some dialects or
  language varieties because they are underrepresented in the training data.
  Performance might be worse for non-English languages or English language
  varieties with less representation.
* **Fairness benchmarks and subgroups.** Google Research's fairness analyses of
  Gemini models don't provide an exhaustive account of the various
  potential risks. For example, we focus on biases along gender, race,
  ethnicity, and religion axes, but perform the analysis only on the American
  English language data and model outputs.
* **Limited domain expertise.** Gemini models have been trained on
  Google Cloud technology, but it might lack the depth of knowledge that's
  required to provide accurate and detailed responses on highly specialized or
  technical topics, leading to superficial or incorrect information.

## Gemini safety and toxicity filtering

Gemini Code Assist prompts and responses are checked against a
comprehensive list of safety attributes as applicable for each use case. These
safety attributes aim to filter out content that violates our
[Acceptable Use Policy](https://cloud.google.com/terms/aup). If an output is
considered harmful, the response will be blocked.

## What's next

* Learn more about
  [how Gemini Code Assist cites sources when helps you generate code](https://developers.google.com/gemini-code-assist/docs/works#how-when-gemini-cites-sources).