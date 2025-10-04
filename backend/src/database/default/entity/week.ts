import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { BaseTimestamp } from "./baseTimestamp";
import Shift from "./shift";

@Entity()
export default class Week extends BaseTimestamp {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "date", unique: true })
  startDate: string;

  @Column({ type: "date" })
  endDate: string;

  @Column({ default: false })
  isPublished: boolean;

  @Column({ type: "timestamptz", nullable: true })
  publishedAt?: Date | null;

  @OneToMany(() => Shift, (shift) => shift.week)
  shifts: Shift[];
}
