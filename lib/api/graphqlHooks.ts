import { useQuery, useMutation } from "@apollo/client/react";
import { GET_ME } from "../graphql/users/queries";
import { UPDATE_PROFILE, CHANGE_PASSWORD } from "../graphql/users/mutations";

export interface GraphqlUser {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: string;
  isActive: boolean;
  isVerified: boolean;
  dateOfJoining: string;
  dateOfBirth: string;
  gender: string;
  profilePictureUrl: string | null;
  employeeId: string;
  employmentType: string;
  manager: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  department: {
    id: string;
    name: string;
  } | null;
  designation: {
    id: string;
    name: string;
  } | null;
  officeLocation: {
    id: string;
    name: string;
    address: string;
  } | null;
  bankAccountNumber: string;
  bankIfscCode: string;
  panNumber: string;
  aadharNumber: string;
  uanNumber: string;
}

export function useGraphQLUser() {
  const { data, loading, error, refetch } = useQuery(GET_ME) as any;
  return {
    user: (data?.me as GraphqlUser) || null,
    isLoading: loading,
    error,
    refetch
  };
}

export function useGraphQLUpdateUser() {
  const [updateProfile, { loading, error }] = useMutation(UPDATE_PROFILE, {
    refetchQueries: [{ query: GET_ME }],
  }) as any;

  const updateUserAsync = async (input: any) => {
    // Mapping:
    const mappedInput = {
      firstName: input.first_name,
      lastName: input.last_name,
      email: input.email,
      phoneNumber: input.phone_number,
      dateOfBirth: input.date_of_birth,
      gender: input.gender,
      bankAccountNumber: input.bank_account_number,
      bankIfscCode: input.bank_ifsc_code,
      panNumber: input.pan_number,
      aadharNumber: input.aadhar_number,
      uanNumber: input.uan_number,
    };
    
    // Remove undefined/nulls
    const cleanInput = Object.fromEntries(Object.entries(mappedInput).filter(([_, v]) => v != null));

    const response = await updateProfile({ variables: { input: cleanInput } });
    if (response.data?.updateProfile?.error) {
      throw new Error(response.data.updateProfile.error);
    }
    return response.data?.updateProfile;
  };

  return { updateUserAsync, isLoading: loading, error };
}

export function useGraphQLChangePassword() {
  const [changePassword, { loading, error }] = useMutation(CHANGE_PASSWORD) as any;

  const changePasswordAsync = async (variables: any) => {
    const response = await changePassword({ variables });
    if (response.data?.changePassword?.error) {
      throw new Error(response.data.changePassword.error);
    }
    return response.data?.changePassword;
  };

  return { changePasswordAsync, isLoading: loading, error };
}
