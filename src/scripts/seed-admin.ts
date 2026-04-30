import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { Category } from '../categories/entities/category.entity';

const adminUsername = process.env.ADMIN_USERNAME ?? 'admin';
const adminPassword = process.env.ADMIN_PASSWORD ?? 'admin1234';

async function seed() {
  const dataSource = new DataSource({
    type: 'sqlite',
    database: 'db.sqlite',
    entities: [User, Product, Category],
    synchronize: true,
  });

  await dataSource.initialize();

  const usersRepo = dataSource.getRepository(User);
  const existing = await usersRepo.findOneBy({ username: adminUsername });
  if (existing) {
    await dataSource.destroy();
    return;
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);
  const entity = usersRepo.create({
    username: adminUsername,
    password_hash: passwordHash,
    role: 'admin',
  });
  await usersRepo.save(entity);
  await dataSource.destroy();
}

seed().catch((err) => {
  process.exitCode = 1;
  console.error(err);
});
