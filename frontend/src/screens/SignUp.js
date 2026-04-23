import { memo, useMemo } from "react";
import { Grid } from "@mui/material";

import { signUp } from "../api/index.js";
import { useAuthSubmit } from "../components/hooks/useAuthSubmit.js";
import { usePasswordVisibility } from "../components/hooks/usePasswordVisibility.js";
import Form from "../components/Form.js";
import AuthLayout from "../components/auth/AuthLayout.js";
import AuthLink from "../components/auth/AuthLink.js";
import { 
  createUsernameField, 
  createEmailField, 
  createPasswordField, 
  createSubmitButton 
} from "../components/auth/formFields.js";

const SignUp = () => {
  const { showPassword, togglePasswordVisibility } = usePasswordVisibility();
  const { isSubmitting, handleSubmit } = useAuthSubmit(signUp);

  const submitHandler = async (values) => {
    await handleSubmit(values.username, values.email, values.password);
  };

  const formContent = useMemo(() => [
    createUsernameField(),
    createEmailField(),
    createPasswordField(showPassword, togglePasswordVisibility),
    {
      ...createPasswordField(showPassword, togglePasswordVisibility, "Re-type Password"),
      id: "confirmPassword",
    },
    createSubmitButton("Sign Up"),
  ], [showPassword, togglePasswordVisibility]);

  const footer = (
    <Grid item>
      <AuthLink 
        text="Otherwise," 
        linkText="Sign In" 
        href="/" 
      />
    </Grid>
  );

  return (
    <AuthLayout
      title={{ text: "Sign Up" }}
      subtitle="to SGarden Platform"
      footer={footer}
      isSubmitting={isSubmitting}
    >
      <Form 
        content={formContent} 
        validationSchema="signUpSchema" 
        onSubmit={submitHandler} 
      />
    </AuthLayout>
  );
};

export default memo(SignUp);