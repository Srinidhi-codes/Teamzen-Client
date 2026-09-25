"use client";

import { useQuery } from "@apollo/client/react";
import {
  MY_DOCUMENT_REQUESTS,
  MY_ISSUED_DOCUMENTS,
  MY_VAULT_UPLOADS,
  MY_EMPLOYEE_DOCUMENT_REQUESTS,
} from "./queries";

export function useMyDocuments() {
  const issued = useQuery(MY_ISSUED_DOCUMENTS, {
    fetchPolicy: "cache-and-network",
  }) as any;
  const requests = useQuery(MY_DOCUMENT_REQUESTS, {
    variables: { status: null },
    fetchPolicy: "cache-and-network",
  }) as any;
  const uploads = useQuery(MY_VAULT_UPLOADS, {
    fetchPolicy: "cache-and-network",
  }) as any;

  const employeeRequests = useQuery(MY_EMPLOYEE_DOCUMENT_REQUESTS, {
    variables: { status: null },
    fetchPolicy: "cache-and-network",
  }) as any;

  return {
    issued: issued.data?.myIssuedDocuments || [],
    requests: requests.data?.myDocumentRequests || [],
    employeeRequests: employeeRequests.data?.myEmployeeDocumentRequests || [],
    uploads: uploads.data?.myVaultUploads || [],
    loading: issued.loading || requests.loading || uploads.loading || employeeRequests.loading,
    refetch: async () => {
      await Promise.all([issued.refetch(), requests.refetch(), uploads.refetch(), employeeRequests.refetch()]);
    },
  };
}
