import { compare, hash } from "bcryptjs";

const HASH_ROUNDS = 12;

export const hashPassword = async (value: string) => {
  return hash(value, HASH_ROUNDS);
};

export const verifyPassword = async (value: string, hashed: string) => {
  if (!hashed) {
    return false;
  }

  return compare(value, hashed);
};
