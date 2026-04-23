import { useEffect, memo, useMemo } from "react";
import { Grid, Divider } from "@mui/material";
import { useLocation } from "react-router-dom";

import { authenticate } from "../api/index.js";
import { useAuthSubmit } from "../components/hooks/useAuthSubmit.js";
import { usePasswordVisibility } from "../components/hooks/usePasswordVisibility.js";
import Form from "../components/Form.js";
import AuthLayout from "../components/auth/AuthLayout.js";
import AuthLink from "../components/auth/AuthLink.js";
import { createUsernameField, createPasswordField, createSubmitButton } from "../components/auth/formFields.js";

const SignIn = () => {
  const { state } = useLocation();
  const { showPassword, togglePasswordVisibility } = usePasswordVisibility();
  const { isSubmitting, handleSubmit } = useAuthSubmit(authenticate);

  const submitHandler = async (values) => {
    await handleSubmit(values.username, values.password);
  };

  useEffect(() => {
    try {
      sessionStorage.setItem(
        "redirectTo",
        JSON.stringify(state?.from || { pathname: "/dashboard" })
      );
    } catch {
      // Session storage unavailable
    }
  }, [state]);

  const formContent = useMemo(() => [
    createUsernameField(),
    createPasswordField(showPassword, togglePasswordVisibility),
    createSubmitButton("Sign In"),
  ], [showPassword, togglePasswordVisibility]);

  const footer = (
    <>
      <Grid item>
        <AuthLink 
          text="Forgot Password?" 
          linkText="Click Here" 
          href="forgot-password" 
        />
      </Grid>
      <Grid item>
        <Divider 
          style={{ 
            width: "280px", 
            margin: "0px", 
            marginTop: "5px", 
            marginBottom: "5px" 
          }} 
        />
      </Grid>
      <Grid item>
        <AuthLink 
          text="Don't have an account?" 
          linkText="Sign Up Here" 
          href="sign-up" 
        />
      </Grid>
    </>
  );


  return (
    <AuthLayout
      title={{ text: "WELCOME", variant: "h3" }}
      subtitle="to SGarden Platform"
      footer={footer}
      isSubmitting={isSubmitting}
    >
      <Form 
        content={formContent} 
        validationSchema="authenticationSchema" 
        toResetForm={false} 
        onSubmit={submitHandler} 
      />
    </AuthLayout>
  );
};

export default memo(SignIn);