import { GraphQLUser } from "./graphql/users/types";

export const mapBackendUserToFrontendUser = (backendUser: any): GraphQLUser => {
  return {
    id: backendUser.id,
    email: backendUser.email,
    username: backendUser.username || backendUser.email.split('@')[0], // Fallback if username missing
    firstName: backendUser.first_name,
    lastName: backendUser.last_name,
    phoneNumber: backendUser.phone_number,
    role: backendUser.role,
    isActive: backendUser.is_active,
    isVerified: backendUser.is_verified || false,
    dateOfJoining: backendUser.date_of_joining,
    dateOfBirth: backendUser.date_of_birth,
    gender: backendUser.gender,
    profilePictureUrl: backendUser.profile_picture || backendUser.profilePictureUrl || null,
    employeeId: backendUser.employee_id,
    employmentType: backendUser.employment_type,
    organization: backendUser.organization ? {
      id: backendUser.organization,
      name: backendUser.organization_name || "Unknown Organization"
    } : null,
    // Relationships might be objects or IDs depending on serializer depth
    manager: backendUser.manager, 
    department: backendUser.department ? (typeof backendUser.department === 'object' ? backendUser.department : { id: backendUser.department, name: backendUser.department_name }) : null,
    designation: backendUser.designation ? (typeof backendUser.designation === 'object' ? backendUser.designation : { id: backendUser.designation, name: backendUser.designation_name }) : null,
    officeLocation: backendUser.office_location,
    bankAccountNumber: backendUser.bank_account_number,
    bankIfscCode: backendUser.bank_ifsc_code,
    panNumber: backendUser.pan_number,
    aadharNumber: backendUser.aadhar_number,
    uanNumber: backendUser.uan_number,
  };
};
