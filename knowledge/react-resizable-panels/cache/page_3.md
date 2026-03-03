# Configure VPC Service Controls for Gemini

This document shows how to configure
[VPC Service Controls](https://cloud.google.com/vpc-service-controls/docs/overview) to
support [Gemini](https://cloud.google.com/gemini/docs/overview), an AI-powered
collaborator in Google Cloud. To complete this configuration, you do the
following:

1. Update your organization's service perimeter to include
   Gemini. This document assumes that you already have a
   service perimeter at the organization level. For more information about
   service perimeters, see [Service perimeter details and
   configuration](https://cloud.google.com/vpc-service-controls/docs/service-perimeters).
2. In projects that you have enabled access to Gemini,
   configure VPC networks to block outbound traffic except for
   traffic to the restricted VIP range.

## Before you begin

1. [Ensure that
   Gemini Code Assist is set up for your Google Cloud
   user account and project.](https://developers.google.com/gemini-code-assist/docs/set-up-gemini-standard-enterprise)
2. Make sure that you have the
   [required Identity and Access Management roles](https://cloud.google.com/vpc-service-controls/docs/access-control)
   to set up and administer VPC Service Controls.
3. Ensure that you have a service perimeter at the organization level that you
   can use to set up Gemini. If you don't have a service
   perimeter at this level, you can
   [create one](https://cloud.google.com/vpc-service-controls/docs/create-service-perimeters).

## Add Gemini to your service perimeter

To use VPC Service Controls with Gemini, you add
Gemini to the service perimeter at the organization level. The
service perimeter must include all the services that you use with
Gemini and other Google Cloud services that you want to
protect.

To add Gemini to your service perimeter, follow these steps:

1. In the API Console, go to the **VPC Service Controls** page.

   [Go to VPC Service Controls](https://console.cloud.google.com/security/service-perimeter)
2. Select your organization.
3. On the **VPC Service Controls** page, click the name of your perimeter.
4. Click **Add Resources** and do the following:

   1. For each project in which you have enabled Gemini, in
      the
      **Add resources** pane, click **Add project**, and then do the following:
   2. In the **Add projects** dialog, select the projects that you want to
      add.

      If you're using
      [Shared VPC](https://cloud.google.com/vpc/docs/shared-vpc), add the host
      project and service projects to the service perimeter.
   3. Click **Add selected resources**. The added projects appear in the
      **Projects** section.
   4. For each VPC network in your projects, in the **Add
      resources** pane, click **Add VPC network**, and then do the following:
   5. From the list of projects, click the project that contains the
      VPC network.
   6. In the **Add resources** dialog, select the VPC network's
      checkbox.
   7. Click **Add selected resources**. The added network appears in the **VPC
      networks** section.
5. Click **Restricted Services** and do the following:

   1. In the **Restricted Services** pane, click **Add services**.
   2. In the **Specify services to restrict** dialog, select
      **Gemini for Google Cloud API** and **Gemini Code Assist API** as
      the services that you want to secure within the perimeter.
   3. If you're planning to use
      [code customization](https://developers.google.com/gemini-code-assist/docs/code-customization-overview),
      select **Developer Connect API** as well. For more information
      about Developer Connect, see
      [Developer Connect overview](https://cloud.google.com/developer-connect/docs/overview).

      To learn how to use Organization Policy Service custom constraints to restrict
      specific operations on `developerconnect.googleapis.com/Connection` and
      `developerconnect.googleapis.com/GitRepositoryLink`, see
      [Create custom organization policies](https://cloud.google.com/developer-connect/docs/custom-constraints).
   1. Click **Add n services**, where n is the number of
      services you selected in the previous step.
6. Optional: If your developers need to use Gemini within the
   perimeter from the Cloud Code plugin in their IDEs, then you'll
   need to configure the
   [ingress policy](https://cloud.google.com/vpc-service-controls/docs/ingress-egress-rules).

   Enabling VPC Service Controls for Gemini prevents all
   access from outside the perimeter, including running
   Gemini Code Assist IDE extensions from machines not in the
   perimeter, such as company laptops. Therefore, these steps are necessary if
   you want to use Gemini with the Gemini Code Assist
   plugin.

   1. Click **Ingress policy**.
   2. In the **Ingress rules** pane, click **Add rule**.
   3. In **From attributes of the API client**, specify the sources from
      outside the perimeter that require access. You can specify projects,
      access levels, and VPC networks as sources.
   4. In **To attributes of Google Cloud resources/services**, specify
      the service name of Gemini and
      Gemini Code Assist API.

   For a list of ingress rule attributes, see
   [Ingress rules reference](https://cloud.google.com/vpc-service-controls/docs/ingress-egress-rules#ingress-rules-reference).
7. Optional: If your organization uses
   [Access Context Manager](https://cloud.google.com/access-context-manager/docs) and you want to
   provide developers access to protected resources from outside the perimeter,
   then set access levels:

   1. Click **Access Levels**.
   2. In the **Ingress Policy: Access Levels** pane, select the **Choose
      Access Level** field.
   3. Select the checkboxes corresponding to the access levels that you want
      to apply to the perimeter.
8. Click **Save**.

After you complete these steps, VPC Service Controls checks all calls to the
Gemini for Google Cloud API to ensure that they originate from within the same
perimeter.

## Configure VPC networks

You need to configure your VPC networks so that the requests sent
to the regular `googleapis.com` virtual IP are automatically routed to the
[restricted virtual IP (VIP)
range](https://cloud.google.com/vpc/docs/private-access-options#domain-vips),
`199.36.153.4/30` (`restricted.googleapis.com`), where your Gemini
service is serving. You don't need to change any configurations in the
Gemini Code Assist IDE extensions.

For each VPC network in your project, follow these steps to block
outbound traffic except for traffic to the restricted VIP range:

1. Enable [Private Google Access](https://cloud.google.com/vpc/docs/configure-private-google-access)
   on the subnets hosting your VPC network resources.
2. [Configure firewall rules](https://cloud.google.com/vpc-service-controls/docs/set-up-private-connectivity#configure-firewall)
   to prevent data from leaving the VPC network.

   1. Create a deny egress rule that blocks all outbound traffic.
   1. Create an allow egress rule that permits traffic to `199.36.153.4/30` on
      TCP port `443`. Ensure that the allow egress rule has a priority before the
      deny egress rule that you have just created—this allows egress only to the
      restricted VIP range.
3. [Create a Cloud DNS response policy](https://cloud.google.com/dns/docs/zones/manage-response-policies#creating-response-policy).
4. [Create a rule for the response policy](https://cloud.google.com/dns/docs/zones/manage-response-policies#create-response-policy-rule)
   to resolve `*.googleapis.com` to `restricted.googleapis.com` with the
   following values:

   * DNS name: `*.googleapis.com.`
   * Local data: `restricted.googleapis.com.`
   * Record type: `A`
   * TTL: `300`
   * RR data: `199.36.153.4|199.36.153.5|199.36.153.6|199.36.153.7`

   The IP address range for `restricted.googleapis.com` is `199.36.153.4/30`.

After you complete these steps, the requests that originate from within the
VPC network are unable to leave the VPC network,
preventing egress outside the service perimeter. These requests can only reach
Google APIs and services that check VPC Service Controls, preventing
exfiltration through Google APIs.

## Additional configurations

Depending on the Google Cloud products that you use with
Gemini, you must consider the following:

* **Client machines connected to the perimeter.** Machines that are inside the
  VPC Service Controls perimeter can access all Gemini
  experiences. You can also extend the perimeter to an authorized [Cloud VPN](https://cloud.google.com/network-connectivity/docs/vpn/concepts/overview)
  or [Cloud Interconnect](https://cloud.google.com/network-connectivity/docs/interconnect)
  from an external network.
* **Client machines outside the perimeter.** When you have client machines
  outside the service perimeter, you can grant controlled access to the
  restricted Gemini service.

  + For more information, see
    [Allow access to protected resources from outside a perimeter](https://cloud.google.com/vpc-service-controls/docs/use-access-levels).
  + For an example of how to create an access level on a corporate network,
    see [Limit access on a corporate network](https://cloud.google.com/access-context-manager/docs/create-basic-access-level#corporate-network-example).
  + Review the [limitations](https://cloud.google.com/vpc-service-controls/docs/supported-products#table_duetai)
    when using VPC Service Controls with Gemini.
* **Gemini Code Assist.** For compliance with
  VPC Service Controls, make sure the IDE or workstation you're using
  doesn't have access to `https://www.google.com/tools/feedback/mobile`
  through firewall policies.
* **Cloud Workstations.** If you use Cloud Workstations, follow the
  instructions in
  [Configure VPC Service Controls and private clusters](https://cloud.google.com/workstations/docs/configure-vpc-service-controls-private-clusters).

## What's next

* For information about the compliance offerings in Google Cloud, see
  [Compliance resource center](https://cloud.google.com/security/compliance).