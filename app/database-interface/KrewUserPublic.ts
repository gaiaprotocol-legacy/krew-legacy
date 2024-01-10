import { SoFiUserPublic } from "@common-module/social";

export default interface KrewUserPublic extends SoFiUserPublic {
  wallet_address?: string;
}
