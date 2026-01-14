export interface GraphQLUser {
  id: string;
  email: string;
  username: string;

  firstName: string;
  lastName: string;
  phoneNumber?: string | null;

  role: "admin" | "hr" | "manager" | "employee";
  isActive: boolean;
  isVerified: boolean;

  dateOfJoining?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;

  profilePictureUrl?: string | null;

  employeeId?: string | null;
  employmentType?: "full_time" | "contract" | "intern";

  organization?: {
    id: string;
    name: string;
  } | null;

  manager?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;

  department?: {
    id: string;
    name: string;
  } | null;

  designation?: {
    id: string;
    name: string;
  } | null;

  officeLocation?: {
    id: string;
    name: string;
    address: string;
  } | null;

  bankAccountNumber?: string | null;
  bankIfscCode?: string | null;
  panNumber?: string | null;
  aadharNumber?: string | null;
  uanNumber?: string | null;
}
