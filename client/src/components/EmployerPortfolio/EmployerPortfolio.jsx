import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import Link from "@material-ui/core/Link";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import Box from "@material-ui/core/Box";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import { withStyles } from "@material-ui/styles";
import { Paper } from "@material-ui/core";
import GitHubIcon from "@material-ui/icons/GitHub";
import Divider from "@material-ui/core/Divider";
import Iframe from "react-iframe";
import Axios from "axios";

const styles = theme => ({
  root: {
    ...theme.typography.button,
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(0),
    fontSize: "2rem"
  },
  rootSmall: {
    ...theme.typography.button,
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(0),
    fontSize: "1.5rem"
  },
  rootSm: {
    ...theme.typography.button,
    padding: theme.spacing(0),
    fontSize: "1rem"
  },
  paper: {
    marginTop: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.primary.main
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(3)
  },
  submit: {
    margin: theme.spacing(3, 0, 2)
  },
  paperComponent: {
    padding: theme.spacing(2),
    margin: "auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    maxWidth: 700
  },
  box: {
    marginTop: theme.spacing(15)
  },
  box2: {
    padding: theme.spacing(2),
    margin: "auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    maxWidth: 700
  },
  link: {
    cursor: "pointer"
  },
  small: {
    width: theme.spacing(3),
    height: theme.spacing(3)
  },
  large: {
    width: theme.spacing(18),
    height: theme.spacing(18)
  }
});

class EmployerPortfolio extends Component {
  constructor() {
    super();
    this.state = {
      url: "",
      employer: null
    };
  }
  componentDidMount() {
    Axios.get(`/api/v1/employers/${this.props.match.params.id}/profile`)
      .then(res => {
        console.log(res.data, "employer profile");
        this.setState({ employer: res.data.employer });
      })
      .catch(err => console.log(err));
  }

  render() {
    const { classes } = this.props;
    return this.state.employer ? (
      <Container component="main" className={classes.box}>
        <Box>
          <Paper className={classes.paperComponent}>
            <Container component="main" maxWidth="xs">
              <div className={classes.paper}>
                <Avatar
                  alt="Remy Sharp"
                  src={this.state.employer.profileImage}
                  className={classes.large}
                />
                <Divider variant="middle" />
                <div className={classes.root}>
                  {this.state.employer.firstName +
                    " " +
                    this.state.employer.lastName}
                </div>

                <div className={classes.rootSmall}>
                  {this.state.employer.city}
                </div>
              </div>
            </Container>
          </Paper>
          <br />
          <Paper className={classes.paperComponent}>
            <div className={classes.rootSm}>ABOUT COMPANY</div>

            <a
              href={this.state.employer.company.companyWebsiteUrl}
              target="_blank"
            >
              <div className={classes.rootSmall}>
                {this.state.employer.company.companyName}
              </div>
            </a>
            <Avatar
              alt="Remy Sharp"
              src={this.state.employer.company.companyLogo}
              className={classes.medium}
            />
            <p>{this.state.employer.company.aboutCompany}</p>
          </Paper>

          {/* <br />

					<Paper className={classes.paperComponent}>
						<Table />
					</Paper> */}
        </Box>
      </Container>
    ) : (
      ""
    );
  }
}

function mapToProps({ employer }) {
  return { employer };
}

export default connect(mapToProps)(
  withRouter(withStyles(styles)(EmployerPortfolio))
);

EmployerPortfolio.propTypes = {
  classes: PropTypes.object.isRequired
};
