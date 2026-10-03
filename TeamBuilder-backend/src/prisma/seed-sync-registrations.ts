import 'dotenv/config';
import { prisma } from '../db/db.js';

function displayNameFromEmail(email: string) {
  const local = email.split('@')[0] || email;
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

async function main() {
  const registrations = await prisma.registeredUser.findMany();
  const emails = Array.from(
    new Set(registrations.map((r) => r.userEmail.trim().toLowerCase())),
  );

  let created = 0;
  let existing = 0;

  for (const email of emails) {
    const reg = registrations.find(
      (r) => r.userEmail.trim().toLowerCase() === email,
    );
    if (!reg) continue;

    const found = await prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
    });

    if (found) {
      if (!found.isEmailVerified) {
        await prisma.user.update({
          where: { id: found.id },
          data: { isEmailVerified: true },
        });
      }
      existing += 1;
      continue;
    }

    await prisma.user.create({
      data: {
        name: displayNameFromEmail(reg.userEmail),
        email: reg.userEmail.trim().toLowerCase(),
        isEmailVerified: true,
      },
    });
    created += 1;
  }

  console.log(
    JSON.stringify(
      {
        totalRegistrations: registrations.length,
        uniqueEmails: emails.length,
        usersCreated: created,
        usersAlreadyExisted: existing,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
