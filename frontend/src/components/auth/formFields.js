import { InputAdornment, IconButton } from "@mui/material";
import AccountCircle from "@mui/icons-material/AccountCircle";
import EmailIcon from "@mui/icons-material/Email";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

export const createUsernameField = () => ({
  customType: "input",
  id: "username",
  type: "text",
  placeholder: "Username",
  inputProps: {
    endAdornment: (
      <InputAdornment position="start">
        <IconButton disabled>
          <AccountCircle />
        </IconButton>
      </InputAdornment>
    ),
  },
});

export const createEmailField = (extraProps = {}) => ({
  customType: "input",
  id: "email",
  type: "email",
  placeholder: "E-mail",
  inputProps: {
    endAdornment: (
      <InputAdornment position="start">
        <IconButton disabled>
          <EmailIcon />
        </IconButton>
      </InputAdornment>
    ),
  },
  ...extraProps,
});

export const createPasswordField = (showPassword, togglePassword, placeholder = "Password") => ({
  customType: "input",
  id: "password",
  type: showPassword ? "text" : "password",
  placeholder,
  inputProps: {
    endAdornment: (
      <InputAdornment position="start">
        <IconButton
          aria-label="toggle password visibility"
          tabIndex={-1}
          onClick={togglePassword}
        >
          {showPassword ? <Visibility /> : <VisibilityOff />}
        </IconButton>
      </InputAdornment>
    ),
  },
});

export const createConfirmPasswordField = (showPassword, togglePassword) => 
  createPasswordField(showPassword, togglePassword, "Re-type Password").id = "confirmPassword";

export const createSubmitButton = (text, color = "third") => ({
  customType: "button",
  id: "submit",
  type: "submit",
  text,
  buttonColor: color,
});