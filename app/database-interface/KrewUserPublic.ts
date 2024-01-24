import { SocialUserPublic } from "@common-module/social";

export default interface KrewUserPublic extends SocialUserPublic {
  wallet_address?: string;
}
