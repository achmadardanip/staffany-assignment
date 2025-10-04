import { DeleteResult, FindManyOptions, FindOneOptions, FindOptionsWhere, getRepository } from "typeorm";
import moduleLogger from "../../../shared/functions/logger";
import Week from "../entity/week";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";

const logger = moduleLogger("weekRepository");

export const find = async (opts?: FindManyOptions<Week>): Promise<Week[]> => {
  logger.info("Find weeks");
  const repository = getRepository(Week);
  return repository.find(opts);
};

export const findOne = async (
  where?: FindOptionsWhere<Week>,
  opts?: FindOneOptions<Week>
): Promise<Week | undefined> => {
  logger.info("Find week");
  const repository = getRepository(Week);
  return repository.findOne({
    where,
    ...opts,
  });
};

export const findById = async (
  id: string,
  opts?: FindOneOptions<Week>
): Promise<Week | undefined> => {
  logger.info("Find week by id");
  const repository = getRepository(Week);
  return repository.findOne({
    where: { id },
    ...opts,
  });
};

export const create = async (payload: Partial<Week>): Promise<Week> => {
  logger.info("Create week");
  const repository = getRepository(Week);
  const entity = repository.create(payload);
  return repository.save(entity);
};

export const updateById = async (
  id: string,
  payload: QueryDeepPartialEntity<Week>
): Promise<Week> => {
  logger.info("Update week by id");
  const repository = getRepository(Week);
  await repository.update(id, payload);
  return (await findById(id)) as Week;
};

export const deleteById = async (id: string | string[]): Promise<DeleteResult> => {
  logger.info("Delete week");
  const repository = getRepository(Week);
  return repository.delete(id);
};
