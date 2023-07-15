import Link from "next/link";
import { PropsWithChildren, ReactElement, ReactNode } from "react";
import { BsArrowUpRight } from "react-icons/bs";

type Props = PropsWithChildren;

type ExperienceType = {
  orgName: string;
  orgHref: string;
  position: string;
  from: string;
  to: string;
  desc: ReactNode;
  techStack: string[];
};

const MyExperience: ExperienceType[] = [
  {
    orgName: "SigNoz Inc.",
    orgHref: "https://signoz.io/",
    position: "Freelance Open Source Contributor",
    from: "April 2022",
    to: "Present",
    desc: (
      <>
        Signoz is an open-source observability platform that helps engineers
        monitor and troubleshoot complex distributed systems.
        <br/>
        As a developer with SigNoz, I developed pages such as <span className="text-primary-400">&ldquo;/pricing&rdquo;</span>, <span className="text-primary-400">&ldquo;/team&rdquo;</span>, <span className="text-primary-400">&ldquo;/enterprise&rdquo;</span>, and many more...
      </>
    ),
    techStack: ["React.js", "Docusaurus"],
  },
  {
    orgName: "Digipie Technologies LLP.",
    orgHref: "https://digipie.net/",
    position: "React Developer",
    from: "Dec 2022",
    to: "Present",
    desc: (
      <>
        <ul>
          <li className="ml-5 mb-2 list-disc">
            Developed project/feature with Javascript stack ReactJS, Redux,
            Redux-thunk, NextJS for frontend and NestJS, ExpressJS, NodeJS for
            backend, and also used databases both relational and non-relational
            such as MongoDB, and PostgreSQL.
          </li>
          <li className="ml-5 mb-2 list-disc">
            Developed high-quality, secure, and reliable feature/functionality
            according to the client’s requirements and delivered to the client
            on time.
          </li>
          <li className="ml-5 mb-2 list-disc">
            The current Project consists of redux-observable with high-level
            coding structure patterns and easily accessible directory and file
            structure.{" "}
          </li>
        </ul>
      </>
    ),
    techStack: ["React.js", "Next.js", "Node.js", "MongoDB"],
  },
  {
    orgName: "Finlogic Technologies India Pvt. Ltd.",
    orgHref: "https://njtechnologies.in/",
    position: "Senior Executive, Fullstack Developer",
    from: "May 2022",
    to: "Nov 2022",
    desc: (
      <>
        <ul>
          <li className="ml-5 mb-2 list-disc">
            Develop and Support the SPRING MVC and REST Application in
            association with other Team Members
          </li>
          <li className="ml-5 mb-2 list-disc">
            Develop a REACT Application and Integrated it with the REST API
            according to client requirements given by the system analyst.
          </li>
          <li className="ml-5 mb-2 list-disc">
            The current Project consists of microservice architecture with React
            as a Front-end application & spring boot as a backend service with a
            centralized Postgres database.
          </li>
        </ul>
      </>
    ),
    techStack: ["React.js", "Java", "Spring Boot", "SQL", "Postgres", "MySQL"],
  },
  {
    orgName: "Finlogic Technologies India Pvt. Ltd.",
    orgHref: "https://njtechnologies.in/",
    position: "Fullstack Developer - Intern",
    from: "Jan 2022",
    to: "Apr 2022",
    desc: (
      <>
        <ul>
          <li className="ml-5 mb-2 list-disc">
            During this internship, I learned how to develop front and back end
            with java technologies, HTML5, CSS3, JS (ES6), and AJAX. Apart from
            frontend and backend development, I learned SQL & PL/SQL, how to
            create views, functions, procedures, triggers for particular table
            events, etc.
          </li>
          <li className="ml-5 mb-2 list-disc">
            Developed Functionality for Teacher/Metor module to Modify And
            Insert Dynamic Questions for Exams with ease and integrated Rich
            text editor.
          </li>
          <li className="ml-5 mb-2 list-disc">
            Worked on UI/UX development in JSP, and React. Worked on various
            sections on Admin and User Modules.
          </li>
        </ul>
      </>
    ),
    techStack: ["JSP", "Java", "Spring MVC", "SQL/PL-SQL", "MySQL"],
  },
];

export default function Experience({ children }: Props) {
  return (
    <section className="my-8">
      <h2 className="text-3xl font-bold text-white font-space mb-4">
        Experience
      </h2>
      <div className="relative pl-5 py-10 flex flex-col after:content-[''] after:absolute after:w-[1px] after:h-full after:bg-slate-100 after:top-0">
        {MyExperience.map((experience) => (
          <div
            key={experience.position}
            className="pl-10 relative mb-10 last-of-type:mb-0 group"
          >
            <span className="absolute w-5 h-5 rounded-full border-2 bg-current top-7 -left-2.5 group-hover:text-primary-500 group-hover:border-primary-500 transition z-20" />
            <Link
              href={experience.orgHref}
              className=""
              rel="noopener noreferrer nofollow"
              target="_blank"
            >
              <p className="font-space">
                {experience.from} - {experience.to}
              </p>
              <h3 className="text-xl text-white font-space mb-0 group-hover:text-primary-500 transition">
                {experience.orgName} <BsArrowUpRight className="inline-block" />
              </h3>
            </Link>
            <p className="font-space">{experience.position}</p>
            <p className="font-space my-1">
              {experience.techStack.map((tech) => (
                <small
                  key={tech}
                  className="flex-inline rounded-full bg-slate-400/20 px-2 py-1 text-xs mr-3"
                >
                  {tech}
                </small>
              ))}
            </p>
            <div className="font-space">{experience.desc}</div>
          </div>
        ))}
        <p className="mb-2 font-space"></p>
      </div>
    </section>
  );
}
