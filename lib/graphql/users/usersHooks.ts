import { useQuery, useMutation } from "@apollo/client/react";
import { GET_ME } from "./queries";
import { UPDATE_PROFILE, CHANGE_PASSWORD } from "./mutations";
import { GraphQLUser } from "./types";

import { useEffect } from "react";
import { useStore } from "@/lib/store/useStore";

export function useGraphQLUser() {
  const { data, loading, error, refetch } = useQuery(GET_ME) as any;
  const { setAuthenticatedUser, user: storedUser } = useStore();

  useEffect(() => {
    if (data?.me) {
      setAuthenticatedUser(data.me as GraphQLUser);
    }
  }, [data, setAuthenticatedUser]);

  return {
    user: (data?.me as GraphQLUser) || storedUser || null,
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
