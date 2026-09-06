import { ComponentType } from "react";
import { LucideProps } from "lucide-react";

export type IconComponent = ComponentType<LucideProps>;

export interface Address {
  label: string;
  address: string;
}

export interface ProfileUser {
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  addresses?: Address[];
}

export interface Profile extends ProfileUser {
  user?: ProfileUser;
  created_at?: string;
}

export interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface Tab {
  id: string;
  label: string;
  icon: IconComponent;
  path: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}
