import { Institution } from "../models/Institution";

export class InstitutionMapper {
  static toDomain(raw: any): Institution {
    return new Institution({
      id: raw.id,
      name: raw.name,
      domain: raw.domain,
      deletedAt: raw.deletedAt,
    });
  }
}