# Configure Gemini Code Assist code customization

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

## Configure Gemini Code Assist code customization



This document describes how to set up
[Gemini Code Assist code customization](https://developers.google.com/gemini-code-assist/docs/code-customization-overview)
in the API Console, with the Google Cloud CLI, or with
Terraform by connecting Gemini Code Assist to your private code
repositories. Gemini Code Assist code customization feature lets
you receive code recommendations, which draw from the internal libraries,
private APIs, and coding style of your organization.

## Before you begin

1. [Set up Gemini Code Assist](https://developers.google.com/gemini-code-assist/docs/set-up-gemini-standard-enterprise)
   with an [Enterprise subscription](https://developers.google.com/gemini-code-assist/docs/overview#supported-features).
2. Verify that you have the following Identity and Access Management roles on
   the project that owns the subscription:

   * Code Repository Indexes Admin (`roles/cloudaicompanion.codeRepositoryIndexesAdmin`)
   * Gemini for Google Cloud User (`roles/cloudaicompanion.user`)
3. Create or configure user accounts. Every developer in your organization
   who is using Gemini Code Assist must have a user identity in
   Google Cloud that has permission to access your Google Cloud project.
   For more information, see
   [Grant roles in the Google Cloud console](https://cloud.google.com/iam/docs/grant-role-console).
   Verify each user has the following roles:

   * [Gemini for Google Cloud User](https://cloud.google.com/iam/docs/roles-permissions/cloudaicompanion#cloudaicompanion.user)
   * [Repository Groups User](https://cloud.google.com/iam/docs/roles-permissions/cloudaicompanion#cloudaicompanion.repositoryGroupsUser)
4. The code customization feature uses Developer Connect to
   access and index your private repositories. Ensure that the
   Developer Connect region where your
   Developer Connect repository connection is located is also a
   supported location for code customization. The code customization
   feature cannot be used if the Developer Connect connection is
   in an unsupported region. For the list of supported regions, see
   [code customization limitations](https://developers.google.com/gemini-code-assist/docs/code-customization-overview#limitations).

## Choose which repositories are indexed

As a best practice, you should index repositories that have the following
characteristics:

* Code that's of a similar style or structure to what you want your
  developers to write.
* Private libraries or APIs that you would like to call from your current
  codebase.

## Optional: Choose which files are not indexed

By default, code customization indexes all the
[supported code files](https://developers.google.com/gemini-code-assist/docs/code-customization-overview#limitations)
in your specified repositories.

To prevent exposure of code that you don't want to index, you can use branch
patterns to
[control access to your index](https://developers.google.com/gemini-code-assist/docs/code-customization#control_access_to_your_index_using_repository_groups)
and use a stable branch, such as `main`.

Alternatively, you can also exclude files from the index by
[creating an `.aiexclude` file](https://developers.google.com/gemini-code-assist/docs/create-aiexclude-file).

Select one of the following options:

### Console

1. In the API Console, go to the **Code Customization** page.

   [Go to Code customization for Gemini Code Assist](https://console.cloud.google.com/gemini-code-assist/code-customization?e=CodeAssistCodeCustomizationLaunch::CodeAssistCodeCustomizationEnabled&invt=Ab537g&mods=logs_tg_staging)

   The **Code customization for Gemini Code Assist** page loads.
2. Create an index. Code customization relies on an index to analyze and parse
   your repository for quicker code generation suggestions and lookups.

   1. Click **Create** and configure the index details:

      * Select the region that is configured in
        Developer Connect in your Cloud project.
      * Enter a name for your index. Note your index name. You need
        it for several steps in this document.
   2. Click **Create**.

   Index creation generally takes 30 minutes to complete, but it might take
   up to an hour. When indexing completes, you receive a notification in
   the Google API Console.

   Google limits the number of code repository indexes to one for each
   project and organization.
3. Control access to your index using repository groups.

   A repository group is a container for the indexing configuration, which
   includes repositories and their branch patterns. Repository groups are
   designed for granular IAM control, giving developers access
   to the indexed data from those groups, where they have the
   `cloudaicompanion.repositoryGroups.use` permission.

   Repository groups contain Developer Connect repositories,
   or links, from the same project and location.
4. On the **Code customization for Gemini Code Assist** page, click
   **Add repositories**, and then select **Add source repositories**.

   A list displays of existing repositories in Developer Connect for
   the region you configured in the previous step to create the index.

   If you need to add new repositories to the repository group, then click
   **Link repository** and follow the steps in the Google API Console.

   Additionally, you can select and then edit one or more repositories to add
   a new branch.
5. Select the repository group to which you want to add new repositories.
   Alternatively, click **Create a new repository group** to create and
   configure a new repository group.
6. To begin indexing the selected repositories, click **Index**.

   Indexing time varies depending on the size of repositories.

### CLI

1. Verify that you have configured
   [Developer Connect](https://cloud.google.com/developer-connect/docs/overview)
   and connected to your repository:
   * [GitHub.com](https://cloud.google.com/developer-connect/docs/connect-github-repo)
   * [GitLab.com](https://cloud.google.com/developer-connect/docs/connect-gitlab)
   * [Bitbucket.org](https://cloud.google.com/developer-connect/docs/connect-bitbucket-cloud)
2. In a shell environment, run the
   [`gcloud components update` command](https://cloud.google.com/sdk/gcloud/reference/components/update)
   to verify that you have updated all installed components of the
   [gcloud](https://cloud.google.com/sdk/gcloud) to the latest version.
   For this step, you can install and initialize the gcloud, or
   you can use [Cloud Shell Editor](https://cloud.google.com/shell/docs).

   ```
   gcloud components update

   ```
3. Create an index. Code customization relies on an index to analyze and parse
   your repository for quicker code generation suggestions and lookups.

   1. To create the index, in a shell environment, use the
      [`gemini code-repository-indexes create` command](https://cloud.google.com/sdk/gcloud/reference/gemini/code-repository-indexes/create):

      ```
      gcloud gemini code-repository-indexes create INDEX_NAME \
          --project=PROJECT_ID \
          --location=REGION

      ```

      Replace the following:

      * `INDEX_NAME`: your index name. **Important**:
        Note your index name. You need it for several steps in this
        document.
      * `PROJECT_ID`: your Google Cloud project ID.
      * `REGION`: the region that is configured in
        Developer Connect in your Cloud project.

      Index creation generally takes 30 minutes to complete, but it might take
      up to an hour.

      Google limits the number of code repository indexes to one for each
      project and organization.
4. Control access to your index using repository groups. A repository group is
   a container for the indexing configuration, which includes repositories and
   their branch patterns. Repository groups are designed for granular
   IAM control, giving developers access to the indexed data
   from those groups, where they have the
   `cloudaicompanion.repositoryGroups.use` permission.

   Repository groups contain Developer Connect repositories, or
   links, from the same project and location.

   Administrators perform the following actions:

   * Create the Code Repository Index resource.
   * In the same project and location, configure a new
     Developer Connect connection.
   * Link Git repos in the connection.
   * Get links' resource names, pick branch pattern to index for each
     link, and put it to one or multiple repository groups.

   To create a repository group, in a shell environment, use the
   [`gemini code-repository-indexes repository-groups create` command](https://cloud.google.com/sdk/gcloud/reference/gemini/code-repository-indexes/repository-groups/create):

   ```
   gcloud gemini code-repository-indexes repository-groups create REPOSITORY_GROUP \
       --project=PROJECT_ID \
       --location=REGION \
       --code-repository-index=INDEX_NAME \
       --repositories='[{"resource": "REPOSITORY_RESOURCE_NAME", "branchPattern": "BRANCH_NAMES"}]'

   ```

   Replace the following:

   * `REPOSITORY_GROUP`: name of the repository
     group, such as `default`.
   * `REPOSITORY_RESOURCE_NAME`: name of the
     repository inside the Developer Connect connection.
     To find the name of the repository, go to the
     [**Git repositories** page](https://console.cloud.google.com/developer-connect)
     in the Google Cloud console, and in the **Repositories** tab,
     look for the Connection ID under the **Connection** column in the
     table. To copy the resource name, click the
     more\_vert menu for more options,
     and select **Copy resource path**.
   * `BRANCH_NAMES`: name of the branches you want
     to index, such as `main|dev`.

   You also can create a repository group with repositories defined in a
   JSON (or YAML) file, formatted as follows:

   ### JSON

   ```
   [
     {
         "resource": "REPOSITORY_RESOURCE_NAME", "branchPattern": "main|dev"
     },
     {
         "resource": "REPOSITORY_RESOURCE_NAME", "branchPattern": "dev"
     }
   ]

   ```

   ### YAML

   ```
   - resource: REPOSITORY_RESOURCE_NAME
     branchPattern: main|dev

   - resource: REPOSITORY_RESOURCE_NAME
     branchPattern: dev

   ```

   To create a repository group based on a JSON or YAML file, in a shell
   environment, use the
   [`gemini code-repository-indexes repository-groups create` command](https://cloud.google.com/sdk/gcloud/reference/gemini/code-repository-indexes/repository-groups/create):

   ### JSON

   ```
   gcloud gemini code-repository-indexes repository-groups create REPOSITORY_GROUP \
       --project=PROJECT_ID \
       --location=REGION \
       --code-repository-index=INDEX_NAME \
       --repositories=FILEPATH.json

   ```

   ### YAML

   ```
   gcloud gemini code-repository-indexes repository-groups create REPOSITORY_GROUP \
       --project=PROJECT_ID \
       --location=REGION \
       --code-repository-index=INDEX_NAME \
       --repositories=FILEPATH.yaml

   ```

   If preferred, you can encrypt and control your data with a
   customer-managed encryption key (CMEK) through
   [Cloud Key Management Service](https://cloud.google.com/kms/docs). To learn more about using a
   CMEK, see
   [Encrypt data with customer-managed encryption keys](https://cloud.google.com/gemini/docs/codeassist/encrypt-data-cmek).
5. Grant IAM roles to the repository group on a project.

   You only receive suggestions from repositories in the index. Each
   repository belongs to one or multiple repository groups. To access
   suggestions, you must grant the Cloud AI Companion Repository Groups User
   IAM role
   (`roles/cloudaicompanion.repositoryGroupsUser`)—which contains the
   required `cloudaicompanion.repositoryGroups.user` IAM
   permission—to the repository group by one of the following ways:

   * Grant principals permission to access the entire index.
   * Grant principals access to a subset of the index.

   ### Entire index

   1. To bind an IAM policy for a project, in a shell
      environment, use the
      [`projects add-iam-policy-binding` command](https://cloud.google.com/sdk/gcloud/reference/projects/add-iam-policy-binding):

      ```
      gcloud projects add-iam-policy-binding PROJECT_ID \
          --member='PRINCIPAL' \
          --role='roles/cloudaicompanion.repositoryGroupsUser'

      ```

      Replace the following:

      * `PRINCIPAL`: the email address of the
        principal that needs access—for example,
        `user:test-user@gmail.com` for an individual, or
        `group:admins@example.com` for a group.

      For more information, see
      [`gcloud projects set-iam-policy`](https://cloud.google.com/sdk/gcloud/reference/projects/set-iam-policy).
   2. When prompted to specify a condition, enter `None`.

   ### Subset of the index

   You can create multiple repository groups and assign
   IAM roles to different IAM principals.

   In order to set up an IAM policy, you must prepare the
   IAM policy JSON or YAML file, which will contain a
   list of IAM groups and assigned roles. For example:

   ```
     bindings:
     - members:
       - group:my-group@example.com
       - user:test-user@example.com
       role: roles/cloudaicompanion.repositoryGroupsUser

   ```

   For additional details and syntax, see
   [Understanding allow policies](https://cloud.google.com/iam/docs/policies).

   To set the IAM policy, in a shell environment, use
   the
   [`gemini code-repository-indexes repository-groups set-iam-policy` command](https://cloud.google.com/sdk/gcloud/reference/gemini/code-repository-indexes/repository-groups/set-iam-policy):

   ```
     gcloud gemini code-repository-indexes repository-groups set-iam-policy GROUP_NAMEPOLICY_FILE \
         --project=PROJECT_ID \
         --location=REGION \
         --code-repository-index=INDEX_NAME

   ```

   Replace the following:

   * `GROUP_NAME`: the repository group name you
     created in a preceding step to control access to your index using
     repository groups.
   * `POLICY_FILE`: the IAM policy.

     For more information, see
     [`gcloud gemini code-repository-indexes repository-groups set-iam-policy`](https://cloud.google.com/sdk/gcloud/reference/gemini/code-repository-indexes/repository-groups/set-iam-policy).

### Terraform

1. Verify that you have configured
   [Developer Connect](https://cloud.google.com/developer-connect/docs/overview)
   and connected to your repository:

   * [GitHub.com](https://cloud.google.com/developer-connect/docs/connect-github-repo)
   * [GitLab.com](https://cloud.google.com/developer-connect/docs/connect-gitlab)
   * [Bitbucket.org](https://cloud.google.com/developer-connect/docs/connect-bitbucket-cloud)
2. Create an index. Code customization relies on an index to analyze and parse
   your repository for quicker code generation suggestions and lookups.

   ```
   resource "google_gemini_code_repository_index" "example" {
     location = "REGION"
     code_repository_index_id = "INDEX_NAME"
   }

   ```

   Replace the following:

   * `INDEX_NAME`: your index name. **Important**:
     Note your index name. You need it for several steps in this document.
   * `PROJECT_ID`: your Google Cloud project ID.
   * `REGION`: the region that is configured in
     Developer Connect in your Cloud project.

   Index creation generally takes 30 minutes to complete, but it might take
   up to an hour.

   Google limits the number of code repository indexes to one for each
   project and organization.
3. Control access to your index using repository groups. A repository group
   is a container for the indexing configuration, which includes repositories
   and their branch patterns. Repository groups are designed for granular
   IAM control, giving developers access to the indexed data
   from those groups, where they have the
   `cloudaicompanion.repositoryGroups.use` permission.

   Repository groups contain Developer Connect repositories,
   or links, from the same project and location.

   Administrators perform the following actions:

   * Create Code the Repository Index resource.
   * In the same project and location, configure a new
     Developer Connect connection.
   * Link Git repos in the connection.
   * Get links' resource names, pick branch pattern to index for each link,
     and put it to one or multiple repository groups.

   ```
   resource "google_gemini_repository_group" "example" {
     location = "REGION"
     code_repository_index = "INDEX_NAME"
     repository_group_id = "REPOSITORY_GROUP"
     repositories {
       resource = "REPOSITORY_RESOURCE_NAME"
       branch_pattern = "BRANCH_NAMES"
     }
   }

   ```

   Replace the following:

   * `REPOSITORY_GROUP`: name of the repository group,
     such as `default`.
   * `REPOSITORY_RESOURCE_NAME`: name of the repository
     inside the Developer Connect connection. To find the name
     of the repository, go to the
     [**Git repositories** page](https://console.cloud.google.com/developer-connect)
     in the Google Cloud console, and in the **Repositories** tab, look
     for the Connection ID under the **Connection** column in the table. To
     copy the resource name, click the
     more\_vert menu for more options, and
     select **Copy resource path**.
   * `BRANCH_NAMES`: name of the branches you want to
     index, such as `main|dev`.

   You also can create a repository group with repositories defined in a JSON
   (or YAML) file, formatted as follows:

   ### JSON

   ```
   [
     {
         "resource": "REPOSITORY_RESOURCE_NAME", "branchPattern": "main|dev"
     },
     {
         "resource": "REPOSITORY_RESOURCE_NAME", "branchPattern": "dev"
     }
   ]

   ```

   ### YAML

   ```
   - resource: REPOSITORY_RESOURCE_NAME
     branchPattern: main|dev

   - resource: REPOSITORY_RESOURCE_NAME
     branchPattern: dev

   ```

   To create a repository group based on a JSON or YAML file, in a shell
   environment, use the
   [`gemini code-repository-indexes repository-groups create` command](https://cloud.google.com/sdk/gcloud/reference/gemini/code-repository-indexes/repository-groups/create):

   ### JSON

   ```
   gcloud gemini code-repository-indexes repository-groups create REPOSITORY_GROUP \
       --project=PROJECT_ID \
       --location=REGION \
       --code-repository-index=INDEX_NAME \
       --repositories=FILEPATH.json

   ```

   ### YAML

   ```
   gcloud gemini code-repository-indexes repository-groups create REPOSITORY_GROUP \
       --project=PROJECT_ID \
       --location=REGION \
       --code-repository-index=INDEX_NAME \
       --repositories=FILEPATH.yaml

   ```

   If preferred, you can encrypt and control your data with a
   customer-managed encryption key (CMEK) through
   [Cloud Key Management Service](https://cloud.google.com/kms/docs). To learn more about using a
   CMEK, see
   [Encrypt data with customer-managed encryption keys](https://cloud.google.com/gemini/docs/codeassist/encrypt-data-cmek).
4. Grant IAM roles to the repository group on a project.

   You only receive suggestions from repositories in the index. Each
   repository belongs to one or multiple repository groups. To access
   suggestions, you must grant the Cloud AI Companion Repository Groups User
   IAM role
   (`roles/cloudaicompanion.repositoryGroupsUser`)—which contains the
   required `cloudaicompanion.repositoryGroups.user` IAM
   permission—to the repository group by one of the following ways:

   * Grant principals permission to access the entire index.
   * Grant principals access to a subset of the index.

   ### Entire index

   1. To bind an IAM policy for a project, in a shell
      environment, use the
      [`projects add-iam-policy-binding` command](https://cloud.google.com/sdk/gcloud/reference/projects/add-iam-policy-binding):

      ```
      gcloud projects add-iam-policy-binding PROJECT_ID \
          --member='PRINCIPAL' \
          --role='roles/cloudaicompanion.repositoryGroupsUser'

      ```

      Replace the following:

      * `PRINCIPAL`: the email address of the
        principal that needs access—for example,
        `user:test-user@gmail.com` for an individual, or
        `group:admins@example.com` for a group.

        For more information, see
        [`gcloud projects set-iam-policy`](https://cloud.google.com/sdk/gcloud/reference/projects/set-iam-policy).
   2. When prompted to specify a condition, enter `None`.

   ### Subset of the index

   You can create multiple repository groups and assign
   IAM roles to different IAM principals.

   ```
     data "google_iam_policy" "foo" {
       binding {
         role = "roles/cloudaicompanion.repositoryGroupsUser"
         members = ["test-user@example.com"]
       }
     }

     resource "google_gemini_repository_group_iam_policy" "foo" {
       project = "PROJECT_ID"
       location = "REGION"
       code_repository_index_id = "INDEX_NAME"
       repository_group_id = "GROUP_NAME"
       policy_data = data.google_iam_policy.foo.policy_data
     }

     data "google_gemini_repository_group_iam_policy" "foo" {
       project = "PROJECT_ID"
       location = "REGION"
       code_repository_index_id = "INDEX_NAME"
       repository_group_id = "GROUP_NAME"
       depends_on = [
         google_gemini_repository_group_iam_policy.foo
       ]
     }

   ```

   You can also create a binding:

   ```
     resource "google_gemini_repository_group_iam_binding" "foo" {
       project = "PROJECT_ID"
       location = "REGION"
       code_repository_index_id = "INDEX_NAME"
       repository_group_id = "GROUP_NAME"
       role = "roles/cloudaicompanion.repositoryGroupsUser"
       members = ["test-user@example.com"]
     }

   ```

   Replace the following:

   * `GROUP_NAME`: the repository group name
     you created in a preceding step to control access to your index
     using repository groups.

## Check indexing status

Depending on the number of repositories you want to index and their
size, indexing content can take up to 24 hours. For large repositories, indexing
can take longer. Indexing occurs once every 24 hours, picking up any changes
that were made in the repository.

1. Search for the `indexing` logs. For more information, see
   [Logging query language](https://cloud.google.com/logging/docs/view/logging-query-language).

   ### Console

   1. In the Google API Console, go to the
      [**Logs Explorer**](https://cloud.google.com/logging/docs/view/logs-explorer-interface).

      [Go to Logs Explorer](https://console.cloud.google.com/logs/query)
   2. Use the log names filter to view `indexing` logs.

   ### CLI

   To search for the indexing logs, in a shell environment, use the
   [`logging read` command](https://cloud.google.com/sdk/gcloud/reference/logging/read):

   ```
   gcloud logging read "logName="projects/PROJECT_ID/logs/indexing""

   ```

   Replace `PROJECT_ID` with the project ID where
   the repository group is located.

   For example, to view errors in the `indexing` logs, run the following
   command:

   ```
   gcloud logging read "logName="projects/PROJECT_ID/logs/indexing" AND severity>=ERROR"

   ```
2. Review the associated indexing statuses, such as the following:

   * Start of repository indexing-for example, `Indexing repository REPOSITORY_NAME. Total number of repositories: 10, succeeded: 6, failed: 0.`
   * End of individual repository indexing-for example:
     + Success: `Successfully finished indexing repository REPOSITORY_NAME. Total number of repositories: 10, succeeded: 7, failed: 0.`
     + Failure: `Failed to index repository REPOSITORY_NAME. Error: [<error message>]. Total number of repositories: 10, succeeded: 7, failed: 1.`
   * End of repository indexing-for example:
     + Success: `Finished indexing process. Repositories attempted: 10. Repositories successfully indexed: 9. Repositories unsuccessfully fetched: 0.`
     + Failure: `Finished indexing process. Repositories attempted: 10. Repositories successfully indexed: 9. Repositories unsuccessfully fetched: 1. Repositories that were not successfully fetched will be retried in the next run.`

   In the index statuses, `REPOSITORY_NAME` is the repository
   you want to review.
3. Review the associated indexing errors, such as the following:

   * Failed to fetch repository.
   * Failed to list repository files.
   * Failed to retrieve repository information from the index.
   * Failed to retrieve files from the index.
   * Internal error.

## Use code customization

Once you have set up code customization, you'll begin to see code completion
and code generation suggestions which may be based on private code you have
indexed in addition to results from full codebase awareness.

To learn more about using code customization and best practices, see
[Use code customization](https://developers.google.com/gemini-code-assist/docs/use-code-customization).

## Turn off code customization

Select one of the following options:

### Console

1. In the API Console, go to the **Gemini Products** page.

   [Go to Gemini Products](https://console.cloud.google.com/gemini-admin)

   The **Gemini Products** page loads.
2. In the navigation menu, click **Code customization**.

   The **Code customization** page loads.
3. To delete the index, click **Delete**.

   A warning message is displayed. If you want to proceed and delete the
   index, enter the index name, and then click **Delete**.

### CLI

1. To list all repository groups for the current index, in a shell
   environment, use the
   [`gemini code-repository-indexes repository-groups list` command](https://cloud.google.com/sdk/gcloud/reference/gemini/code-repository-indexes/repository-groups/list):

   ```
   gcloud gemini code-repository-indexes repository-groups list --location=REGION \
       --project=PROJECT_ID \
       --code-repository-index=INDEX_NAME --uri

   ```

   Replace the following:

   * `REGION`: the region that is configured in
     Developer Connect in your Cloud project. Note
     that commands will fail if you specify an unsupported region. See
     [code customization limitations](https://developers.google.com/gemini-code-assist/docs/code-customization-overview#limitations)
     for a list of supported regions.
   * `PROJECT_ID`: your Google Cloud project ID.
   * `INDEX_NAME`: name of the index you created in a
     preceding step to create an index.
2. To delete a repository group from the current index, use the
   [`gemini code-repository-indexes repository-groups delete` command](https://cloud.google.com/sdk/gcloud/reference/gemini/code-repository-indexes/repository-groups/list):

   ```
   gcloud gemini code-repository-indexes repository-groups delete REPOSITORY_GROUP \
       --location=REGION \
       --project=PROJECT_ID \
       --code-repository-index=INDEX_NAME

   ```
3. Repeat the preceding steps for each repository group until you delete all
   repository groups from the index.
4. Optional: To delete the index, in a shell environment, use the
   [`gemini code-repository-indexes delete` command](https://cloud.google.com/sdk/gcloud/reference/gemini/code-repository-indexes/delete):

   ```
   gcloud gemini code-repository-indexes delete INDEX_NAME \
       --location=REGION \
       --project=PROJECT_ID

   ```

## What's next

* Start using Gemini Code Assist:
  + VS Code, IntelliJ, and other supported JetBrains IDEs: [Code with Gemini Code Assist](https://developers.google.com/gemini-code-assist/docs/write-code-gemini-standard-enterprise)
  + Cloud Shell: [Code with Gemini Code Assist](https://cloud.google.com/code/docs/shell/write-code-gemini)
  + Cloud Workstations: [Code with Gemini Code Assist](https://cloud.google.com/workstations/docs/write-code-gemini)
* Learn how to [use code customization](https://developers.google.com/gemini-code-assist/docs/use-code-customization)
  and best practices.
* Learn how to [encrypt data with customer-managed encryption keys (CMEK)](https://cloud.google.com/gemini/docs/codeassist/encrypt-data-cmek).
* Learn more about [Developer Connect](https://cloud.google.com/developer-connect/docs/overview).
* Learn [how and when Gemini for Google Cloud uses your data](https://developers.google.com/gemini-code-assist/docs/data-governance).

Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.

Last updated 2025-09-08 UTC.