"use client";
import { useMutation } from "@tanstack/react-query";
import { useAppDispatch } from "@/app/utils/hooks";
import { updateProfile } from "../Slices/Agent/AgentProfileSlice";
import { authService } from "@/services";

export const useUpdateAvailability = () => {
  const dispatch = useAppDispatch();

  const { mutate, isPending } = useMutation({
    mutationFn: (is_available: boolean) => authService.updateAvailability(is_available),
    onMutate: (is_available: boolean) => {
      dispatch(updateProfile({ is_available }));
    },
    onSuccess: (res, is_available) => {
      if (res?.data?.is_available !== is_available) {
        console.error("Availability update did not persist on server", res);
        dispatch(updateProfile({ is_available: res?.data?.is_available ?? !is_available }));
      }
    },
    onError: (_err, is_available) => {
      dispatch(updateProfile({ is_available: !is_available }));
    },
  });

  return { updateAvailability: mutate, isPending };
};
