import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { AppModule } from 'src/app.module';
import { Opening, Status } from 'src/openings/schemas/opening.schema';
import { Variation } from 'src/variations/schema/variation.schema';
import { User } from 'src/users/schema/user.schema';
import { Role } from 'src/roles/roles.enum';
import { openings } from './openings';

// Idempotent: upserts by opening code and variation (code, title).
async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error'],
  });
  const openingModel = app.get<Model<Opening>>(getModelToken(Opening.name));
  const variationModel = app.get<Model<Variation>>(
    getModelToken(Variation.name),
  );
  const userModel = app.get<Model<User>>(getModelToken(User.name));

  for (const { variations, ...opening } of openings) {
    const ids: unknown[] = [];
    for (const v of variations) {
      const doc = await variationModel.findOneAndUpdate(
        { code: opening.code, title: v.title },
        { ...v, code: opening.code, status: Status.Accepted },
        { upsert: true, new: true },
      );
      ids.push(doc._id);
    }
    await openingModel.updateOne(
      { code: opening.code },
      {
        $set: { ...opening, status: Status.Accepted },
        $addToSet: { variations: { $each: ids } },
      },
      { upsert: true },
    );
    console.log(`seeded ${opening.code} (${variations.length} lines)`);
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
