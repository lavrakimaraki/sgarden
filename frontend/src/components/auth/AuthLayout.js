import { memo } from "react";
import { Grid, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import Spinner from "../Spinner.js";
import background from "../../assets/images/background.jpg";

const useStyles = makeStyles((theme) => ({
  root: {
    overflow: "hidden",
    width: "100vw",
    height: "100%",
    backgroundImage: `url(${background})`,
    backgroundPosition: "center",
    backgroundSize: "cover",
  },
  title: {
    color: theme.palette.common.white,
    letterSpacing: theme.spacing(1),
    maxWidth: "300px",
  },
  subtitle: {
    color: theme.palette.third.main,
    letterSpacing: theme.spacing(0.1),
    maxWidth: "300px",
  },
}));

const AuthLayout = ({ 
  title, 
  subtitle, 
  children, 
  footer, 
  isSubmitting 
}) => {
  const classes = useStyles();

  return (
    <>
      <Spinner open={isSubmitting} />
      <Grid 
        container 
        direction="row" 
        justifyContent="center" 
        align="center" 
        className={classes.root}
      >
        <Grid 
          item 
          container 
          direction="column" 
          justifyContent="center" 
          align="center" 
          sm={5} 
          xs={12} 
          sx={{ "> .MuiGrid-item": { p: 1 } }}
        >
          <Grid item mt={2}>
            <Typography variant={title.variant || "h4"} className={classes.title}>
              {title.text}
            </Typography>
            <Typography variant="h5" className={classes.subtitle}>
              {subtitle}
            </Typography>
          </Grid>

          <Grid 
            item 
            container 
            direction="column" 
            justifyContent="center" 
            alignItems="center"
          >
            {children}
          </Grid>

          {footer && (
            <Grid 
              item 
              container 
              direction="column" 
              justifyContent="center" 
              alignItems="space-between"
            >
              {footer}
            </Grid>
          )}
        </Grid>
        <Grid item sm={7} />
      </Grid>
    </>
  );
};

export default memo(AuthLayout);