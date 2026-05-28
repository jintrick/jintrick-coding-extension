# Customize Gemini Code Assist behavior in GitHub

[Skip to main content](#main-content)

* [Home](https://developers.google.com/gemini-code-assist)
  + [Home](https://developers.google.com/gemini-code-assist)
  + [Guides](https://developers.google.com/gemini-code-assist/docs/overview)
  + [Resources](https://developers.google.com/gemini-code-assist/resources/faqs)

* [Overview](https://developers.google.com/gemini-code-assist/docs/overview)
* [Gemini in Android Studio](https://developers.google.com/gemini-code-assist/docs/android-studio-overview)
* [Gemini CLI](https://developers.google.com/gemini-code-assist/docs/gemini-cli)
* [Supported languages, IDEs, and interfaces](https://developers.google.com/gemini-code-assist/docs/supported-languages)
* [How Gemini Code Assist works](https://developers.google.com/gemini-code-assist/docs/works)
* [How Gemini Code Assist Standard and Enterprise use your data](https://developers.google.com/gemini-code-assist/docs/data-governance)
* [Responsible AI](https://developers.google.com/gemini-code-assist/docs/responsible-ai)
* [Set up Gemini Code Assist for individuals](https://developers.google.com/gemini-code-assist/docs/set-up-gemini)
* [Use the Gemini Code Assist for individuals chat](https://developers.google.com/gemini-code-assist/docs/use-gemini-code-assist-chat)
* [Get started with Gemini Code Assist for individuals tools](https://developers.google.com/gemini-code-assist/docs/tools-agents/get-started-with-tools)
* [Code features overview](https://developers.google.com/gemini-code-assist/docs/code-overview)
* [Code with Gemini Code Assist for individuals](https://developers.google.com/gemini-code-assist/docs/write-code-gemini)
* [Chat features overview](https://developers.google.com/gemini-code-assist/docs/chat-overview)
* [Chat with Gemini Code Assist for individuals](https://developers.google.com/gemini-code-assist/docs/chat-gemini)
* [Agent mode](https://developers.google.com/gemini-code-assist/docs/agent-mode)
* [Use agentic chat as a pair programmer](https://developers.google.com/gemini-code-assist/docs/use-agentic-chat-pair-programmer)
* [Gemini Code Assist tools overview](https://developers.google.com/gemini-code-assist/docs/tools-agents/tools-overview)
* [Code customization overview](https://developers.google.com/gemini-code-assist/docs/code-customization-overview)
* [Configure code customization](https://developers.google.com/gemini-code-assist/docs/code-customization)
* [Use code customization](https://developers.google.com/gemini-code-assist/docs/use-code-customization)
* [Encrypt data with customer-managed encryption keys](https://developers.google.com/gemini-code-assist/docs/encrypt-data-cmek)
* [Review GitHub code with Gemini Code Assist](https://developers.google.com/gemini-code-assist/docs/review-github-code)
* [Customize Gemini Code Assist behavior in GitHub](https://developers.google.com/gemini-code-assist/docs/customize-gemini-behavior-github)
* [Keyboard shortcuts](https://developers.google.com/gemini-code-assist/docs/keyboard-shortcuts)
* [Exclude files from Gemini Code Assist use](https://developers.google.com/gemini-code-assist/docs/create-aiexclude-file)
* [Configure local codebase awareness](https://developers.google.com/gemini-code-assist/docs/configure-local-codebase-awareness)
* [Use pre-release features in Gemini Code Assist for VS Code](https://developers.google.com/gemini-code-assist/docs/use-pre-release-features-gemini-code-assist)
* [Configure Gemini Code Assist for individuals tools](https://developers.google.com/gemini-code-assist/docs/tools-agents/configure-tools)
* Standard and Enterprise

  + [Configure Gemini Code Assist logging](https://developers.google.com/gemini-code-assist/docs/configure-logging)
  + [Manage your Gemini Code Assist subscription](https://developers.google.com/gemini-code-assist/docs/admin)
  + [Manage Gemini Code Assist licenses](https://developers.google.com/gemini-code-assist/docs/manage-licenses)
  + [Configure VPC Service Controls](https://developers.google.com/gemini-code-assist/docs/configure-vpc-service-controls)
  + [Control Network Access with User Domain Restrictions](https://developers.google.com/gemini-code-assist/docs/network-access)
  + [Turn off Gemini Code Assist](https://developers.google.com/gemini-code-assist/docs/turn-off-gemini)
  + [Configure Gemini Code Assist tools](https://developers.google.com/gemini-code-assist/docs/tools-agents/configure-tools-standard-enterprise)
* [Troubleshoot access to Gemini Code Assist features](https://developers.google.com/gemini-code-assist/docs/troubleshoot-code-assist)
* [Provide feedback](https://developers.google.com/gemini-code-assist/docs/feedback)

## Customize Gemini Code Assist behavior in GitHub



If you have a custom set of best practices or conventions that you want
Gemini Code Assist to check for, you can [add a
`styleguide.md` file](#add_configuration_files) to the `.gemini/` root folder of
your repository. This file is treated as a regular text file, and expands the
standard prompt that Gemini Code Assist uses.

## Standard code review patterns

When custom style guides aren't specified, these are the main categories of
areas where Gemini Code Assist focuses its code review on:

* **Correctness**: Makes sure the code functions as intended and handles edge
  cases, checks for logic errors, race conditions, or incorrect API usage.
* **Efficiency**: Identifies potential performance bottlenecks or areas for
  optimization, like excessive loops, memory leaks, inefficient data structures,
  redundant calculations, excessive logging, and inefficient string manipulation.
* **Maintainability**: Assesses code readability, modularity, and adherence to
  language idioms and best practices. Targets poor naming for variables,
  functions, and classes, lack of comments or documentation, complex code, code
  duplication, inconsistent formatting, and magic numbers.
* **Security**: Identifies potential vulnerabilities in data handling or input
  validation, like insecure storage of sensitive data, injection attacks,
  insufficient access controls, Cross-Site Request Forgery (CSRF), and Insecure
  Direct Object References (IDOR).
* **Miscellaneous**: Other topics are considered when reviewing the pull
  request, like testing, performance, scalability, modularity and reusability, and
  error logging and monitoring.

## Add configuration files

The `.gemini/` folder hosts any Gemini Code Assist related
configuration files, like `config.yaml` and `styleguide.md`.

The `config.yaml` file contains various configurable features that you can
enable or disable, including specifying files to ignore using
[glob patterns](https://code.visualstudio.com/docs/editor/glob-patterns). The
`styleguide.md` text file is the style guide, which instructs
Gemini Code Assist with some specific rules that you want it to
follow when performing a code review.

To add these configuration files, create them in the `.gemini/` folder of your
repository and use the following table as a reference:

### Default configuration

The following code snippet is an example of a `config.yaml` file with the
default settings. If you don't include any particular settings,
Gemini Code Assist resorts to the default settings. You can use
this snippet as a template to create your own `config.yaml` file:

```
have_fun: false
code_review:
  disable: false
  comment_severity_threshold: MEDIUM
  max_review_comments: -1
  pull_request_opened:
    help: false
    summary: true
    code_review: true
    include_drafts: true
ignore_patterns: []

```

### Configuration schema

The following code snippet is the schema for the `config.yaml` file. It
defines all of the possible configuration options and their accepted values:

```
$schema: "http://json-schema.org/draft-07/schema#"
title: RepoConfig
description: Configuration for Gemini Code Assist on a repository. All fields are optional and have default values.
type: object
properties:
  have_fun:
    type: boolean
    description: Enables fun features such as a poem in the initial pull request summary. Default: false.
  ignore_patterns:
    type: array
    items:
      type: string
    description: A list of glob patterns for files and directories that Gemini Code Assist should ignore. Files matching any pattern in this list will be skipped during interactions. Default: [].
  code_review:
    type: object
    description: Configuration for code reviews. All fields are optional and have default values.
    properties:
      disable:
        type: boolean
        description: Disables Gemini from acting on pull requests. Default: false.
      comment_severity_threshold:
        type: string
        enum:
          - LOW
          - MEDIUM
          - HIGH
          - CRITICAL
        description: The minimum severity of review comments to consider. Default: MEDIUM.
      max_review_comments:
        type: integer
        format: int64
        description: The maximum number of review comments to consider. Use -1 for unlimited. Default: -1.
      pull_request_opened:
        type: object
        description: Configuration for pull request opened events. All fields are optional and have default values.
        properties:
          help:
            type: boolean
            description: Posts a help message on pull request open. Default: false.
          summary:
            type: boolean
            description: Posts a pull request summary on the pull request open. Default: true.
          code_review:
            type: boolean
            description: Posts a code review on pull request open. Default: true.
          include_drafts:
            type: boolean
            description: Enables agent functionality on draft pull requests. Default: true.

```

### Style guide

The following code snippet is an example of a `styleguide.md` file:

```
# Company X Python Style Guide

# Introduction
This style guide outlines the coding conventions for Python code developed at Company X.
It's based on PEP 8, but with some modifications to address specific needs and
preferences within our organization.

# Key Principles
* **Readability:** Code should be easy to understand for all team members.
* **Maintainability:** Code should be easy to modify and extend.
* **Consistency:** Adhering to a consistent style across all projects improves
  collaboration and reduces errors.
* **Performance:** While readability is paramount, code should be efficient.

# Deviations from PEP 8

## Line Length
* **Maximum line length:** 100 characters (instead of PEP 8's 79).
    * Modern screens allow for wider lines, improving code readability in many cases.
    * Many common patterns in our codebase, like long strings or URLs, often exceed 79 characters.

## Indentation
* **Use 4 spaces per indentation level.** (PEP 8 recommendation)

## Imports
* **Group imports:**
    * Standard library imports
    * Related third party imports
    * Local application/library specific imports
* **Absolute imports:** Always use absolute imports for clarity.
* **Import order within groups:**  Sort alphabetically.

## Naming Conventions

* **Variables:** Use lowercase with underscores (snake_case): `user_name`, `total_count`
* **Constants:**  Use uppercase with underscores: `MAX_VALUE`, `DATABASE_NAME`
* **Functions:** Use lowercase with underscores (snake_case): `calculate_total()`, `process_data()`
* **Classes:** Use CapWords (CamelCase): `UserManager`, `PaymentProcessor`
* **Modules:** Use lowercase with underscores (snake_case): `user_utils`, `payment_gateway`

## Docstrings
* **Use triple double quotes (`"""Docstring goes here."""`) for all docstrings.**
* **First line:** Concise summary of the object's purpose.
* **For complex functions/classes:** Include detailed descriptions of parameters, return values,
  attributes, and exceptions.
* **Use Google style docstrings:** This helps with automated documentation generation.
    ```python
    def my_function(param1, param2):
        """Single-line summary.

        More detailed description, if necessary.

        Args:
            param1 (int): The first parameter.
            param2 (str): The second parameter.

        Returns:
            bool: The return value. True for success, False otherwise.

        Raises:
            ValueError: If `param2` is invalid.
        """
        # function body here
    ```

## Type Hints
* **Use type hints:**  Type hints improve code readability and help catch errors early.
* **Follow PEP 484:**  Use the standard type hinting syntax.

## Comments
* **Write clear and concise comments:** Explain the "why" behind the code, not just the "what".
* **Comment sparingly:** Well-written code should be self-documenting where possible.
* **Use complete sentences:** Start comments with a capital letter and use proper punctuation.

## Logging
* **Use a standard logging framework:**  Company X uses the built-in `logging` module.
* **Log at appropriate levels:** DEBUG, INFO, WARNING, ERROR, CRITICAL
* **Provide context:** Include relevant information in log messages to aid debugging.

## Error Handling
* **Use specific exceptions:** Avoid using broad exceptions like `Exception`.
* **Handle exceptions gracefully:** Provide informative error messages and avoid crashing the program.
* **Use `try...except` blocks:**  Isolate code that might raise exceptions.

# Tooling
* **Code formatter:**  [Specify formatter, e.g., Black] - Enforces consistent formatting automatically.
* **Linter:**  [Specify linter, e.g., Flake8, Pylint] - Identifies potential issues and style violations.

# Example
```python
"""Module for user authentication."""

import hashlib
import logging
import os

from companyx.db import user_database

LOGGER = logging.getLogger(__name__)

def hash_password(password: str) -> str:
  """Hashes a password using SHA-256.

  Args:
      password (str): The password to hash.

  Returns:
      str: The hashed password.
  """
  salt = os.urandom(16)
  salted_password = salt + password.encode('utf-8')
  hashed_password = hashlib.sha256(salted_password).hexdigest()
  return f"{salt.hex()}:{hashed_password}"

def authenticate_user(username: str, password: str) -> bool:
  """Authenticates a user against the database.

  Args:
      username (str): The user's username.
      password (str): The user's password.

  Returns:
      bool: True if the user is authenticated, False otherwise.
  """
  try:
      user = user_database.get_user(username)
      if user is None:
          LOGGER.warning("Authentication failed: User not found - %s", username)
          return False

      stored_hash = user.password_hash
      salt, hashed_password = stored_hash.split(':')
      salted_password = bytes.fromhex(salt) + password.encode('utf-8')
      calculated_hash = hashlib.sha256(salted_password).hexdigest()

      if calculated_hash == hashed_password:
          LOGGER.info("User authenticated successfully - %s", username)
          return True
      else:
          LOGGER.warning("Authentication failed: Incorrect password - %s", username)
          return False
  except Exception as e:
      LOGGER.error("An error occurred during authentication: %s", e)
      return False

```

Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.

Last updated 2025-09-08 UTC.