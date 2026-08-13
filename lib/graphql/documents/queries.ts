import { gql } from "@apollo/client";

export const MY_ISSUED_DOCUMENTS = gql`
  query MyIssuedDocuments {
    myIssuedDocuments {
      id
      category
      title
      financialYear
      fileName
      downloadUrl
      notes
      publishedAt
    }
  }
`;

export const MY_DOCUMENT_REQUESTS = gql`
  query MyDocumentRequests($status: String) {
    myDocumentRequests(status: $status) {
      id
      category
      title
      description
      status
      dueAt
      createdAt
      fulfilledAt
      fileUrl
      verificationStatus
    }
  }
`;

export const MY_VAULT_UPLOADS = gql`
  query MyVaultUploads {
    myVaultUploads {
      id
      category
      title
      fileName
      fileUrl
      verificationStatus
      rejectionReason
      source
      createdAt
    }
  }
`;
