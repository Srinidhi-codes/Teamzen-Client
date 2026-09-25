import { gql } from "@apollo/client";

export const CREATE_EMPLOYEE_DOCUMENT_REQUEST = gql`
  mutation CreateEmployeeDocumentRequest($input: CreateEmployeeDocumentRequestInput!) {
    createEmployeeDocumentRequest(input: $input) {
      success
      error
      id
    }
  }
`;
