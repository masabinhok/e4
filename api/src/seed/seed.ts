import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { AppModule } from 'src/app.module';
import { Opening, Status } from 'src/openings/schemas/opening.schema';
import { Variation } from 'src/variations/schema/variation.schema';
import { User } from 'src/users/schema/user.schema';
import { Role } from 'src/roles/roles.enum';
import { loadCourses } from './courses';

// Idempotent. Course lines are upserted by (code, title) and kept in file order.
// Seeded lines that were removed from the files are deleted; lines that users
// contributed (they have a contributor) are never touched.
async function seed() {
  const courses = loadCourses();
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error'],
  });
  const openingModel = app.get<Model<Opening>>(getModelToken(Opening.name));
  const variationModel = app.get<Model<Variation>>(
    getModelToken(Variation.name),
  );
  const userModel = app.get<Model<User>>(getModelToken(User.name));

  for (const { lines, ...course } of courses) {
    const ids: unknown[] = [];
    for (const [order, line] of lines.entries()) {
      const doc = await variationModel.findOneAndUpdate(
        {
          code: course.code,
          title: line.title,
          contributor: { $exists: false },
        },
        {
          title: line.title,
          description: line.description,
          moves: line.moves,
          notes: line.notes,
          chapter: line.chapter,
          officialName: line.officialName,
          order,
          boardflip: course.side,
          code: course.code,
          status: Status.Accepted,
        },
        { upsert: true, new: true },
      );
      ids.push(doc._id);
    }

    const stale = await variationModel.deleteMany({
      code: course.code,
      contributor: { $exists: false },
      _id: { $nin: ids },
    });
    const contributed = await variationModel
      .find({
        code: course.code,
        contributor: { $exists: true },
        status: Status.Accepted,
      })
      .distinct('_id');

    await openingModel.updateOne(
      { code: course.code },
      {
        $set: {
          name: course.name,
          description: course.description,
          summary: course.summary,
          keyIdeas: course.keyIdeas,
          side: course.side,
          status: Status.Accepted,
          variations: [...ids, ...contributed],
        },
      },
      { upsert: true },
    );
    console.log(
      `seeded ${course.code}: ${lines.length} lines` +
        (stale.deletedCount ? `, removed ${stale.deletedCount} old` : ''),
    );
  }

  const { SEED_ADMIN_EMAIL: email, SEED_ADMIN_PASSWORD: password } =
    process.env;
  if (email && password) {
    await userModel.updateOne(
      { email },
      {
        $set: { role: Role.Admin, passHash: await bcrypt.hash(password, 10) },
        $setOnInsert: { fullName: 'Admin' },
      },
      { upsert: true },
    );
    console.log(`admin ready: ${email}`);
  }

  await app.close();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
