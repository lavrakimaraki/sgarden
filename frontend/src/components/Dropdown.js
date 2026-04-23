import { MenuItem, Select } from "@mui/material";
import { useMemo } from "react";

const Dropdown = ({
  id = "custom-dropdown",
  size = "",
  placeholder = "Placeholder",
  filled = true,
  color = "white",
  background = "secondary",
  showPlaceholder = true,
  width = "",
  height = "100%",
  items = [],
  value,
  onChange,
}) => {
  // Generate styles dynamically based on props
  const selectStyles = useMemo(() => {
    const getBackgroundColor = (colorName) => {
      // Handle theme palette colors or custom colors
      if (typeof colorName === 'string' && colorName.includes('.')) {
        return colorName;
      }
      return `${colorName}.main`;
    };

    const getDarkBackgroundColor = (colorName) => {
      if (typeof colorName === 'string' && colorName.includes('.')) {
        return colorName;
      }
      return `${colorName}.dark`;
    };

    const baseStyles = {
      borderRadius: "10px",
      minHeight: height,
      "& .MuiSelect-select": {
        color: color,
      },
      // Remove all border bottom styles
      "&, &:before, &:after": {
        borderBottom: "none !important",
      },
      "&:before": {
        borderBottom: "none !important",
      },
      "&:hover:not(.Mui-disabled):before": {
        borderBottom: "none !important",
      },
      "&:after": {
        borderBottom: "none !important",
      },
    };

    if (filled) {
      return {
        ...baseStyles,
        backgroundColor: getBackgroundColor(background),
        color: "white",
        "&:hover": {
          backgroundColor: getDarkBackgroundColor(background),
        },
        "&:focus": {
          backgroundColor: getDarkBackgroundColor(background),
        },
        "&.Mui-focused": {
          backgroundColor: getDarkBackgroundColor(background),
        },
        "& .MuiSelect-icon": {
          color: "white",
        },
      };
    } else {
      return {
        ...baseStyles,
        backgroundColor: "transparent",
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: getBackgroundColor(background),
          borderWidth: "1px",
        },
        "&:hover .MuiOutlinedInput-notchedOutline": {
          borderColor: getBackgroundColor(background),
        },
        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
          borderColor: getBackgroundColor(background),
        },
      };
    }
  }, [filled, background, color, height]);

  return (
    <Select
      id={id}
      value={value}
      displayEmpty={showPlaceholder}
      size={size}
      variant={filled ? "filled" : "outlined"}
      sx={selectStyles}
      style={{ 
        width: width || "auto", 
        minWidth: width ? undefined : "120px"
      }}
      renderValue={(selected) => selected || placeholder}
      onChange={onChange}
      MenuProps={{
        PaperProps: {
          sx: {
            borderRadius: "8px",
            marginTop: "4px",
          }
        }
      }}
    >
      {items.map((item) => (
        <MenuItem 
          key={item.value || item.text} 
          value={item.value}
        >
          {item.text}
        </MenuItem>
      ))}
    </Select>
  );
};

export default Dropdown;