import Axios from "axios";
import io from "socket.io-client";

let socket = io();
import {
  IDENTIFY_CANDIDATE,
  IDENTIFY_EMPLOYER,
  LOGOUT_CANDIDATE,
  LOGIN_CANDIDATE,
  LOGOUT_EMPLOYER,
  LOGIN_EMPLOYER,
  UPDATE_LOGGED_CANDIDATE,
  CANDIDATE_AUTH_IN_PROGRESS,
  EMPLOYER_AUTH_IN_PROGRESS,
  CANDIDATE_SKILLS_UPDATE,
  UPDATE_LOGGED_EMPLOYER
} from "./types";

import { store } from "./index";

export let fetchLoggedCandidate = payload => {
  return { type: IDENTIFY_CANDIDATE, payload };
};

export let logoutCandidate = payload => {
  return { type: LOGOUT_CANDIDATE, payload };
};

export let loginCandidate = payload => {
  return { type: LOGIN_CANDIDATE, payload };
};

export let updateLoggedCandidate = payload => {
  return { type: UPDATE_LOGGED_CANDIDATE, payload };
};

export let fetchLoggedEmployer = payload => {
  return { type: IDENTIFY_EMPLOYER, payload };
};

export let logoutEmployer = payload => {
  return { type: LOGOUT_EMPLOYER, payload };
};

export let loginEmployer = payload => {
  return { type: LOGIN_EMPLOYER, payload };
};

export let candidateAuthProgress = payload => {
  return { type: CANDIDATE_AUTH_IN_PROGRESS, payload };
};

export let employerAuthProgress = payload => {
  return { type: EMPLOYER_AUTH_IN_PROGRESS, payload };
};

export let updateCandidateSkills = payload => {
  return { type: CANDIDATE_SKILLS_UPDATE, payload };
};

export let updateLoggedEmployer = payload => {
  return { type: UPDATE_LOGGED_EMPLOYER, payload };
};

export let identifyLoggedUser = () => {
  return function() {
    if (localStorage.jobUser) {
      let userType = JSON.parse(localStorage.jobUser).type;
      store.dispatch(
        userType === "candidate"
          ? candidateAuthProgress({ isAuthInProgress: true, isAuthDone: false })
          : employerAuthProgress({ isAuthInProgress: true, isAuthDone: false })
      );
      Axios.get(`/api/v1/${userType}s/me`, {
        headers: { authorization: JSON.parse(localStorage.jobUser).token }
      })
        .then(res => {
          if (res.data.success) {
            socket.connect();
            socket.on("disconnect", function() {
              console.log("client disconnected from server");
            });
            console.log(res.data[userType], "user identified");
            if (userType === "candidate") {
              store.dispatch(
                fetchLoggedCandidate({
                  currentCandidate: res.data[userType],
                  isAuthInProgress: false,
                  isAuthDone: true
                })
              );
            } else if (userType === "employer") {
              store.dispatch(
                fetchLoggedEmployer({
                  currentEmployer: res.data[userType],
                  isAuthInProgress: false,
                  isAuthDone: true
                })
              );
            }
          }
        })
        .catch(err => console.log(err, "invalid user"));
    }
  };
};

export let candidatesLogin = payload => {
  return function() {
    store.dispatch(
      candidateAuthProgress({
        isAuthInProgress: true
      })
    );
    return Axios.post("/api/v1/candidates/login", { ...payload }).then(res => {
      if (res.data.success) {
        console.log(res, "login successful");
        localStorage.setItem(
          "jobUser",
          JSON.stringify({ token: res.data.token, type: "candidate" })
        );
        store.dispatch(
          loginCandidate({
            currentCandidate: res.data.candidate,
            isAuthInProgress: false,
            isAuthDone: true
          })
        );
      } else if (!res.data.success) {
        console.log(res, "login failed");
        store.dispatch(
          candidateAuthProgress({
            isAuthInProgress: false,
            isAuthDone: false
          })
        );
      }
      return res.data;
    });
  };
};

export let candidatesSignup = payload => {
  return function() {
    store.dispatch(
      candidateAuthProgress({ isAuthInProgress: true, isAuthDone: false })
    );
    return Axios.post("/api/v1/candidates/signup", { ...payload }).then(res => {
      if (res.data.success) {
        console.log(res, "signup successful");
        localStorage.setItem(
          "jobUser",
          JSON.stringify({ token: res.data.token, type: "candidate" })
        );
        store.dispatch(
          loginCandidate({
            currentCandidate: res.data.candidate,
            isAuthInProgress: false,
            isAuthDone: true
          })
        );
      } else if (!res.data.success) {
        console.log(res, "signup failed");
        store.dispatch(
          candidateAuthProgress({
            isAuthInProgress: false,
            isAuthDone: false
          })
        );
      }
      return res.data;
    });
  };
};

export let employersLogin = payload => {
  return function() {
    store.dispatch(
      employerAuthProgress({ isAuthInProgress: true, isAuthDone: false })
    );
    return Axios.post("/api/v1/employers/login", { ...payload }).then(res => {
      if (res.data.success === true) {
        console.log(res, "login successful");
        localStorage.setItem(
          "jobUser",
          JSON.stringify({ token: res.data.token, type: "employer" })
        );
        // this.props.loginFunction();
        store.dispatch(
          loginEmployer({
            currentEmployer: res.data.employer,
            isAuthInProgress: false,
            isAuthDone: true
          })
        );
      } else if (!res.data.success) {
        console.log(res, "login failed");
        store.dispatch(
          employerAuthProgress({ isAuthInProgress: false, isAuthDone: false })
        );
      }
      return res.data;
    });
  };
};

export let employersSignup = payload => {
  return function() {
    store.dispatch(
      employerAuthProgress({ isAuthInProgress: true, isAuthDone: false })
    );
    return Axios.post("/api/v1/employers/signup", { ...payload }).then(res => {
      if (res.data.success) {
        console.log(res, "signup successful");
        localStorage.setItem(
          "jobUser",
          JSON.stringify({ token: res.data.token, type: "employer" })
        );
        store.dispatch(
          loginEmployer({
            currentEmployer: res.data.employer,
            isAuthInProgress: false,
            isAuthDone: true
          })
        );
      } else if (!res.data.success) {
        console.log(res, "signup failed");
        store.dispatch(
          employerAuthProgress({ isAuthInProgress: false, isAuthDone: false })
        );
      }
      return res.data;
    });
  };
};

export let saveCandidatesBasicInfo = payload => {
  return function() {
    Axios.post(
      "/api/v1/candidates/profile",
      { ...payload },
      {
        headers: { authorization: JSON.parse(localStorage.jobUser).token }
      }
    )
      .then(res => {
        console.log(res, "portfolio successful");
        store.dispatch(
          updateLoggedCandidate({ currentCandidate: res.data.candidate })
        );
      })
      .catch(err => console.log(err, "portfolio failed"));
  };
};

export let addCandidatesEducation = payload => {
  return function() {
    Axios.post(
      "/api/v1/candidates/education",
      { ...payload },
      {
        headers: { authorization: JSON.parse(localStorage.jobUser).token }
      }
    )
      .then(res => {
        console.log(res, "education successful");
        store.dispatch(
          updateLoggedCandidate({ currentCandidate: res.data.candidate })
        );
      })
      .catch(err => console.log(err, "education failed"));
  };
};

export let addCandidatesExperience = payload => {
  return function() {
    Axios.post(
      "/api/v1/candidates/experience",
      { ...payload },
      {
        headers: { authorization: JSON.parse(localStorage.jobUser).token }
      }
    )
      .then(res => {
        console.log(res, "experience successful");
        store.dispatch(
          updateLoggedCandidate({ currentCandidate: res.data.candidate })
        );
      })
      .catch(err => console.log(err, "experience failed"));
  };
};

export let deleteCandidatesExperience = payload => {
  return function() {
    Axios.post(
      "/api/v1/candidates/experience/delete",
      { _id: payload },
      {
        headers: { authorization: JSON.parse(localStorage.jobUser).token }
      }
    )
      .then(res => {
        console.log(res, "experience deleted successful");
        store.dispatch(
          updateLoggedCandidate({ currentCandidate: res.data.candidate })
        );
      })
      .catch(err => console.log(err, "experience delete failed"));
  };
};

export let deleteCandidatesSkills = payload => {
  return function() {
    Axios.put(
      "/api/v1/candidates/skills/delete",
      { _id: payload },
      {
        headers: { authorization: JSON.parse(localStorage.jobUser).token }
      }
    )
      .then(res => {
        console.log(res, "skills deleted successful");
        store.dispatch(
          updateLoggedCandidate({ currentCandidate: res.data.candidate })
        );
      })
      .catch(err => console.log(err, "skills deleted failed"));
  };
};

export let addCandidatesSkills = payload => {
  return function() {
    Axios.post(
      "/api/v1/candidates/skills",
      { ...payload },
      {
        headers: { authorization: JSON.parse(localStorage.jobUser).token }
      }
    )
      .then(res => {
        if (res.data.success) {
          console.log(res.data, "skills successful");
          store.dispatch(
            updateLoggedCandidate({ currentCandidate: res.data.candidate })
          );
        }
      })
      .catch(err => console.log(err, "skills failed"));
  };
};

export let saveCompanyDetails = payload => {
  return function() {
    Axios.post(
      "/api/v1/employers/companyDetails",
      { ...payload },
      {
        headers: { authorization: JSON.parse(localStorage.jobUser).token }
      }
    )
      .then(res => {
        console.log(res, "company details updated successful");
        store.dispatch(
          updateLoggedEmployer({ currentEmployer: res.data.employer })
        );
      })
      .catch(err => console.log(err, "company details updated failed"));
  };
};

export let deleteCandidatesEducation = payload => {
  return function() {
    Axios.post(
      "/api/v1/candidates/education/delete",
      { _id: payload },
      {
        headers: { authorization: JSON.parse(localStorage.jobUser).token }
      }
    )
      .then(res => {
        console.log(res, "education deleted successful");
        store.dispatch(
          updateLoggedCandidate({ currentCandidate: res.data.candidate })
        );
      })
      .catch(err => console.log(err, "education delete failed"));
  };
};

export let createJob = payload => {
  return function() {
    let {
      title,
      description,
      location,
      skills,
      isRemote,
      currency,
      salary
    } = payload;
    skills = skills.map(a => a.value);
    Axios.post(
      "/api/v1/employers/jobs",
      {
        title,
        description,
        location,
        isRemote,
        currency,
        salary,
        skills
      },
      {
        headers: { authorization: JSON.parse(localStorage.jobUser).token }
      }
    )
      .then(res => {
        console.log(res, "job created successfully");
        store.dispatch(
          updateLoggedEmployer({ currentEmployer: res.data.employer })
        );
      })
      .catch(err => console.log(err, "job create failed"));
  };
};
