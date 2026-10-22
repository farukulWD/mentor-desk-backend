import config from "../app/config";
import prisma from "../app/lib/prisma";
import { hashPassword } from "../app/utils/password";
import { Role, SubmissionStatus } from "../generated/prisma/enums";

const seedMentor = async () => {
  const { mentor_name, mentor_email, mentor_password } = config.seed;
  if (!mentor_email || !mentor_password) {
    throw new Error(
      "SEED_MENTOR_EMAIL and SEED_MENTOR_PASSWORD must be set to seed the mentor",
    );
  }

  const email = mentor_email.trim().toLowerCase();
  const mentor = await prisma.user.upsert({
    where: { email },
    update: { role: Role.MENTOR },
    create: {
      name: mentor_name,
      email,
      passwordHash: await hashPassword(mentor_password),
      role: Role.MENTOR,
    },
  });

  console.log(`Mentor ready: ${mentor.email}`);
  return mentor;
};

const DEMO_PASSWORD = "Student123";

const demoStudents = [
  { name: "Alice Student", email: "alice@mentordesk.dev" },
  { name: "Bob Student", email: "bob@mentordesk.dev" },
];

const seedDemo = async (mentorId: string) => {
  const passwordHash = await hashPassword(DEMO_PASSWORD);
  const [alice, bob] = await Promise.all(
    demoStudents.map((student) =>
      prisma.user.upsert({
        where: { email: student.email },
        update: {},
        create: { ...student, passwordHash, role: Role.STUDENT },
      }),
    ),
  );

  const reviewed = { reviewedById: mentorId, reviewedAt: new Date() };
  const submissions = [
    {
      projectName: "Task Tracker",
      repoUrl: "https://github.com/alice/task-tracker",
      liveUrl: "https://task-tracker.example.com",
      description: "A kanban style task tracker built with React and Express.",
      studentId: alice.id,
    },
    {
      projectName: "Weather App",
      repoUrl: "https://github.com/alice/weather-app",
      liveUrl: "https://weather-app.example.com",
      description: "Shows a five day forecast using the OpenWeather API.",
      status: SubmissionStatus.APPROVED,
      feedback: "Clean code and good error handling.",
      studentId: alice.id,
      ...reviewed,
    },
    {
      projectName: "Blog Platform",
      repoUrl: "https://github.com/bob/blog-platform",
      liveUrl: "https://blog-platform.example.com",
      description: "Markdown blog with authentication and comments.",
      status: SubmissionStatus.REJECTED,
      feedback: "Live link is broken and README lacks setup steps.",
      studentId: bob.id,
      ...reviewed,
    },
    {
      projectName: "Chat App",
      repoUrl: "https://github.com/bob/chat-app",
      liveUrl: "https://chat-app.example.com",
      description: "Realtime chat rooms using Socket.IO and Redis.",
      studentId: bob.id,
    },
  ];

  for (const submission of submissions) {
    await prisma.submission.upsert({
      where: { repoUrl: submission.repoUrl },
      update: {},
      create: {
        ...submission,
        projectNameKey: submission.projectName.toLowerCase(),
      },
    });
  }

  console.log(
    `Demo data ready: ${demoStudents.length} students (password ${DEMO_PASSWORD}), ${submissions.length} submissions`,
  );
};

const main = async () => {
  const mentor = await seedMentor();
  if (process.env.SEED_DEMO === "true") await seedDemo(mentor.id);
};

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
