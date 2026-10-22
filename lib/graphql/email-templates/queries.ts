import { gql } from "@apollo/client";

export const GET_EMAIL_TEMPLATE_SETTINGS = gql`
  query GetEmailTemplateSettings($category: String) {
    emailTemplateSettings(category: $category) {
      key
      name
      category
      description
      isEnabled
      defaultSubject
      defaultHeadline
      defaultBody
      defaultCtaText
      defaultCtaUrl
      defaultFooter
      customSubject
      customHeadline
      customBody
      customCtaText
      customCtaUrl
      customFooter
      activeSubject
      activeHeadline
      activeBody
      activeCtaText
      activeCtaUrl
      activeFooter
      availableTokens
      sampleContextJson
      previewHtml
      isCustomized
      updatedAt
    }
  }
`;

export const RENDER_EMAIL_PREVIEW = gql`
  query RenderEmailPreview(
    $templateKey: String!
    $customHeadline: String
    $customBody: String
    $customCtaText: String
    $customCtaUrl: String
    $customFooter: String
  ) {
    renderEmailPreview(
      templateKey: $templateKey
      customHeadline: $customHeadline
      customBody: $customBody
      customCtaText: $customCtaText
      customCtaUrl: $customCtaUrl
      customFooter: $customFooter
    )
  }
`;
