import { toast } from "sonner";

const baseStyle = {
  background: "#18181b",
  border: "1px solid #3f3f46",
  color: "#fafafa",
};

export function showSuccessToast(message: string) {
  toast(message, {
    style: baseStyle,
  });
}

export function showErrorToast(message: string) {
  toast.error(message, {
    style: {
      ...baseStyle,
      border: "1px solid #7f1d1d",
    },
  });
}