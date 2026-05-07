import { gql } from "@apollo/client";

export const GET_MY_PAYSLIPS = gql`
  query GetMyPayslips {
    myPayslips {
      id
      payrollRun {
        month
        year
      }
      grossEarnings
      totalDeductions
      netPay
      status
      workedDays
      lopDays
      payslipPdf {
        url
      }
      components {
        id
        componentName
        componentCode
        componentType
        amount
      }
    }
  }
`;
