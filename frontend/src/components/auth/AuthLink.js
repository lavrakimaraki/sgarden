import { Typography, Link } from "@mui/material";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles((theme) => ({
  subtitle: {
    color: theme.palette.third.main,
  },
}));

const AuthLink = ({ text, linkText, href }) => {
  const classes = useStyles();

  return (
    <Typography variant="h7">
      <Typography component="span" color="white.main">
        {text}
      </Typography>
      {" "}
      <Typography component="span" className={classes.subtitle}>
        <Link color="inherit" underline="none" href={href}>
          {linkText}
        </Link>
      </Typography>
    </Typography>
  );
};

export default AuthLink;