import { useMutation } from "@tanstack/react-query";
import { l as useTrans, v as toast, m as message, w as showHttpErrorToast, a as apiClient, f as createSvgIcon } from "../server-entry.mjs";
import { jsx } from "react/jsx-runtime";
function useCancelSubscription() {
  const { trans } = useTrans();
  return useMutation({
    mutationFn: (props) => cancelSubscription(props),
    onSuccess: (response, payload) => {
      toast(
        payload.delete ? trans(message("Subscription deleted.")) : trans(message("Subscription cancelled."))
      );
    },
    onError: (err) => showHttpErrorToast(err)
  });
}
function cancelSubscription({
  subscriptionId,
  ...payload
}) {
  return apiClient.post(`billing/subscriptions/${subscriptionId}/cancel`, payload).then((r) => r.data);
}
function useResumeSubscription() {
  const { trans } = useTrans();
  return useMutation({
    mutationFn: (props) => resumeSubscription(props),
    onSuccess: () => {
      toast(trans(message("Subscription renewed.")));
    },
    onError: (err) => showHttpErrorToast(err)
  });
}
function resumeSubscription({ subscriptionId }) {
  return apiClient.post(`billing/subscriptions/${subscriptionId}/resume`).then((r) => r.data);
}
const OpenInNewIcon = createSvgIcon(
  /* @__PURE__ */ jsx("path", { d: "M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" }),
  "OpenInNewOutlined"
);
export {
  OpenInNewIcon as O,
  useResumeSubscription as a,
  useCancelSubscription as u
};
//# sourceMappingURL=OpenInNew-00666669.mjs.map
