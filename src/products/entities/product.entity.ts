
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, RelationId } from 'typeorm';
import { Category } from '../../categories/entities/category.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  "id": number;

  @Column()
  "name": string;

  @ManyToOne(() => Category, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'category_id' })
  "category": Category;

  @RelationId((product: Product) => product.category)
  "category_id": number;

  @Column('int')
  "price": number;

  @Column('int')
  "quantity": number;

  @Column({ nullable: true })
  "file_url"?: string;
}