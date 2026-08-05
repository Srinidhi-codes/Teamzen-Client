import { gql } from "@apollo/client";

export const FIRST_DAY_WIZARD = gql`
  query FirstDayWizard {
    firstDayWizard {
      shouldShow
      hasSeenAiOnboarding
      onboardingIncomplete
      profile {
        firstName
        fullName
        role
        department
        designation
        organization
      }
      onboarding {
        status
        progressPct
        pendingTaskCount
        pendingDocCount
        rejectedDocCount
        nextTaskTitle
        nextTaskPhase
      }
      steps {
        id
        title
        summary
        route
        routeLabel
        bullets
      }
    }
  }
`;
