import { gql } from "@apollo/client";

export const MY_OFFBOARDING = gql`
  query MyOffboarding {
    myOffboarding {
      id
      status
      reason
      progressPct
      exitDate
      lastWorkingDay
      notes
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
        notes
      }
      settlement {
        id
        status
        proRataSalary
        leaveEncashment
        bonusGratuity
        otherAdditions
        recoveries
        otherDeductions
        netPayable
        notes
        approvedAt
        acknowledgedAt
      }
      letters {
        id
        letterType
        subject
        pdfUrl
        downloadUrl
        status
        issuedAt
      }
    }
  }
`;

export const EXIT_SESSION = `
  query ExitSession($inviteToken: String!) {
    exitSession(inviteToken: $inviteToken) {
      inviteValid
      offboarding {
        id
        status
        reason
        progressPct
        exitDate
        lastWorkingDay
        userName
        userEmail
        notes
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
        }
        settlement {
          id
          status
          proRataSalary
          leaveEncashment
          bonusGratuity
          otherAdditions
          recoveries
          otherDeductions
          netPayable
          notes
          approvedAt
          acknowledgedAt
        }
        letters {
          id
          letterType
          subject
          pdfUrl
          downloadUrl
          status
        }
      }
    }
  }
`;

export const COMPLETE_OFFBOARDING_TASK = `
  mutation CompleteOffboardingTask($taskId: ID!, $notes: String, $inviteToken: String) {
    completeOffboardingTask(taskId: $taskId, notes: $notes, inviteToken: $inviteToken) {
      success
      error
    }
  }
`;

export const ACK_SETTLEMENT = `
  mutation AcknowledgeFnfSettlement($inviteToken: String!) {
    acknowledgeFnfSettlement(inviteToken: $inviteToken) {
      success
      error
    }
  }
`;
