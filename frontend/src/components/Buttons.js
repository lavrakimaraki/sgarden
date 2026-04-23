import { Typography, Button } from "@mui/material";

// Base reusable button component
const BaseButton = ({
  id,
  type = "button",
  disabled = false,
  className = "",
  titleClassName = "",
  titleColor,
  size = "",
  width = "200px",
  title = "Button",
  variant,
  color,
  backgroundColor = "white",
  borderWidth,
  borderColor,
  onClick,
}) => {
  // Build the style object conditionally
  const buttonStyle = {
    ...(width && { width }),
    ...(backgroundColor && variant === "outlined" && { backgroundColor }),
    ...(borderWidth && { borderWidth }),
    ...(borderColor && { borderColor }),
  };

  return (
    <Button
      key={id}
      id={id}
      type={type}
      disabled={disabled}
      className={className}
      variant={variant}
      color={color}
      size={size || ""}
      style={buttonStyle}
      onClick={onClick}
    >
      <Typography
        className={titleClassName}
        sx={{ color: `${titleColor}!important` }}
        style={{ textTransform: "none" }}
      >
        <b>{title}</b>
      </Typography>
    </Button>
  );
};

// Configuration object for button variants
const BUTTON_CONFIGS = {
  primary: {
    background: {
      id: "primary-background-button",
      variant: "contained",
      color: "primary",
      titleColor: "white",
    },
    border: {
      id: "primary-border-button",
      variant: "outlined",
      color: "primary",
      titleColor: "primary",
      borderWidth: "3px",
    },
  },
  secondary: {
    background: {
      id: "secondary-background-button",
      variant: "contained",
      color: "secondary",
      titleColor: "white",
    },
    border: {
      id: "secondary-border-button",
      variant: "outlined",
      color: "secondary",
      titleColor: "secondary",
      borderWidth: "3px",
    },
  },
  highlight: {
    background: {
      id: "highlight-background-button",
      variant: "contained",
      color: "third",
      titleColor: "white",
    },
    border: {
      id: "highlight-border-button",
      variant: "outlined",
      color: "third",
      titleColor: "third",
      borderWidth: "3px",
    },
  },
  success: {
    background: {
      id: "success-background-button",
      variant: "contained",
      color: "success",
      titleColor: "white",
    },
  },
  error: {
    background: {
      id: "error-background-button",
      variant: "contained",
      color: "error",
      titleColor: "white",
    },
  },
  info: {
    background: {
      id: "info-background-button",
      variant: "contained",
      color: "info",
      titleColor: "white",
    },
  },
};

// Helper function to create button components
const createButtonComponent = (config) => (props) => {
  const mergedProps = {
    ...config,
    ...props,
    // Override defaults while preserving user props
    id: props.id || config.id,
    titleColor: props.titleColor || config.titleColor,
    // Handle border color for outlined buttons
    ...(config.variant === "outlined" && {
      borderColor: props.titleColor || config.titleColor,
    }),
  };

  return <BaseButton {...mergedProps} />;
};

// Export all button components
export const PrimaryBackgroundButton = createButtonComponent(
  BUTTON_CONFIGS.primary.background
);

export const PrimaryBorderButton = createButtonComponent(
  BUTTON_CONFIGS.primary.border
);

export const SecondaryBackgroundButton = createButtonComponent(
  BUTTON_CONFIGS.secondary.background
);

export const SecondaryBorderButton = createButtonComponent(
  BUTTON_CONFIGS.secondary.border
);

export const HighlightBackgroundButton = createButtonComponent(
  BUTTON_CONFIGS.highlight.background
);

export const HighlightBorderButton = createButtonComponent(
  BUTTON_CONFIGS.highlight.border
);

export const SuccessBackgroundButton = createButtonComponent(
  BUTTON_CONFIGS.success.background
);

export const ErrorBackgroundButton = createButtonComponent(
  BUTTON_CONFIGS.error.background
);

export const InfoBackgroundButton = createButtonComponent(
  BUTTON_CONFIGS.info.background
);

export const StyledButton = ({ 
  buttonType = "primary", 
  variant = "background", 
  ...props 
}) => {
  const config = BUTTON_CONFIGS[buttonType]?.[variant];
  
  if (!config) {
    console.warn(`Invalid button configuration: ${buttonType}.${variant}`);
    return null;
  }

  return <BaseButton {...config} {...props} />;
};