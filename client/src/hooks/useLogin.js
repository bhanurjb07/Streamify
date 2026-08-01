import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { login } from "../lib/api";

const useLogin = () => {
  const queryClient = useQueryClient();
  const { mutate, isPending, error } = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      queryClient.setQueryData(["authUser"], {
        success: true,
        user: data.user,
      });
      toast.success("Welcome back!");
    },
    onError: (err) => {
      const message =
        err.response?.data?.message ||
        "Could not sign in. Make sure the server is running and try again.";
      toast.error(message);
    },
  });

  return { error, isPending, loginMutation: mutate };
};

export default useLogin;
