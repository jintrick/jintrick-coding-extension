# Set up Gemini Code Assist Standard and Enterprise

Before you can use
[Gemini Code Assist](https://developers.google.com/gemini-code-assist/docs/overview) Standard or
Enterprise, your team needs to perform the setup steps that are
described in this document:

1. [Purchase a subscription to Gemini Code Assist Standard or Enterprise](#purchase-subscription).
2. [Assign licenses to individual users in your organization](#assign_licenses).
3. [Enable the Gemini for Google Cloud API in a Google Cloud project](#enable-api).
4. [Grant Identity and Access Management roles in a Google Cloud project](#grant-iam).
5. Your organization's users [install the Gemini Code Assist plugin](#install-gemini-code-assist)
   to use Gemini Code Assist Standard or Enterprise in an IDE.
   This step isn't required for Gemini CLI users or
   [Gemini in Android Studio](https://developer.android.com/studio/gemini/overview)
   users.

## Purchase a Gemini Code Assist subscription

For a list of features available in each edition, see
[Supported features](https://developers.google.com/gemini-code-assist/docs/overview#supported-features).

For new Gemini Code Assist customers with billing accounts that
never had a Gemini Code Assist subscription, we automatically
apply credits equivalent to up to 50 free licenses for the first month,
regardless of [Gemini Code Assist edition](https://cloud.google.com/gemini/docs/codeassist/overview#supported-features).
Note that you cannot increase the number of free credits after the initial free
license credits are allotted. Additionally, you cannot change the
Gemini Code Assist edition within the first month.

If you have existing contracts with Google Cloud,
[contact our sales team](https://cloud.google.com/contact/) before purchasing a
subscription.

1. Go to the **Admin for Gemini** page.

   [Go to Admin for Gemini](https://console.cloud.google.com/gemini-admin)

   The **Admin for Gemini** page opens.
2. Select **Get Gemini Code Assist**.

   Note that if you don't have the required `consumerprocurement.orders.place`
   permission, then this button is disabled. If a
   Gemini Code Assist subscription already exists for the billing
   account associated with the project, this button displays as
   **Manage Gemini Code Assist** and lets you
   [edit your subscription](https://developers.google.com/gemini/docs/admin).

   The **Get Gemini Code Assist subscription** page opens.
3. In **Select Gemini Code Assist subscription Edition**, select a
   Gemini Code Assist edition. Select
   **Compare Gemini Code Assist Editions** to see a detailed list of
   [features available to each edition](https://developers.google.com/gemini-code-assist/docs/overview#supported-features).

   Then, select **Continue**.
4. In **Configure subscription**, complete the fields to configure the
   subscription, including the following:

   * Subscription name.
   * Number of licenses in the subscription. Note that if you are purchasing
     Enterprise edition, then you must purchase at least 10 licenses.
   * Subscription period (monthly or yearly). With an annual subscription, you
     are given a discounted rate that is charged on a monthly basis rather
     than a one-time payment.
5. To confirm subscription, select **Continue**.
6. If you agree to the terms, select **I agree to the terms of this purchase**,
   and then select **Confirm subscription**.
7. Select **Next: Manage Gemini License Assignments**.

The subscription is now purchased for Gemini Code Assist Standard
or Enterprise. You now need to manage Gemini license assignments in
your organization.

## Assign licenses

Before using Gemini Code Assist, a license must be assigned to each
individual user that should be granted access in the organization.

For new Gemini Code Assist customers with billing accounts that
never had a Gemini Code Assist subscription, we automatically
apply credits equivalent to up to 50 free licenses for the first month,
regardless of [Gemini Code Assist edition](https://cloud.google.com/gemini/docs/codeassist/overview#supported-features).
Note that you cannot increase the number of free credits after the initial free
license credits are allotted. Additionally, you cannot change the
Gemini Code Assist edition within the first month.

By default, new subscriptions require you to manually assign licenses. Once
you're set up, you can then choose to assign licenses manually or automatically.

### Console

To assign Gemini licenses to individual users in the
API Console, you must have the following permissions on the billing
account:

* `billing.accounts.get`
* `billing.accounts.list`
* `consumerprocurement.orders.get`
* `consumerprocurement.orders.list`
* `consumerprocurement.orders.modify`
* `consumerprocurement.orders.place`
* `consumerprocurement.licensePools.enumerateLicensedUsers`
* `consumerprocurement.licensePools.get`
* `consumerprocurement.licensePools.update`
* `consumerprocurement.licensePools.assign`
* `consumerprocurement.licensePools.unassign`

1. Go to the **Admin for Gemini** page.

   [Go to Gemini for Google Cloud](https://console.cloud.google.com/gemini-admin)
2. Choose the subscription that you want to change, and then click
   **Modify Subscription**.
3. For this billing account, verify that you set **License Assignment** to
   **Manually Assign Licenses**. If the billing account is set to
   **Automatically Assign Licenses**, then you cannot manage individual
   licenses. Switching this billing account to **Manually Assign Licenses**
   turns off automatic license assignment after the change, but
   pre-existing license assignments are unaffected.
4. Click **Assign Licenses**. A user selection dialog appears. To search
   for specific users, enter their name in the search box.
5. Select one or more users from the list, and then click **Next**.
6. Choose the Gemini services you want to assign licenses for.
7. Click **Assign Licenses**.

### API

To assign Gemini licenses with the API, use the
[`billingAccounts.orders.licensePool.assign` method](https://developers.google.com/marketplace/docs/reference/consumerprocurement/rest/v1/billingAccounts.orders.licensePool/assign).

1. Ensure that you have the `consumerprocurement.licensePools.assign`
   Identity and Access Management permission on the billing account that contains
   the license pool whose license you intend to assign.
2. Create a JSON file that contains the following information:

   ```
   {
     "usernames": [
       USER_EMAILS
     ]
   }

   ```

   Where `USER_EMAILS` is a comma-separated list of
   user accounts who are being assigned the license. For example,
   `"dana@example.com", "lee@example.com"`.
3. Use [`cURL`](http://curl.haxx.se/) to call the method:

   ```
   curl -X POST --data-binary @JSON_FILE_NAME \
     -H "Authorization: Bearer $(gcloud auth print-access-token)" \
     -H "X-Goog-User-Project: PROJECT_ID" \
     -H "Content-Type: application/json" \
     "https://cloudcommerceconsumerprocurement.googleapis.com/v1/billingAccounts/BILLING_ACCOUNT_ID/orders/ORDER_ID/licensePool:assign/"
   ```

   Replace the following:

   * `JSON_FILE_NAME`: the path for the JSON
     file that you created in Step 2.
   * PROJECT\_ID: the ID for a project. Quota usage and charges
     associated with the API request are applied against this project.
   * `BILLING_ACCOUNT_ID`: the ID for the
     billing account associated with the license pool.
   * `ORDER_ID`: the order ID. If you don't know
     the order ID, you can retrieve it by
     [listing the orders associated with your billing account](https://developers.google.com/marketplace/docs/reference/consumerprocurement/rest/v1/billingAccounts.orders/list).

If successful, the response is similar to the following:

```
  {}

```

You now need to enable the [Gemini for Google Cloud API](#enable-api) in one or
more projects that are associated with this billing account. Users won't see
Gemini Code Assist until you activate it in at least one project.

## Enable the Gemini for Google Cloud API in a Cloud project

This section describes the steps required to enable the
Gemini for Google Cloud API in a Cloud project.

### Console

1. To enable the Gemini for Google Cloud API, go to the
   **Gemini for Google Cloud** page.

   [Go to Gemini for Google Cloud](https://console.cloud.google.com/marketplace/product/google/cloudaicompanion.googleapis.com)
2. In the project selector, select a project.
3. Click **Enable**.

   The page updates and shows a status of **Enabled**.
   Gemini is now available in the selected
   Cloud project to all users who have the required
   IAM roles.

### gcloud

To use a local development environment,
[install](https://cloud.google.com/sdk/docs/install) and
[initialize](https://cloud.google.com/sdk/docs/initializing) the gcloud CLI.

1. In the project selector menu, select a project.
2. Enable the Gemini for Google Cloud API for Gemini using
   the
   [`gcloud services enable` command](https://cloud.google.com/sdk/gcloud/reference/services/enable):

   ```
   gcloud services enable cloudaicompanion.googleapis.com

   ```

   If you want to enable the Gemini for Google Cloud API in a different
   Cloud project, add the
   `--project` parameter:

   ```
   gcloud services enable cloudaicompanion.googleapis.com --project PROJECT_ID

   ```

   Replace `PROJECT_ID` with your Cloud project
   ID.

   The output is similar to the following:

   ```
   Waiting for async operation operations/acf.2e2fcfce-8327-4984-9040-a67777082687 to complete...
   Operation finished successfully.

   ```

Gemini for Google Cloud is now available in the specified
Cloud project to all users who have the
[required IAM roles](#grant-iam).

### Configure the firewall for API traffic between your IDE and Google

In addition to enabling the Gemini for Google Cloud, users behind firewalls
also need to allow traffic to pass through for the following APIs:

* [`oauth2.googleapis.com`](https://developers.google.com/identity/protocols/oauth2):
  used to sign in to Google Cloud.
* [`serviceusage.googleapis.com`](https://console.cloud.google.com/marketplace/product/google/serviceusage.googleapis.com):
  used for checking that the user's Gemini Code Assist project is
  properly configured.
* [`cloudaicompanion.googleapis.com`](https://console.cloud.google.com/marketplace/product/google/cloudaicompanion.googleapis.com): the primary Gemini for Google Cloud API endpoint.
* `cloudcode-pa.googleapis.com`: an internal API that provides IDE-related
  features.
* [`cloudresourcemanager.googleapis.com`](https://console.cloud.google.com/marketplace/product/google/cloudresourcemanager.googleapis.com):
  used in the IDEs for project pickers. The Resource Manager API may not be
  necessary if the projects are explicitly configured in your `settings.json`
  file.
* [`people.googleapis.com`](https://console.cloud.google.com/marketplace/product/google/people.googleapis.com):
  provides access to information about profiles and contacts.
* `firebaselogging-pa.googleapis.com`: an internal API used for sending product
  telemetry including events as to whether suggestions were accepted.
* `feedback-pa.googleapis.com`: an internal API used for in-IDE feedback
  submission.
* [`apihub.googleapis.com`](https://console.cloud.google.com/marketplace/product/google/apihub.googleapis.com):
  used by the Cloud Code API Browser feature.
* `lh3.googleusercontent.com` and `lh5.googleusercontent.com`: used to obtain
  user photos.

### Determine IP addresses for Google Cloud default domains

To enable connectivity from your IDE to Google Cloud APIs, your firewall must
allow outbound TCP traffic to Google's publicly documented IP address ranges.
These ranges are dynamically managed by Google.

To maintain a list of IP ranges to access Google Cloud domains, you have several
options:

* Use our published lists or automate a script to
  [obtain Google IP address ranges](https://support.google.com/a/answer/10026322).
* Use the [private.googleapis.com Virtual IP](https://developers.google.com/vpc/docs/configure-private-google-access#domain-options).
* Use [Private Service Connect](https://developers.google.com/vpc/docs/configure-private-service-connect-apis).

### Optional: Configure VPC Service Controls

If your organization has a service perimeter, then you must add the following
resources to your perimeter:

* Gemini for Google Cloud API
* Gemini Code Assist API

If you are using Gemini Code Assist Standard or Enterprise from
outside of your service perimeter, then you also need to modify the ingress
policy to allow access to those services.

For more information, see
[Configure VPC Service Controls for Gemini](https://developers.google.com/gemini-code-assist/docs/configure-vpc-service-controls).

## Grant IAM roles in a Google Cloud project

This section describes the steps required to grant the Gemini for Google Cloud User
and Service Usage Consumer IAM roles to users.

### Console

1. To grant the IAM roles that are required to use
   Gemini, go to the **IAM & Admin** page.

   [Go to IAM & Admin](https://console.cloud.google.com/projectselector/iam-admin/iam?supportedpurview=)
2. In the **Principal** column, find a
   [principal](https://cloud.google.com/iam/docs/overview#concepts_related_identity)
   for which you want to give access to Gemini, and then
   click **Edit principal** in that
   row.
3. In the **Edit access** pane, click
   **Add another role**.
4. In **Select a role**, select **Gemini for Google Cloud User**.
5. Click **Add another role** and select **Service Usage Consumer**.
6. Click **Save**.

### gcloud

To use a local development environment,
[install](https://cloud.google.com/sdk/docs/install) and
[initialize](https://cloud.google.com/sdk/docs/initializing) the gcloud CLI.

1. In the project selector menu, select a project.
2. Grant the Gemini for Google Cloud User role:

   ```
   gcloud projects add-iam-policy-binding PROJECT_ID \
     --member=PRINCIPAL --role=roles/cloudaicompanion.user

   ```

   Replace the following:

   * `PROJECT_ID`: the ID of your
     Cloud project—for example,`1234567890`.
   * `PRINCIPAL`: the
     [identifier](https://developers.google.com/iam/docs/principal-identifiers) for the
     principal—for example, `user:cloudysanfrancisco@gmail.com`.

   The output is a list of policy bindings that includes the following:

   ```
   - members:
     - user:PRINCIPAL
     role: roles/cloudaicompanion.user

   ```
3. Repeat the previous step for the role `roles/serviceusage.serviceUsageConsumer`.

For more information, see
[Grant a single role](https://cloud.google.com/iam/docs/granting-changing-revoking-access#grant-single-role)
and
[`gcloud projects add-iam-policy-binding`](https://cloud.google.com/sdk/gcloud/reference/projects/add-iam-policy-binding).

All of the users who have been granted these roles can access
Gemini for Google Cloud features in the
API Console within the specified project. For more information, see
[Gemini for Google Cloud overview](https://cloud.google.com/gemini/docs/overview).

## Install the Gemini Code Assist plugin

Your organization's users install the Gemini Code Assist plugin
in their preferred
[supported IDE](https://developers.google.com/gemini-code-assist/docs/supported-languages#supported_ides).
Users of supported JetBrains IDEs should follow the IntelliJ instructions.

### VS Code

1. To open the **Extensions** view in VS Code, click
   ![Extension icon](https://cloud.google.com/code/docs/vscode/images/vscodeextension.png)
   **Extensions** or press `Ctrl`/`Cmd`+`Shift`+`X`.
2. Search for `Gemini Code Assist`.
3. Click **Install**.
4. If prompted, restart VS Code.

   After the extension has successfully installed,
   Gemini Code Assist appears in the activity bar and is
   ready for use. You can further configure your
   Gemini Code Assist installation by specifying your
   preferences using the top-level application taskbar: navigate to
   **Code** > **Settings** > **Settings**
   > **Extensions** and search for `Gemini Code Assist`.

### IntelliJ

1. Click settings **IDE
   and Project Settings** > **Plugins**.
2. In the **Marketplace** tab, search for `Gemini Code Assist`.
3. Click **Install** to install the plugin.
4. When the installation is finished, click **Restart IDE**.
5. When the IDE restarts, Gemini Code Assist appears in your
   activity bar.

   ![The Gemini Code Assist icon appears in the activity bar.](https://cloud.google.com/code/docs/intellij/images/gemini-code-assist-icon-in-activity-bar.png)

Now the users are ready to use Gemini Code Assist Standard or
Enterprise in their IDE. Learn more about the supported features:

* [Code features overview](https://developers.google.com/gemini-code-assist/docs/code-overview)
* [Chat features overview](https://developers.google.com/gemini-code-assist/docs/chat-overview)

Get started with the following guides:

* [Code with Gemini Code Assist](https://developers.google.com/gemini-code-assist/docs/write-code-gemini)
* [Chat with Gemini Code Assist](https://developers.google.com/gemini-code-assist/docs/chat-gemini)

### List of directories where Gemini Code Assist caches information

The following table provides a list of directories where
Gemini Code Assist stores extension information such as auth
tokens:

### Windows

* `%LOCALAPPDATA%/cloud-code`
* `%LOCALAPPDATA%/google-vscode-extension`

### macOS

* `~/Library/Application Support/cloud-code`
* `~/Library/Application Support/google-vscode-extension`

### Linux

* `~/.cache/cloud-code`
* `~/.cache/google-vscode-extension`

## Sign into Google and select a Google Cloud project

Once users have installed Gemini Code Assist in their IDEs, they
need to sign in to their Google Accounts, and if it's their first time using
Gemini Code Assist Standard or Enterprise in their IDE, they
select a Google Cloud project.

### VS Code

If you select a Google Cloud project without the
Gemini for Google Cloud API enabled, you receive a notification that gives
you the option to enable the API from the IDE. Select **Enable the API**
in the notification window to enable the API for your project. For more
information, see
[Set up Gemini Code Assist Standard and Enterprise for a project](https://developers.google.com/gemini-code-assist/docs/set-up-gemini-standard-enterprise).

If you prefer to follow the **Code with
Gemini Code Assist** walkthrough directly in your IDE,
click **Launch VS Code** and follow the steps in the walkthrough to
connect to Google Cloud and activate
Gemini Code Assist Standard or Enterprise.

[Launch VS Code](vscode://googlecloudtools.cloudcode/cloudcode.openWalkthrough?id=duet-ai)

Otherwise, follow these steps:

1. Launch your IDE.
2. In the activity bar, click **Gemini Code Assist**.
3. In the **Gemini Code Assist** chat pane, click **Login to Google
   Cloud**.
4. When prompted to allow Gemini Code Assist to open the
   external website, click **Open**.
5. Follow the prompts to sign into your Google Account.
6. When asked if you downloaded Gemini Code Assist from
   Google, click **Sign In**.

   You're now connected to Google Cloud.

   Next, to select a Google Cloud project that has the
   Gemini for Google Cloud API enabled, follow these steps:
7. In the **Gemini Code Assist** status bar, click **Gemini Code Assist**.

   ![The Gemini status bar is available.](https://cloud.google.com/code/docs/vscode/images/duet-ai-status-bar-no-project-selected.png)
8. In the **Gemini Code Assist** menu, select **Select Gemini Code
   project**.
9. Select a Google Cloud project that has the
   Gemini for Google Cloud API enabled.

   Gemini Code Assist Standard or Enterprise is ready to
   use.

   ![The Gemini icon in status bar is set to normal.](https://cloud.google.com/code/docs/vscode/images/duet-ai-status-bar-project-selected.png)

### IntelliJ

To sign in to your Google Account, follow these steps:

1. In the activity bar, click
   spark **Gemini Code
   Assist**.
2. Click **Log in to Google**.
3. On the page that opens in the web browser, select your Google Account.
4. On the screen that asks you to make sure that you downloaded this app
   from Google, click **Sign in**.

   Gemini Code Assist is now authorized to access your
   account.

   Next, if this is your first time using Gemini Code Assist
   Standard or Enterprise in your IDE, you must select a Google Cloud
   project by following these steps:
5. Return to your IDE. In the Gemini Code Assist tool
   window, if you agree to allow Google to enable the APIs required to use
   Gemini Code Assist on your behalf for your selected
   project, click **Select a GCP project** to continue.
6. In the **Select Google Cloud Project** dialog, search for and select
   your Google Cloud project, and then click **OK**.
7. Click **FINISH**.

Your Google Cloud project is selected with the
Gemini Code Assist API enabled. You're ready to use
Gemini Code Assist Standard or Enterprise in your IDE!

## Advanced setup tasks

Instead of using the API Console or the gcloud to
grant predefined IAM roles, you can do any of the following:

* Use [IAM REST APIs](https://cloud.google.com/iam/docs/reference/rest) or
  [IAM client libraries](https://cloud.google.com/iam/docs/reference/libraries)
  to grant roles.

  If you use these interfaces, use the fully qualified role names:

  + `roles/cloudaicompanion.user`
  + `roles/serviceusage.serviceUsageConsumer`

  For more information about granting roles, see
  [Manage access to projects, folders, and organizations](https://cloud.google.com/iam/docs/granting-changing-revoking-access).
* Create and grant custom roles.

  Any [custom roles](https://cloud.google.com/iam/docs/creating-custom-roles) that you
  create need the following permissions for you to access
  Gemini Code Assist Standard and Enterprise:

  + `cloudaicompanion.companions.generateChat`
  + `cloudaicompanion.companions.generateCode`
  + `cloudaicompanion.instances.completeCode`
  + `cloudaicompanion.instances.completeTask`
  + `cloudaicompanion.instances.generateCode`
  + `cloudaicompanion.instances.generateText`
  + `cloudaicompanion.instances.exportMetrics`
  + `cloudaicompanion.instances.queryEffectiveSetting`
  + `cloudaicompanion.instances.queryEffectiveSettingBindings`
  + `serviceusage.services.enable`
* Assign and manage licenses.

  Any [custom roles](https://cloud.google.com/iam/docs/creating-custom-roles) that you
  create need the following permissions for you to assign and manage
  Gemini Code Assist licenses:

  + `consumerprocurement.orders.get`
  + `consumerprocurement.orders.licensePools.*`
  + `consumerprocurement.orders.licensePools.update`
  + `consumerprocurement.orders.licensePools.get`
  + `consumerprocurement.orders.licensePools.assign`
  + `consumerprocurement.orders.licensePools.unassign`
  + `consumerprocurement.orders.licensePools.enumerateLicensedUsers`

Also note that for any of the preceding permissions to work, the
Gemini for Google Cloud API needs to be enabled in the same Google Cloud project where
you've assigned each permission.

## What's next

* Learn more about the
  [types of generative AI assistance available in Gemini for Google Cloud](https://cloud.google.com/gemini/docs/overview).
* Learn
  [how Gemini for Google Cloud uses your data](https://developers.google.com/gemini-code-assist/docs/data-governance).
* Learn
  [how to access and manage Gemini Code Assist Standard and Enterprise administrator controls](https://developers.google.com/gemini-code-assist/docs/admin).
* Learn [how to configure code customization](https://developers.google.com/gemini-code-assist/docs/code-customization) for Gemini Code Assist Enterprise.
* [Configure VPC Service Controls for Gemini Code Assist Standard and Enterprise](https://developers.google.com/gemini-code-assist/docs/configure-vpc-service-controls).