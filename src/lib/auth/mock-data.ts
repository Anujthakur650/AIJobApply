export type MockUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  headline: string;
  avatarInitials: string;
  location: string;
  role: "candidate" | "admin";
};

export const demoUser: MockUser = {
  id: "user_demo",
  name: "Ava Candidate",
  email: "demo@aijobapply.com",
  password: "password123",
  headline: "Product-focused Full-Stack Engineer",
  avatarInitials: "AC",
  location: "Remote • North America",
  role: "candidate",
};
