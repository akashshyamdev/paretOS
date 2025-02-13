import React, { useEffect, useState } from "react";
import API from "@aws-amplify/api";
import { I18n } from "@aws-amplify/core";
import Image from "react-bootstrap/lib/Image";
import { errorToast } from "../libs/toasts";
import { Link } from "react-router-dom";
import {
  Accordion,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemButton,
  AccordionItemPanel,
} from "react-accessible-accordion";
import { AiOutlineGithub } from "react-icons/ai";
import Skeleton from "react-loading-skeleton";
import classNames from "classnames";

/**
 * This is the profile component, that is seen by the coaches of their students.
 * @TODO UI work - GH Issue #9 https://github.com/mikhael28/paretOS/issues/9
 * @TODO GH Issue #10 https://github.com/mikhael28/paretOS/issues/10
 */

function Profile(props) {
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [experiences, setExperiences] = useState([]);
  const [sprints, setSprints] = useState([]);

  useEffect(() => {
    setLoading(true);
    let userId = window.location.pathname.split("/");
    let userStrings = userId[2].split("_");
    if (userStrings.length === 1) {
      getUser(userId[2]);
    } else if (userStrings.length > 1) {
      getUser(userStrings[1]);
    }
  }, [window.location.pathname]);

  const getUser = async (id) => {
    let user = await API.get("pareto", `/users/${id}`);
    if (user.length > 0) {
      setProfile(user[0]);
    }
    await getExperienceByUser(user[0].id);
    await getSprintsByUser(user[0].id);
  };

  const getExperienceByUser = async (id) => {
    try {
      let experiences = await API.get("pareto", `/experience/user/${id}`);
      setExperiences(experiences);
    } catch (e) {
      errorToast(e);
    }
  };

  const getSprintsByUser = async (id) => {
    try {
      let sprints = await API.get("pareto", `/sprints/mentee/${id}`);
      setSprints(sprints);
      setLoading(false);
    } catch (e) {
      errorToast(e);
    }
  };

  let blockCardClass = classNames("context-cards");

  return (
    <div style={{ marginTop: 28 }}>
      <h2>Mentee Profile</h2>
      {loading === true ? (
        <section style={{ marginTop: -12 }}>
          <h2 className="section-title">
            <Skeleton height={60} width={"100%"} />
          </h2>
          <h2 className="section-title">
            <Skeleton height={120} width={"100%"} />
          </h2>
          <h2 className="section-title">
            <Skeleton height={200} width={"100%"} />
          </h2>
        </section>
      ) : (
        <React.Fragment>
          <div className="flex">
            <Image
              src={
                profile.picture ||
                "https://wallsheaven.co.uk/photos/A065336811/220/user-account-profile-circle-flat-icon-for-apps-and-websites-.webp"
              }
              height="50"
              width="50"
              circle
              style={{ marginTop: 8 }}
            />
            <h2>
              {profile.fName} {profile.lName}
            </h2>
            <div style={{ marginLeft: 12, marginTop: 26 }}>
              <a
                href={`https://github.com/${profile.github}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "black" }}
              >
                <AiOutlineGithub /> {profile.github}
              </a>
            </div>
          </div>

          <div
            className={blockCardClass}
            style={{ marginLeft: 10, justifyContent: "flex-start" }}
          >
            {experiences.map((experience, index) => {
              return (
                <div
                  style={{ textAlign: "center", marginLeft: 20 }}
                  key={index}
                  className="exp-card"
                >
                  <h3>{experience.type}</h3>
                  <p>
                    {I18n.get("achievements")}: {experience.achievements} / 15
                  </p>
                  <p>
                    {I18n.get("points")}: {experience.xpEarned} /{" "}
                    {experience.xp}
                  </p>
                  <Link to={`/training/${experience.id}`}>
                    {I18n.get("viewExperience")}
                  </Link>
                </div>
              );
            })}
          </div>

          {sprints.length > 0 ? (
            <div>
              <h2>Mentee Sprints</h2>
              <p>
                Note: UI needs work, refer to this{" "}
                <a
                  href="https://github.com/mikhael28/paretOS/issues/9"
                  rel="noopener"
                  target="_blank"
                >
                  GH Issue
                </a>
              </p>
              {sprints.map((sprint, i) => {
                let activeTeam;
                sprint.teams.forEach((team, index) => {
                  if (profile.id === team.id) {
                    activeTeam = team;
                  }
                });
                return (
                  <div className="block">
                    <p>
                      {activeTeam.fName}'s Completion: {activeTeam.percentage}%
                    </p>
                    <p>
                      {I18n.get("starts")}:{" "}
                      {new Date(sprint.startDate).getUTCMonth() + 1}/
                      {new Date(sprint.startDate).getUTCDate()}/
                      {new Date(sprint.startDate).getUTCFullYear()}
                      <br />
                      {I18n.get("finishes")}:{" "}
                      {new Date(sprint.endDate).getUTCMonth() + 1}/
                      {new Date(sprint.endDate).getUTCDate()}/
                      {new Date(sprint.endDate).getUTCFullYear()}
                    </p>
                    <Accordion allowMultipleExpanded allowZeroExpanded>
                      <AccordionItem>
                        <AccordionItemHeading>
                          <AccordionItemButton>
                            See Planning Entries
                          </AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>
                          {activeTeam.planning.map((plan, idx) => {
                            return (
                              <div key={idx}>
                                <h3>{plan.name}</h3>
                                <p>{plan.content}</p>
                              </div>
                            );
                          })}
                        </AccordionItemPanel>
                      </AccordionItem>
                    </Accordion>
                    <Accordion allowMultipleExpanded allowZeroExpanded>
                      <AccordionItem>
                        <AccordionItemHeading>
                          <AccordionItemButton>
                            See Review Entries
                          </AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>
                          {activeTeam.review.map((plan, idx) => {
                            return (
                              <div key={idx}>
                                <h3>{plan.name}</h3>
                                <p>{plan.content}</p>
                              </div>
                            );
                          })}
                        </AccordionItemPanel>
                      </AccordionItem>
                    </Accordion>
                  </div>
                );
              })}
            </div>
          ) : null}
        </React.Fragment>
      )}
    </div>
  );
}

export default Profile;
