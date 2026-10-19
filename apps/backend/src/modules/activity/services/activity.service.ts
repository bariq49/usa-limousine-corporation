import { Inject, Injectable } from "@nestjs/common";
import { ActivityRepository } from "../repositories/activity.repository";
import type { Create, List, Owner } from "../types/activity";

@Injectable()
export class ActivityService {
  constructor(
    @Inject(ActivityRepository)
    private readonly repository: ActivityRepository,
  ) {}

  record(input: Create) {
    return this.repository.create(input);
  }

  list(params: List) {
    return this.repository.list(params);
  }

  removeByOwner(params: Owner) {
    return this.repository.removeByOwner(params);
  }
}
