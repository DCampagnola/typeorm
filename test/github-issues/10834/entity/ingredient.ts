import {DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn} from "../../../../src";
import {User} from "./user";

@Entity({
    name: "ingredient",
})
export class Ingredient {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, { nullable: true, eager: true, onDelete: 'SET NULL' })
    author?: User;

    @DeleteDateColumn({ nullable: true, type: 'timestamptz' })
    deletedAt?: Date;
}
