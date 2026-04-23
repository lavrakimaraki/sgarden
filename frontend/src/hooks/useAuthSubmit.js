import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "../../utils/index.js";

export const useAuthSubmit = (apiFunction, successRedirect = "/") => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success, error } = useSnackbar();
  const navigate = useNavigate();

  const handleSubmit = useCallback(async (...args) => {
    setIsSubmitting(true);

    try {
      const response = await apiFunction(...args);
      const { success: successCode, message, token } = response;

      if (successCode) {
        success(message);
        if (token) {
          navigate(`/auth/?token=${token}`);
        } else {
          navigate(successRedirect);
        }
      } else {
        error(message);
      }
    } catch (err) {
      console.error("Auth submission error:", err);
      error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [apiFunction, successRedirect, success, error, navigate]);

  return {
    isSubmitting,
    handleSubmit,
  };
};