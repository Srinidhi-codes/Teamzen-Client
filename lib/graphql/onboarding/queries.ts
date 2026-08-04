import { gql } from "@apollo/client";

export const MY_ONBOARDING = gql`
  query MyOnboarding {
    myOnboarding {
      id
      status
      progressPct
      joinDate
      userName
      userEmail
      templateName
      tasks {
        id
        title
        description
        assigneeRole
        phase
        status
        dueAt
        isRequired
        requiresDocumentCategory
        sortOrder
        notes
      }
      documents {
        id
        category
        title
        fileName
        fileUrl
        verificationStatus
        rejectionReason
        aiSuggestedCategory
      }
      offerLetter {
        id
        subject
        bodyHtml
        pdfUrl
        status
        acceptedName
        acceptedAt
      }
    }
  }
`;

export const MY_ASSIGNED_ONBOARDING_TASKS = gql`
  query MyAssignedOnboardingTasks {
    myAssignedOnboardingTasks {
      id
      title
      description
      status
      dueAt
      phase
      assigneeRole
    }
  }
`;

export const PREBOARDING_SESSION = gql`
  query PreboardingSession($inviteToken: String!) {
    preboardingSession(inviteToken: $inviteToken) {
      id
      status
      progressPct
      joinDate
      userName
      userEmail
      departmentName
      designationName
      tasks {
        id
        title
        description
        assigneeRole
        phase
        status
        dueAt
        requiresDocumentCategory
      }
      documents {
        id
        category
        title
        fileName
        fileUrl
        verificationStatus
        rejectionReason
      }
      offerLetter {
        id
        subject
        bodyHtml
        pdfUrl
        status
        acceptedAt
      }
    }
  }
`;

export const COMPLETE_MY_ONBOARDING_TASK = gql`
  mutation CompleteOnboardingTask($taskId: ID!, $notes: String) {
    completeOnboardingTask(taskId: $taskId, notes: $notes) {
      id
      progressPct
      status
      tasks {
        id
        status
        title
      }
    }
  }
`;

export const ACCEPT_OFFER = gql`
  mutation AcceptOfferLetter($input: AcceptOfferInput!) {
    acceptOfferLetter(input: $input) {
      id
      progressPct
      offerLetter {
        id
        status
        acceptedName
        acceptedAt
      }
    }
  }
`;

export const UPDATE_PREBOARDING_PROFILE = gql`
  mutation UpdatePreboardingProfile($input: UpdatePreboardingProfileInput!) {
    updatePreboardingProfile(input: $input) {
      id
      progressPct
      userName
    }
  }
`;
