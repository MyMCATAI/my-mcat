import { toast } from "react-hot-toast";

export const showLoadingToast = () => {
  return toast.loading(
    "Generating your personalized study plan. This may take a minute...", 
    {
      duration: Infinity, // Toast will remain until manually dismissed
      position: "bottom-center",
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      },
    }
  );
};