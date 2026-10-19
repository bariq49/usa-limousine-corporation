import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { SubscriptionInterval } from "@prisma/client";
import type { CreateDto } from "../dto/create.dto";
import type { QueryDto } from "../dto/query.dto";
import type { UpdateDto } from "../dto/update.dto";
import { PlanRepository } from "../repositories/plan.repository";
import type { UpdateData } from "../types/plan";

@Injectable()
export class PlanService {
  constructor(@Inject(PlanRepository) private readonly plans: PlanRepository) {}

  findAll(query: QueryDto) {
    return this.plans.findMany(query);
  }

  async findById(id: string) {
    const plan = await this.plans.findById(id);
    if (!plan) {
      throw new NotFoundException("Subscription plan not found");
    }
    return plan;
  }

  async create(body: CreateDto) {
    const features = body.features.map((feature) => feature.trim()).filter(Boolean);
    if (features.length === 0) {
      throw new BadRequestException("features must include at least one item");
    }

    return this.plans.create({
      audience: body.audience,
      name: body.name.trim(),
      description: body.description?.trim() ? body.description.trim() : null,
      interval: body.interval ?? SubscriptionInterval.MONTH,
      amount: body.amount,
      tripsPerMonth: body.tripsPerMonth === undefined ? null : body.tripsPerMonth,
      features,
      freeMonths: body.freeMonths ?? 0,
      freeDays: body.freeDays ?? 0,
      graceDays: body.graceDays ?? 3,
      isPopular: body.isPopular ?? false,
      isActive: body.isActive ?? true,
      sortOrder: body.sortOrder ?? 0,
    });
  }

  async update(id: string, body: UpdateDto) {
    const existing = await this.plans.findById(id);
    if (!existing) {
      throw new NotFoundException("Subscription plan not found");
    }

    const data: UpdateData = {};
    if (body.name !== undefined) {
      data.name = body.name.trim();
    }
    if (body.description !== undefined) {
      data.description = body.description === null ? null : body.description.trim() || null;
    }
    if (body.interval !== undefined) {
      data.interval = body.interval;
    }
    if (body.amount !== undefined) {
      data.amount = body.amount;
    }
    if (body.tripsPerMonth !== undefined) {
      data.tripsPerMonth = body.tripsPerMonth;
    }
    if (body.features !== undefined) {
      const features = body.features.map((feature) => feature.trim()).filter(Boolean);
      if (features.length === 0) {
        throw new BadRequestException("features must include at least one item");
      }
      data.features = features;
    }
    if (body.freeMonths !== undefined) {
      data.freeMonths = body.freeMonths;
    }
    if (body.freeDays !== undefined) {
      data.freeDays = body.freeDays;
    }
    if (body.graceDays !== undefined) {
      data.graceDays = body.graceDays;
    }
    if (body.isPopular !== undefined) {
      data.isPopular = body.isPopular;
    }
    if (body.isActive !== undefined) {
      data.isActive = body.isActive;
    }
    if (body.sortOrder !== undefined) {
      data.sortOrder = body.sortOrder;
    }

    return this.plans.update(id, data);
  }

  async remove(id: string) {
    const existing = await this.plans.findById(id);
    if (!existing) {
      throw new NotFoundException("Subscription plan not found");
    }

    const references = await this.plans.countReferences(id);
    if (references > 0) {
      throw new BadRequestException(
        "Subscription plan cannot be deleted because it is used by subscriptions",
      );
    }

    return this.plans.delete(id);
  }
}
