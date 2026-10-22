import { gql } from "@apollo/client";

export const UPDATE_EMAIL_TEMPLATE = gql`
  mutation UpdateEmailTemplate(
    $templateKey: String!
    $isEnabled: Boolean!
    $customSubject: String
    $customHeadline: String
    $customBody: String
    $customCtaText: String
    $customCtaUrl: String
    $customFooter: String
  ) {
    updateEmailTemplate(
      templateKey: $templateKey
      isEnabled: $isEnabled
      customSubject: $customSubject
      customHeadline: $customHeadline
      customBody: $customBody
      customCtaText: $customCtaText
      customCtaUrl: $customCtaUrl
      customFooter: $customFooter
    )
  }
`;

export const TOGGLE_EMAIL_TEMPLATE = gql`
  mutation ToggleEmailTemplate($templateKey: String!, $isEnabled: Boolean!) {
    toggleEmailTemplate(templateKey: $templateKey, isEnabled: $isEnabled)
  }
`;

export const RESET_EMAIL_TEMPLATE = gql`
  mutation ResetEmailTemplate($templateKey: String!) {
    resetEmailTemplate(templateKey: $templateKey)
  }
`;

export const SEND_TEST_EMAIL = gql`
  mutation SendTestEmail($templateKey: String!, $recipientEmail: String!) {
    sendTestEmail(templateKey: $templateKey, recipientEmail: $recipientEmail)
  }
`;
