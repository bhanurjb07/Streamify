import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { signup } from "../lib/api";

const useSignUp = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useMutation({
    mutationFn: signup,
    onSuccess: (data) => {
      queryClient.setQueryData(["authUser"], {
        success: true,
        user: data.user,
      });
      toast.success("Account created successfully!");
    },
    onError: (err) => {
      const message =
        err.response?.data?.message ||
        "Could not create account. Make sure the server is running and try again.";
      toast.error(message);
    },
  });

  return { isPending, error, signupMutation: mutate };
};
export default useSignUp;
